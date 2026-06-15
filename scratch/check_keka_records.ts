import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query(`SELECT count(*) FROM employee_keka_data`);
  console.log('Total Keka Records:', res.rows[0].count);
  
  const recent = await pool.query(`SELECT employee_id, name, updated_at FROM employee_keka_data ORDER BY updated_at DESC LIMIT 5`);
  console.log('Recent Keka Records:', recent.rows);
  
  process.exit(0);
}
run();
