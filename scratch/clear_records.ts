import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Deleting all records from dpf_records...');
    await pool.query('TRUNCATE TABLE dpf_records CASCADE;');
    
    console.log('Deleting all upload history from upload_jobs...');
    await pool.query('TRUNCATE TABLE upload_jobs CASCADE;');

    console.log('All records deleted successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
