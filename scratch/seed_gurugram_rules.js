const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Clearing old master data...');
    await client.query('DELETE FROM master_location');
    await client.query('DELETE FROM master_client');
    await client.query('DELETE FROM master_process');
    await client.query('DELETE FROM incentive_plan');

    console.log('Inserting Location...');
    const locRes = await client.query("INSERT INTO master_location (name) VALUES ('Gurugram') RETURNING id");
    const locId = locRes.rows[0].id;

    console.log('Inserting Clients...');
    const clients = ['Axis Bank', 'SBI Cards', 'Encore ARC', 'IIFL HF'];
    const clientIds = {};
    for (const c of clients) {
      const res = await client.query("INSERT INTO master_client (name) VALUES ($1) RETURNING id", [c]);
      clientIds[c] = res.rows[0].id;
    }

    console.log('Inserting Processes...');
    const processes = [
      { name: 'Axis BAU', client: 'Axis Bank', metric: 'COLLECTION_AMOUNT' },
      { name: 'SBI Woff BAU', client: 'SBI Cards', metric: 'COLLECTION_AMOUNT' },
      { name: 'Encore BAU', client: 'Encore ARC', metric: 'COLLECTION_AMOUNT' },
      { name: 'Home Loans (Shakti)', client: 'IIFL HF', metric: 'RESOLUTION_PERCENTAGE' }
    ];
    const procIds = {};
    for (const p of processes) {
      const res = await client.query(
        "INSERT INTO master_process (client_id, location_id, name, tracking_metric) VALUES ($1, $2, $3, $4) RETURNING id",
        [clientIds[p.client], locId, p.name, p.metric]
      );
      procIds[p.name] = res.rows[0].id;
    }

    console.log('Inserting Incentive Plans & Riders...');
    
    // 1. TC Axis BAU (0-90 Days)
    const p1 = await client.query(`
      INSERT INTO incentive_plan (process_id, role, min_vintage_days, max_vintage_days, effective_from)
      VALUES ($1, 'TC', 0, 90, '2026-01-01') RETURNING id
    `, [procIds['Axis BAU']]);
    
    await client.query("INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value) VALUES ($1, 100000, 150000, 'PERCENTAGE', 2.0)", [p1.rows[0].id]);
    await client.query("INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value) VALUES ($1, 150001, null, 'PERCENTAGE', 3.0)", [p1.rows[0].id]);
    
    // QA & UPL Riders
    await client.query("INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage) VALUES ($1, 'QA', '<', 85, 'DOCKING', 70)", [p1.rows[0].id]);
    await client.query("INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage) VALUES ($1, 'UPL', '>=', 2, 'DOCKING', 70)", [p1.rows[0].id]);

    // 2. TC Axis BAU (91+ Days)
    const p2 = await client.query(`
      INSERT INTO incentive_plan (process_id, role, min_vintage_days, max_vintage_days, effective_from)
      VALUES ($1, 'TC', 91, null, '2026-01-01') RETURNING id
    `, [procIds['Axis BAU']]);
    await client.query("INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value) VALUES ($1, 150000, 200000, 'PERCENTAGE', 2.0)", [p2.rows[0].id]);
    await client.query("INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value) VALUES ($1, 200001, null, 'PERCENTAGE', 3.5)", [p2.rows[0].id]);
    await client.query("INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage) VALUES ($1, 'QA', '<', 85, 'DOCKING', 70)", [p2.rows[0].id]);
    await client.query("INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage) VALUES ($1, 'UPL', '>=', 2, 'DOCKING', 70)", [p2.rows[0].id]);

    // 3. TL Axis BAU (Attrition Riders)
    // Using advanced formula instead of slabs for demonstration
    const tlFormula = "(TOTAL_COLLECTION * 0.005) + IF(TEAM_ELIGIBILITY > 70, 5000, 0)";
    const p3 = await client.query(`
      INSERT INTO incentive_plan (process_id, role, min_vintage_days, max_vintage_days, effective_from, formula)
      VALUES ($1, 'TL', 0, null, '2026-01-01', $2) RETURNING id
    `, [procIds['Axis BAU'], tlFormula]);
    
    await client.query("INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage) VALUES ($1, 'ATTRITION', '==', 0, 'KICKER', 10)", [p3.rows[0].id]);
    await client.query("INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage) VALUES ($1, 'ATTRITION', '==', 2, 'DOCKING', 70)", [p3.rows[0].id]);
    await client.query("INSERT INTO incentive_rider (plan_id, rider_type, condition_operator, condition_value, payout_modifier_type, modifier_percentage) VALUES ($1, 'ATTRITION', '>=', 3, 'FORFEITURE', 100)", [p3.rows[0].id]);

    // 4. IIFL HF (Resolution Percentage - Flat Amount Slabs)
    const p4 = await client.query(`
      INSERT INTO incentive_plan (process_id, role, min_vintage_days, max_vintage_days, effective_from)
      VALUES ($1, 'TC', 0, null, '2026-01-01') RETURNING id
    `, [procIds['Home Loans (Shakti)']]);
    
    await client.query("INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value) VALUES ($1, 89, 91, 'FLAT', 2000)", [p4.rows[0].id]);
    await client.query("INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value) VALUES ($1, 91.01, 93, 'FLAT', 5000)", [p4.rows[0].id]);
    await client.query("INSERT INTO incentive_slab (plan_id, min_target, max_target, payout_type, payout_value) VALUES ($1, 93.01, null, 'FLAT', 8000)", [p4.rows[0].id]);

    await client.query('COMMIT');
    console.log('SUCCESS! One-to-one integration completed based on Gurugram requirements.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
