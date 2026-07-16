const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  try {
    const byLoc = await pool.query('SELECT location, COUNT(*) as count FROM dpf_records GROUP BY location');
    console.log('DPF Records by Location:', byLoc.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkDB();
