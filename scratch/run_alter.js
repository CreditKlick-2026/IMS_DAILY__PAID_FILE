require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query('ALTER TABLE associate_tenured_grid ADD COLUMN IF NOT EXISTS process_id INTEGER;');
        await pool.query('ALTER TABLE associate_vintage_grid ADD COLUMN IF NOT EXISTS process_id INTEGER;');
        await pool.query('ALTER TABLE leadership_grid ADD COLUMN IF NOT EXISTS process_id INTEGER;');
        await pool.query('ALTER TABLE special_grid_rules ADD COLUMN IF NOT EXISTS process_id INTEGER;');
        console.log('Tables altered successfully.');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
