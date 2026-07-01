const { Pool } = require('pg'); 
require('dotenv').config({ path: '.env.local' }); 
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); 
pool.query("SELECT id, name, product_type, assigned_grid FROM master_client WHERE name='Sbi Recovery'")
.then(r => console.log(r.rows))
.catch(console.error)
.finally(() => process.exit());
