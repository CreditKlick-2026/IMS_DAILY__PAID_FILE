const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  // Fix: convert string "null" to actual SQL NULL in assigned_grid column
  const res = await pool.query(`
    UPDATE master_client 
    SET assigned_grid = NULL 
    WHERE assigned_grid = 'null'
    RETURNING id, name, product_type, assigned_grid
  `);
  console.log(`Fixed ${res.rowCount} rows:`);
  for (const r of res.rows) {
    console.log(`  [${r.id}] ${r.name} | ${r.product_type} | assigned_grid is now: ${r.assigned_grid}`);
  }
  pool.end();
}
run().catch(console.error);
