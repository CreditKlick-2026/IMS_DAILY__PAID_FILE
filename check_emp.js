require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const keka = await pool.query("SELECT * FROM employee_keka_data WHERE employee_id = 'IMS10993'");
  console.log('Keka Data:', keka.rows[0]);
  process.exit(0);
}
check();
