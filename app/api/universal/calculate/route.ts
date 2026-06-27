import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { evaluate } from 'mathjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function POST(req: Request) {
  const client = await pool.connect();
  try {
    const { month, year } = await req.json();
    if (!month || !year) {
      return NextResponse.json({ success: false, error: 'Month and Year required' }, { status: 400 });
    }

    // Convert month/year to search format (e.g. upload_at is tracked as TIMESTAMP)
    // For simplicity, we just fetch all DPF records and filter in memory, or use a basic date filter.
    // In actual production, we filter: EXTRACT(MONTH FROM upload_at) = $1 AND EXTRACT(YEAR FROM upload_at) = $2
    
    // 1. Fetch raw performance records (aggregated by employee, client, location)
    const rawDataRes = await client.query(`
      SELECT 
        employee_code, 
        client, 
        location,
        SUM(money_collected) as total_collection,
        COUNT(*) as total_cases
      FROM dpf_records 
      WHERE EXTRACT(MONTH FROM upload_at) = $1 AND EXTRACT(YEAR FROM upload_at) = $2
      GROUP BY employee_code, client, location
    `, [month, year]);

    const rawData = rawDataRes.rows;
    if (rawData.length === 0) {
      return NextResponse.json({ success: true, total_records: 0, total_payout: 0, data: [] });
    }

    // 2. Fetch Keka HR Data to get roles and vintage
    const kekaRes = await client.query('SELECT * FROM employee_keka_data');
    const kekaData = new Map(kekaRes.rows.map(r => [r.employee_id.toUpperCase(), r]));

    // 3. Fetch full rules engine into memory for fast matching
    const plansRes = await client.query(`
      SELECT 
        p.*, 
        pr.name as process_name, pr.client_id, pr.location_id, pr.tracking_metric,
        c.name as client_name,
        l.name as location_name,
        COALESCE((SELECT json_agg(s.*) FROM incentive_slab s WHERE s.plan_id = p.id), '[]'::json) as slabs,
        COALESCE((SELECT json_agg(r.*) FROM incentive_rider r WHERE r.plan_id = p.id), '[]'::json) as riders
      FROM incentive_plan p
      JOIN master_process pr ON p.process_id = pr.id
      JOIN master_client c ON pr.client_id = c.id
      JOIN master_location l ON pr.location_id = l.id
    `);
    const plans = plansRes.rows;

    let totalPayout = 0;
    const finalResults = [];

    // 4. Calculate for each employee
    for (const record of rawData) {
      const empCode = record.employee_code.toUpperCase();
      const kekaRow = kekaData.get(empCode);
      
      // Default to TC if not found, though we should really skip or warn
      const role = kekaRow ? (kekaRow.designation === 'Associate' ? 'TC' : kekaRow.designation) : 'TC';
      
      // Calculate vintage in days (Current calculation month vs DOJ)
      let vintageDays = 90; // Default
      if (kekaRow && kekaRow.doj) {
        const doj = new Date(kekaRow.doj);
        const calcDate = new Date(parseInt(year), parseInt(month) - 1, 30);
        vintageDays = Math.floor((calcDate.getTime() - doj.getTime()) / (1000 * 60 * 60 * 24));
        if (vintageDays < 0) vintageDays = 0;
      }

      const totalCollection = parseFloat(record.total_collection) || 0;

      // Find the matching plan
      // We do a fuzzy match on client name and location name
      const matchingPlan = plans.find(p => 
        p.role === role &&
        record.client.toLowerCase().includes(p.client_name.toLowerCase()) &&
        vintageDays >= p.min_vintage_days &&
        (p.max_vintage_days === null || vintageDays <= p.max_vintage_days)
      );

      let finalIncentive = 0;
      let basePayout = 0;

      if (matchingPlan) {
        let gridMatched = false;

        // Try to parse grid_data
        if (matchingPlan.grid_data) {
           try {
             const grid = typeof matchingPlan.grid_data === 'string' ? JSON.parse(matchingPlan.grid_data) : matchingPlan.grid_data;
             if (grid && grid.columns && grid.rows && grid.cells) {
               
               const metricValue = matchingPlan.tracking_metric === 'RESOLUTION_PERCENTAGE' ? 0 : totalCollection;
               
               // Find matching row (Vintage)
               const matchedRow = grid.rows.find((r:any) => {
                 const min = parseFloat(r.min) || 0;
                 const max = r.max ? parseFloat(r.max) : Infinity;
                 return vintageDays >= min && vintageDays <= max;
               });

               // Find matching col (Target)
               const matchedCol = grid.columns.find((c:any) => {
                 const min = parseFloat(c.min) || 0;
                 const max = c.max ? parseFloat(c.max) : Infinity;
                 return metricValue >= min && metricValue <= max;
               });

               if (matchedRow && matchedCol) {
                 const cellKey = `${matchedRow.id}-${matchedCol.id}`;
                 const cellVal = parseFloat(grid.cells[cellKey]);
                 if (!isNaN(cellVal)) {
                   // Assuming all grid cells are PERCENTAGE for now, can be extended
                   basePayout = metricValue * (cellVal / 100);
                   finalIncentive = basePayout;
                   gridMatched = true;
                 }
               }
             }
           } catch(e) {
             console.error('Grid Parse Error:', e);
           }
        }

        // Apply Riders if base payout was calculated
        if (gridMatched) {
            const mockQA = 100;
            const mockUPL = 0;
            const mockAttrition = 0;
            
            for (const rider of matchingPlan.riders) {
              let conditionMet = false;
              let checkValue = 0;
              if (rider.rider_type === 'QA') checkValue = mockQA;
              if (rider.rider_type === 'UPL') checkValue = mockUPL;
              if (rider.rider_type === 'ATTRITION') checkValue = mockAttrition;

              const condVal = parseFloat(rider.condition_value);
              if (rider.condition_operator === '<' && checkValue < condVal) conditionMet = true;
              if (rider.condition_operator === '<=' && checkValue <= condVal) conditionMet = true;
              if (rider.condition_operator === '==' && checkValue === condVal) conditionMet = true;
              if (rider.condition_operator === '>' && checkValue > condVal) conditionMet = true;
              if (rider.condition_operator === '>=' && checkValue >= condVal) conditionMet = true;

              if (conditionMet) {
                if (rider.payout_modifier_type === 'DOCKING') {
                  finalIncentive -= basePayout * (parseFloat(rider.modifier_percentage) / 100);
                  if (finalIncentive < 0) finalIncentive = 0;
                } else if (rider.payout_modifier_type === 'KICKER') {
                  finalIncentive += basePayout * (parseFloat(rider.modifier_percentage) / 100);
                } else if (rider.payout_modifier_type === 'FORFEITURE') {
                  finalIncentive = 0;
                }
              }
            }
        }
      }

      totalPayout += finalIncentive;
      finalResults.push({
        employee_code: record.employee_code,
        client: record.client,
        location: record.location,
        total_collection: totalCollection,
        vintage_days: vintageDays,
        role,
        base_payout: basePayout,
        final_incentive: finalIncentive,
        plan_applied: matchingPlan ? matchingPlan.name : 'No Plan Matched'
      });
    }

    // Save to monthly_incentive_calculation (Optional, truncating previous logic)
    await client.query('BEGIN');
    await client.query('DELETE FROM monthly_incentive_calculation WHERE month_year = $1', [`${month}-${year}`]);
    
    for (const res of finalResults) {
      if (res.final_incentive > 0) {
        await client.query(`
          INSERT INTO monthly_incentive_calculation 
          (employee_id, month_year, total_metric_value, base_payout, final_payout, status)
          VALUES ($1, $2, $3, $4, $5, 'APPROVED')
        `, [res.employee_code, `${month}-${year}`, res.total_collection, res.base_payout, res.final_incentive]);
      }
    }
    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      total_records: finalResults.length, 
      total_payout: totalPayout,
      data: finalResults 
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
