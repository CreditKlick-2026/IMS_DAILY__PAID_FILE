require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT DISTINCT bucket FROM dpf_records WHERE client ILIKE '%Axis%'")
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => pool.end());
