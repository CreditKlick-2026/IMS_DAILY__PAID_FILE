const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add columns to incentive_plan
    console.log('Adding grid_data and formula to incentive_plan...');
    await client.query(`
      ALTER TABLE incentive_plan 
      ADD COLUMN IF NOT EXISTS grid_data JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS formula TEXT DEFAULT '';
    `);
    
    await client.query('COMMIT');
    console.log('Successfully updated database schema.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
