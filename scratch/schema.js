const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:PaymentFileSystemIMS%23.2026@paymentfilesystemims.cd0ii8iysxip.ap-south-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'employee_keka_data'`);
    console.log(res.rows.map(r => r.column_name));

    // Try adding the columns just in case
    await pool.query(`ALTER TABLE employee_keka_data ADD COLUMN IF NOT EXISTS am_name text`);
    await pool.query(`ALTER TABLE employee_keka_data ADD COLUMN IF NOT EXISTS tl_name text`);
    console.log("Added columns successfully");
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
