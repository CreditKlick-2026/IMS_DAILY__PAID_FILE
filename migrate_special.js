require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
    await pool.query(`CREATE TABLE IF NOT EXISTS special_exceptions_grid (
        id SERIAL PRIMARY KEY,
        target_collection NUMERIC NOT NULL,
        incentive_percentage NUMERIC NOT NULL
    )`);
    const c = await pool.query('SELECT COUNT(*) FROM special_exceptions_grid');
    if (c.rows[0].count == 0) {
        await pool.query(`INSERT INTO special_exceptions_grid (target_collection, incentive_percentage) VALUES
        (400000, 4.00),
        (350000, 3.25)`);
        console.log('Inserted default special exceptions grid');
    }
    process.exit(0);
}
migrate();
