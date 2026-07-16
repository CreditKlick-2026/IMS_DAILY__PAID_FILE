const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  try {
    const dates = await pool.query(`
      SELECT upload_at, COUNT(*) 
      FROM dpf_records 
      WHERE LOWER(client) = 'axis'
      GROUP BY upload_at
    `);
    console.log('Axis upload dates:', dates.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkDB();
