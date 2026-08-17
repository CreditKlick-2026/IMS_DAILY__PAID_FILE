import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initializeRulesVersioningSchema } from '@/lib/dbRulesVersioning';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    await initializeRulesVersioningSchema();
    const versionsRes = await pool.query(`
      SELECT 
        rs.*,
        (SELECT COUNT(*) FROM rule_slabs WHERE rule_set_id = rs.id) as slab_count
      FROM rule_sets rs
      ORDER BY rs.created_at DESC
    `);

    const auditRes = await pool.query(`
      SELECT * FROM rule_audit_logs ORDER BY created_at DESC LIMIT 30
    `);

    return NextResponse.json({
      success: true,
      versions: versionsRes.rows,
      auditLogs: auditRes.rows
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    await initializeRulesVersioningSchema();
    const body = await req.json();
    const { action, versionCode, name, description, data } = body;

    if (action === 'create_snapshot') {
      const code = versionCode || `v${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}`;
      await client.query('BEGIN');
      
      // Deactivate other versions if marked active
      const insertRes = await client.query(`
        INSERT INTO rule_sets (name, grid_type, version_code, description, is_active)
        VALUES ($1, 'grid_1', $2, $3, TRUE)
        RETURNING id
      `, [name || `Rule Version ${code}`, code, description || 'Snapshot created by Admin']);
      
      const newId = insertRes.rows[0].id;
      await client.query('UPDATE rule_sets SET is_active = FALSE WHERE id != $1', [newId]);

      // Insert slabs
      if (data) {
        for (const row of data.associateTenured || []) {
          await client.query(`
            INSERT INTO rule_slabs (rule_set_id, slab_type, min_target, metadata)
            VALUES ($1, 'associateTenured', $2, $3)
          `, [newId, parseFloat(row.target_collection || 0), JSON.stringify(row)]);
        }
        for (const row of data.associateVintage || []) {
          await client.query(`
            INSERT INTO rule_slabs (rule_set_id, slab_type, min_target, metadata)
            VALUES ($1, 'associateVintage', $2, $3)
          `, [newId, parseFloat(row.target_collection || 0), JSON.stringify(row)]);
        }
        for (const row of data.leadership || []) {
          await client.query(`
            INSERT INTO rule_slabs (rule_set_id, slab_type, min_target, rate_percentage, metadata)
            VALUES ($1, 'leadership', $2, $3, $4)
          `, [newId, parseFloat(row.target_collection || 0), parseFloat(row.incentive_percentage || 0), JSON.stringify(row)]);
        }

        // Sync to JSON file for fallback
        const jsonPath = path.join(process.cwd(), 'data', 'master_grids.json');
        await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
      }

      await client.query(`
        INSERT INTO rule_audit_logs (version_code, change_type, new_data)
        VALUES ($1, 'CREATE_SNAPSHOT', $2)
      `, [code, JSON.stringify({ name, description })]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true, message: `Version ${code} published!`, versionId: newId });
    }

    if (action === 'rollback') {
      if (!versionCode) {
        return NextResponse.json({ success: false, error: 'versionCode required for rollback' }, { status: 400 });
      }

      await client.query('BEGIN');
      const targetRes = await client.query('SELECT * FROM rule_sets WHERE version_code = $1', [versionCode]);
      if (targetRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, error: 'Version not found' }, { status: 404 });
      }

      const targetId = targetRes.rows[0].id;
      await client.query('UPDATE rule_sets SET is_active = FALSE');
      await client.query('UPDATE rule_sets SET is_active = TRUE WHERE id = $1', [targetId]);

      // Reconstruct JSON from slabs
      const slabsRes = await client.query('SELECT * FROM rule_slabs WHERE rule_set_id = $1', [targetId]);
      const reconstructed: any = { associateTenured: [], associateVintage: [], leadership: [], specialExceptions: [] };
      slabsRes.rows.forEach(slab => {
        if (reconstructed[slab.slab_type]) {
          reconstructed[slab.slab_type].push(slab.metadata || {});
        }
      });

      const jsonPath = path.join(process.cwd(), 'data', 'master_grids.json');
      await fs.writeFile(jsonPath, JSON.stringify(reconstructed, null, 2), 'utf-8');

      await client.query(`
        INSERT INTO rule_audit_logs (version_code, change_type)
        VALUES ($1, 'ROLLBACK_ACTIVATED')
      `, [versionCode]);

      await client.query('COMMIT');
      return NextResponse.json({ success: true, message: `Successfully rolled back to ${versionCode}!` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
