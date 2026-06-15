import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT error_log FROM upload_jobs ORDER BY created_at DESC LIMIT 1;');
    if (res.rows.length > 0) {
      console.log('Latest Job Error Log:', JSON.stringify(res.rows[0].error_log, null, 2));
    } else {
      console.log('No jobs found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
