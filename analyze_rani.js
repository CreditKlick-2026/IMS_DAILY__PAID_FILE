require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ims_db'
});

async function analyzeRani() {
    try {
        const res = await pool.query("SELECT * FROM keka_data WHERE employee_code = 'IMSA250279' OR employee_code = 'IMSA 250279'");
        console.log("Keka Data for Rani:", res.rows);

        const res2 = await pool.query("SELECT * FROM dpf_data WHERE employee_code = 'IMSA250279' OR employee_code = 'IMSA 250279'");
        console.log("DPF Data for Rani:", res2.rows);

        const res3 = await pool.query("SELECT * FROM dpf_data WHERE employee_name ILIKE '%Rani%'");
        console.log("Other Rani DPF:", res3.rows.map(r => ({emp: r.employee_code, name: r.employee_name, coll: r.total_money_collected, client: r.client})));
        
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
analyzeRani();
