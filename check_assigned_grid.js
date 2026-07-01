const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  // Check all clients and their assigned_grid
  const res = await pool.query('SELECT id, name, product_type, assigned_grid FROM master_client ORDER BY name');
  console.log('\n=== ALL CLIENTS AND GRIDS ===');
  for (const r of res.rows) {
    console.log(`  [${r.id}] ${r.name} | ${r.product_type} | assigned_grid = "${r.assigned_grid}"`);
  }

  // Also check the exact query service.ts runs for Uttam Nagar clients
  const clients = ['CITI', 'Encore', 'Sbi Recovery'];
  for (const c of clients) {
    const r2 = await pool.query(
      `SELECT required_columns, assigned_grid FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1`,
      [c, 'Card']
    );
    const row = r2.rows[0];
    console.log(`\nQuery for "${c}/Card":`, row ? `assigned_grid="${row.assigned_grid}"` : 'NOT FOUND');
  }

  pool.end();
}
run().catch(console.error);
