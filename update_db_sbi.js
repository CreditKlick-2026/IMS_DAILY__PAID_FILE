const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // 1. Update Sbi Recovery
    await pool.query("UPDATE master_client SET assigned_grid = 'grid_3' WHERE name = 'Sbi Recovery' AND product_type = 'Card'");
    console.log("Updated Sbi Recovery");
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
