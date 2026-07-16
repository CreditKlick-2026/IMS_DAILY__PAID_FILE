require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkRavish() {
    try {
        const res = await pool.query("SELECT * FROM employee_keka_data WHERE employee_id = 'IMS2977'");
        console.log("Keka:", res.rows[0]);
        
        const res2 = await pool.query("SELECT * FROM dpf_records WHERE employee_code = 'IMS2977' LIMIT 1");
        console.log("DPF:", res2.rows[0]);
        
        const res3 = await pool.query("SELECT COUNT(*) FROM employee_keka_data WHERE tl_name ILIKE '%Imtiyaz%'");
        console.log("Keka TL Count:", res3.rows[0]);
        
        const res4 = await pool.query("SELECT DISTINCT employee_code, employee_name FROM dpf_records WHERE tl_name ILIKE '%Imtiyaz%'");
        console.log("Team Members (DPF):", res4.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
checkRavish();
