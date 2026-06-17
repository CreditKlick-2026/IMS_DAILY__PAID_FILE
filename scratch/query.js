const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:PaymentFileSystemIMS%23.2026@paymentfilesystemims.cd0ii8iysxip.ap-south-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'employee_keka_data'::regclass;")
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => pool.end());
