require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function initDB() {
    try {
        await pool.query('BEGIN');
        
        // associate_tenured_grid
        await pool.query(`CREATE TABLE IF NOT EXISTS associate_tenured_grid (
            id SERIAL PRIMARY KEY, target_collection NUMERIC NOT NULL, under_16k NUMERIC NOT NULL, 
            between_16_18k NUMERIC NOT NULL, between_18_24k NUMERIC NOT NULL, over_24k NUMERIC NOT NULL
        )`);
        const c1 = await pool.query('SELECT COUNT(*) FROM associate_tenured_grid');
        if (c1.rows[0].count == 0) {
            await pool.query(`INSERT INTO associate_tenured_grid (target_collection, under_16k, between_16_18k, between_18_24k, over_24k) VALUES
            (400000, 4.00, 4.00, 4.00, 4.00), (350000, 3.25, 3.25, 3.25, 3.25), (300000, 3.00, 3.00, 3.00, 0.00),
            (280000, 2.50, 2.50, 2.50, 0.00), (260000, 2.50, 2.50, 0.00, 0.00), (225000, 2.50, 0.00, 0.00, 0.00)`);
        }

        // associate_vintage_grid
        await pool.query(`CREATE TABLE IF NOT EXISTS associate_vintage_grid (
            id SERIAL PRIMARY KEY, target_collection NUMERIC NOT NULL, m0 NUMERIC NOT NULL, m1 NUMERIC NOT NULL, m2 NUMERIC NOT NULL, m3 NUMERIC NOT NULL
        )`);
        const c2 = await pool.query('SELECT COUNT(*) FROM associate_vintage_grid');
        if (c2.rows[0].count == 0) {
            await pool.query(`INSERT INTO associate_vintage_grid (target_collection, m0, m1, m2, m3) VALUES
            (400000, 16000, 16000, 16000, 16000), (350000, 10500, 10500, 10500, 10500), (300000, 9000, 9000, 9000, 9000),
            (250000, 7500, 7500, 7500, 7500), (200000, 6000, 5000, 4000, 4000), (175000, 5000, 3500, 3375, 2000),
            (150000, 4000, 2750, 2500, 1000), (100000, 3000, 1500, 500, 0), (75000, 2000, 500, 0, 0),
            (50000, 1000, 0, 0, 0), (25000, 500, 0, 0, 0)`);
        }

        // leadership_grid
        await pool.query(`CREATE TABLE IF NOT EXISTS leadership_grid (
            id SERIAL PRIMARY KEY, role VARCHAR(50) NOT NULL, target_collection NUMERIC NOT NULL, incentive_percentage NUMERIC NOT NULL
        )`);
        const c3 = await pool.query('SELECT COUNT(*) FROM leadership_grid');
        if (c3.rows[0].count == 0) {
            await pool.query(`INSERT INTO leadership_grid (role, target_collection, incentive_percentage) VALUES
            ('TL', 300000, 1.15), ('TL', 270000, 1.00), ('TL', 250000, 0.80), ('TL', 230000, 0.70), ('TL', 215000, 0.60), ('TL', 200000, 0.45),
            ('ATL', 400000, 1.39), ('ATL', 375000, 1.27), ('ATL', 350000, 1.20), ('ATL', 325000, 1.05), ('ATL', 300000, 0.80), ('ATL', 270000, 0.60),
            ('AM', 275000, 0.40), ('AM', 250000, 0.35), ('AM', 240000, 0.30), ('AM', 230000, 0.25), ('AM', 210000, 0.20), ('AM', 200000, 0.10)`);
        }

        await pool.query('COMMIT');
        console.log('Database tables successfully initialized.');
    } catch(err) {
        await pool.query('ROLLBACK');
        console.error(err);
    } finally {
        pool.end();
    }
}
initDB();
