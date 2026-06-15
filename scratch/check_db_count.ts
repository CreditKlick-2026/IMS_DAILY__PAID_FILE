import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const res = await pool.query('SELECT is_duplicate, COUNT(*) FROM dpf_records GROUP BY is_duplicate');
    console.log('dpf_records count by is_duplicate:', res.rows);
    
    const countRes = await pool.query('SELECT COUNT(*) FROM dpf_records');
    console.log('total dpf_records:', countRes.rows[0].count);
    
    const uploadRes = await pool.query('SELECT id, status, total_rows FROM upload_jobs ORDER BY created_at DESC LIMIT 5');
    console.log('recent upload jobs:', uploadRes.rows);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
