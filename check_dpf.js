const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/ims_dpf_june'
});

async function check() {
  const res = await pool.query(`
    SELECT employee_name, SUM(CAST(NULLIF(regexp_replace(money_collected::text, '[^0-9.]', '', 'g'), '') AS NUMERIC)) as col
    FROM dpf_records 
    WHERE location ILIKE '%uttam nagar%'
    GROUP BY employee_name
  `);
  console.log("Employees in DPF for Uttam Nagar:", res.rows.length);
  
  const total = res.rows.reduce((acc, r) => acc + (parseFloat(r.col) || 0), 0);
  console.log("Total Collection in DPF for Uttam Nagar:", total);
  
  pool.end();
}

check();
