const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  try {
    const axisData = await pool.query(`
      SELECT 
        COUNT(*) as total_rows,
        COUNT(DISTINCT employee_code) as distinct_employees,
        SUM(money_collected) as total_collected
      FROM dpf_records 
      WHERE LOWER(client) = 'axis'
    `);
    console.log('Axis DPF Records:', axisData.rows[0]);

    const nullCollection = await pool.query(`
      SELECT COUNT(*) 
      FROM dpf_records 
      WHERE LOWER(client) = 'axis' AND (money_collected IS NULL OR money_collected = 0)
    `);
    console.log('Axis DPF Records with NULL/0 collection:', nullCollection.rows[0].count);

    // See a few sample rows
    const sample = await pool.query(`
      SELECT employee_code, employee_name, money_collected, payment_mode
      FROM dpf_records 
      WHERE LOWER(client) = 'axis'
      LIMIT 5
    `);
    console.log('Sample rows:', sample.rows);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkDB();
