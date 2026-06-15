import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM dpf_records WHERE is_duplicate = true;');
    const dupCount = countRes.rows[0].count;
    console.log(`Found ${dupCount} duplicate records.`);
    
    if (dupCount > 0) {
      console.log('Transferring all to live (setting is_duplicate = false)...');
      await pool.query('UPDATE dpf_records SET is_duplicate = false WHERE is_duplicate = true;');
      console.log('Update successful!');
    } else {
      console.log('No duplicate records found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
