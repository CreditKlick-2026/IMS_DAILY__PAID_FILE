require('dotenv').config({path: 'd:\\Office\\ims-dpf\\.env.local'});
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("--- TABLES IN DATABASE ---");
    console.table(res.rows);

    for (const row of res.rows) {
      const tableName = row.table_name;
      const countRes = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
      console.log(`Table: ${tableName} - ${countRes.rows[0].count} rows`);
      
      // Print first 2 rows for context
      const sample = await pool.query(`SELECT * FROM "${tableName}" LIMIT 2`);
      if (sample.rows.length > 0) {
        console.log(`Sample from ${tableName}:`);
        console.log(JSON.stringify(sample.rows, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
