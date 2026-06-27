import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.*, 
        pr.name as process_name, pr.tracking_metric,
        c.name as client_name,
        l.name as location_name,
        COALESCE(
          (SELECT json_agg(s.*) FROM incentive_slab s WHERE s.plan_id = p.id),
          '[]'::json
        ) as slabs,
        COALESCE(
          (SELECT json_agg(r.*) FROM incentive_rider r WHERE r.plan_id = p.id),
          '[]'::json
        ) as riders
      FROM incentive_plan p
      LEFT JOIN master_process pr ON p.process_id = pr.id
      LEFT JOIN master_client c ON pr.client_id = c.id
      LEFT JOIN master_location l ON pr.location_id = l.id
      ORDER BY p.id DESC
    `);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const body = await req.json();
    const { process_id, role, min_vintage_days, max_vintage_days, effective_from, effective_to, slabs, riders, grid_data, formula } = body;
    
    if (!process_id || !role || !effective_from) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Insert Plan
    const planRes = await client.query(
      `INSERT INTO incentive_plan (process_id, role, min_vintage_days, max_vintage_days, effective_from, effective_to, grid_data, formula) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [process_id, role, min_vintage_days, max_vintage_days, effective_from, effective_to, grid_data || '{}', formula || '']
    );
    const planId = planRes.rows[0].id;

    // Insert Slabs (if they still use them, else fallback)
    if (slabs && slabs.length > 0) {
      for (const slab of slabs) {
        await client.query(
          `INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value)
           VALUES ($1, $2, $3, $4, $5)`,
          [planId, slab.min_target, slab.max_target || null, slab.payout_type, slab.payout_value]
        );
      }
    }

    // Insert Riders
    if (riders && riders.length > 0) {
      for (const rider of riders) {
        await client.query(
          `INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [planId, rider.rider_type, rider.condition_operator, rider.condition_value, rider.payout_modifier_type, rider.modifier_percentage]
        );
      }
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: planRes.rows[0] });
  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    
    // Cascades delete to slabs and riders due to ON DELETE CASCADE
    await pool.query('DELETE FROM incentive_plan WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
