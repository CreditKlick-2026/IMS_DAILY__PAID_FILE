require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL + '?sslmode=require'
});

async function checkClient() {
    try {
        const res = await pool.query("SELECT * FROM master_client WHERE name = 'Sbi Recovery' AND product_type = 'Card'");
        console.log("Client config:", res.rows);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
checkClient();
