import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query(`SELECT id, status, job_type, created_at, upload_at FROM upload_jobs WHERE EXTRACT(MONTH FROM COALESCE(upload_at, created_at)) = 6 AND EXTRACT(YEAR FROM COALESCE(upload_at, created_at)) = 2026 ORDER BY created_at DESC LIMIT 10`);
  console.log(res.rows);
  process.exit(0);
}
run();
