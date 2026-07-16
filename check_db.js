const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  try {
    const kekaCount = await pool.query('SELECT COUNT(*) FROM employee_keka_data');
    console.log('Total Keka Employees:', kekaCount.rows[0].count);

    const kekaLocCount = await pool.query("SELECT COUNT(*) FROM employee_keka_data WHERE LOWER(location) = 'uttam nagar'");
    console.log('Keka Employees in Uttam Nagar:', kekaLocCount.rows[0].count);

    const dpfCount = await pool.query('SELECT COUNT(*) FROM dpf_records');
    console.log('Total DPF Records:', dpfCount.rows[0].count);

    // Let's see what is in dpf_records for Uttam Nagar
    const dpfUttam = await pool.query(`
      SELECT COUNT(*) 
      FROM dpf_records d
      LEFT JOIN employee_keka_data k ON d.employee_code = k.employee_id
      WHERE LOWER(k.location) = 'uttam nagar'
    `);
    console.log('DPF Records for Uttam Nagar employees:', dpfUttam.rows[0].count);

    // Let's check how many unique employees have DPF records
    const uniqueDpf = await pool.query('SELECT COUNT(DISTINCT employee_code) FROM dpf_records');
    console.log('Unique Employees with DPF records:', uniqueDpf.rows[0].count);
    
    // Group by location in Keka
    const byLoc = await pool.query('SELECT location, COUNT(*) as count FROM employee_keka_data GROUP BY location');
    console.log('Keka Employees by Location:', byLoc.rows);
    
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkDB();
