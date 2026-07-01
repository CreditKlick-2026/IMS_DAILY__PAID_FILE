require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("SELECT required_columns FROM master_client WHERE name = 'Axis'").then(res => {
  console.log(res.rows[0].required_columns);
  process.exit(0);
});
