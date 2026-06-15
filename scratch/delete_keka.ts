import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await pool.query(`TRUNCATE TABLE employee_keka_data`);
  console.log('Successfully deleted all records from employee_keka_data table.');
  process.exit(0);
}
run();
