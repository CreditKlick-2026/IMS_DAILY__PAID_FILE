require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initUniversalDB() {
  try {
    await pool.query('BEGIN');

    console.log("Creating universal incentive system tables...");

    // 1. Master Locations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS master_location (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Master Clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS master_client (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Master Processes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS master_process (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES master_client(id) ON DELETE CASCADE,
        location_id INTEGER REFERENCES master_location(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        tracking_metric VARCHAR(100) NOT NULL, -- e.g., 'COLLECTION_AMOUNT', 'RESOLUTION_PERCENTAGE'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, location_id, name)
      )
    `);

    // 4. Incentive Plans
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incentive_plan (
        id SERIAL PRIMARY KEY,
        process_id INTEGER REFERENCES master_process(id) ON DELETE CASCADE,
        role VARCHAR(100) NOT NULL, -- 'TC', 'TL', 'AM'
        min_vintage_days INTEGER DEFAULT 0,
        max_vintage_days INTEGER, -- NULL means infinity
        effective_from DATE NOT NULL,
        effective_to DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Incentive Slabs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incentive_slab (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES incentive_plan(id) ON DELETE CASCADE,
        min_target NUMERIC NOT NULL,
        max_target NUMERIC, -- NULL means infinity
        payout_type VARCHAR(50) NOT NULL, -- 'PERCENTAGE', 'FIXED_AMOUNT'
        payout_value NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Incentive Riders (Docking and Kickers)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incentive_rider (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES incentive_plan(id) ON DELETE CASCADE,
        rider_type VARCHAR(100) NOT NULL, -- 'QA', 'UPL', 'ATTRITION_COUNT', 'TEAM_ELIGIBILITY'
        condition_operator VARCHAR(10) NOT NULL, -- '>=', '<', '=', etc.
        condition_value NUMERIC NOT NULL,
        payout_modifier_type VARCHAR(50) NOT NULL, -- 'DOCKING', 'KICKER', 'FORFEITURE'
        modifier_percentage NUMERIC NOT NULL, -- e.g., 70 (for docking to 70%), 10 (for +10% kicker), 0 (for forfeiture)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Monthly Calculations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS monthly_incentive_calculation (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(100) NOT NULL,
        month_year VARCHAR(20) NOT NULL, -- e.g., '05-2026'
        process_id INTEGER REFERENCES master_process(id) ON DELETE CASCADE,
        total_metric_value NUMERIC NOT NULL, -- Collection Amount or Reso %
        base_payout NUMERIC DEFAULT 0,
        final_payout NUMERIC DEFAULT 0,
        qa_score NUMERIC,
        upl_count INTEGER,
        attrition_count INTEGER,
        team_eligibility_percent NUMERIC,
        docking_applied BOOLEAN DEFAULT false,
        kicker_applied BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'APPROVED', 'FINALIZED'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query('COMMIT');
    console.log("Successfully initialized Universal Database Schema!");
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Error creating tables:", err);
  } finally {
    pool.end();
  }
}

initUniversalDB();
