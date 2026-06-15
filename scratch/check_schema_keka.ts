import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employee_keka_data'`);
  console.table(res.rows);
  process.exit(0);
}
run();
