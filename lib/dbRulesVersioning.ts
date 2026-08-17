import pool from './db';
import fs from 'fs/promises';
import path from 'path';

export async function initializeRulesVersioningSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS rule_sets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        grid_type VARCHAR(50) NOT NULL DEFAULT 'grid_1',
        version_code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        created_by VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rule_slabs (
        id SERIAL PRIMARY KEY,
        rule_set_id INTEGER REFERENCES rule_sets(id) ON DELETE CASCADE,
        slab_type VARCHAR(50) NOT NULL,
        min_target NUMERIC NOT NULL DEFAULT 0,
        max_target NUMERIC,
        salary_bracket VARCHAR(50),
        rate_percentage NUMERIC,
        fixed_amount NUMERIC,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rule_audit_logs (
        id SERIAL PRIMARY KEY,
        version_code VARCHAR(50) NOT NULL,
        changed_by VARCHAR(100) DEFAULT 'Admin',
        change_type VARCHAR(50) NOT NULL,
        old_data JSONB,
        new_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default version if empty
    const checkRes = await client.query('SELECT count(*) FROM rule_sets');
    if (parseInt(checkRes.rows[0].count) === 0) {
      const defaultVersion = 'v2026.08';
      const insertRes = await client.query(`
        INSERT INTO rule_sets (name, grid_type, version_code, description, is_active)
        VALUES ('Initial Master Grid 1 Plan', 'grid_1', $1, 'Active BPO Incentive Matrix for August 2026', TRUE)
        RETURNING id
      `, [defaultVersion]);

      const ruleSetId = insertRes.rows[0].id;
      const jsonPath = path.join(process.cwd(), 'data', 'master_grids.json');
      try {
        const raw = await fs.readFile(jsonPath, 'utf-8');
        const gridData = JSON.parse(raw);

        // Seed Tenured Slabs
        for (const row of gridData.associateTenured || []) {
          await client.query(`
            INSERT INTO rule_slabs (rule_set_id, slab_type, min_target, metadata)
            VALUES ($1, 'associateTenured', $2, $3)
          `, [ruleSetId, parseFloat(row.target_collection || 0), JSON.stringify(row)]);
        }

        // Seed Vintage Slabs
        for (const row of gridData.associateVintage || []) {
          await client.query(`
            INSERT INTO rule_slabs (rule_set_id, slab_type, min_target, metadata)
            VALUES ($1, 'associateVintage', $2, $3)
          `, [ruleSetId, parseFloat(row.target_collection || 0), JSON.stringify(row)]);
        }

        // Seed Leadership Slabs
        for (const row of gridData.leadership || []) {
          await client.query(`
            INSERT INTO rule_slabs (rule_set_id, slab_type, min_target, rate_percentage, metadata)
            VALUES ($1, 'leadership', $2, $3, $4)
          `, [ruleSetId, parseFloat(row.target_collection || 0), parseFloat(row.incentive_percentage || 0), JSON.stringify(row)]);
        }
      } catch (err) {
        console.error('Error seeding initial rule version:', err);
      }
    }
  } finally {
    client.release();
  }
}
