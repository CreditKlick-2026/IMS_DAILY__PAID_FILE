const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:PaymentFileSystemIMS%23.2026@paymentfilesystemims.cd0ii8iysxip.ap-south-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});
pool.query("SELECT * FROM employee_keka_data WHERE employee_id = 'IMS2977'")
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => pool.end());
