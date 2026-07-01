import { NextResponse } from 'next/server';
import * as fs_promises from 'fs/promises';
import * as path from 'path';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getSession() {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('auth_session')?.value;
    if (!sessionStr) return null;
    try {
        return JSON.parse(sessionStr);
    } catch (e) {
        return null;
    }
}

// Associate Fixed Slab Logic (0-3 Months)
function getAssociateFixedIncentive(collection: number, monthOfVintage: number, grid: any[]) {
    for (const rule of grid) {
        if (collection >= rule.target_collection) {
            if (monthOfVintage === 0) return parseFloat(rule.m0);
            if (monthOfVintage === 1) return parseFloat(rule.m1);
            if (monthOfVintage === 2) return parseFloat(rule.m2);
            if (monthOfVintage === 3) return parseFloat(rule.m3);
        }
    }
    return 0;
}

// Associate Percentage Slab Logic (>3 Months)
function getAssociateTenuredIncentivePercentage(collection: number, salary: number, grid: any[]) {
    for (const rule of grid) {
        if (collection >= rule.target_collection) {
            if (salary < 16000) return parseFloat(rule.under_16k) / 100;
            if (salary >= 16000 && salary < 18000) return parseFloat(rule.between_16_18k) / 100;
            if (salary >= 18000 && salary < 24000) return parseFloat(rule.between_18_24k) / 100;
            return parseFloat(rule.over_24k) / 100;
        }
    }
    return 0;
}

// Leadership Incentive Percentage Slab Logic
function getLeadershipIncentivePercentage(teamCollection: number, role: string, grid: any[]) {
    let fixedMultiplier = 1;
    if (role === 'ATL') fixedMultiplier = 5;
    else if (role === 'TL') fixedMultiplier = 9;
    else if (role === 'AM') fixedMultiplier = 30;

    for (const rule of grid) {
        if (rule.role === role && teamCollection >= rule.target_collection * fixedMultiplier) {
            return parseFloat(rule.incentive_percentage) / 100;
        }
    }
    return 0;
}

function calculateVintageDays(doc: Date, currentCalcDate: Date) {
    const msDiff = currentCalcDate.getTime() - doc.getTime();
    return Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
}

function calculateAssociateIncentive(collection: number, salary: number, doc: Date | null, vintageMonths: number, associateVintageGrid: any[], associateTenuredGrid: any[]) {
    let traceData: any = null;
            let incentive = 0;
            let incentivePercent = 0;

    if (doc) {
        let slabMonth = -1;
        if (vintageMonths <= 30) slabMonth = 0;
        else if (vintageMonths <= 60) slabMonth = 1;
        else if (vintageMonths <= 90) slabMonth = 2;
        else if (vintageMonths <= 120) slabMonth = 3;

        if (slabMonth !== -1) {
            incentive = getAssociateFixedIncentive(collection, slabMonth, associateVintageGrid);
            incentivePercent = (collection > 0) ? incentive / collection : 0;
        } else {
            incentivePercent = getAssociateTenuredIncentivePercentage(collection, salary, associateTenuredGrid);
            incentive = collection * incentivePercent;
        }
    } else {
        incentivePercent = getAssociateTenuredIncentivePercentage(collection, salary || 25000, associateTenuredGrid);
        incentive = collection * incentivePercent;
    }
    
    return { incentive, incentivePercent };
}


function parseGrid2Value(val: any): number | null {
    if (val === '-' || val === '' || val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const clean = val.replace(/,/g, '').replace(/[<>]/g, '').trim();
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
    }
    return null;
}

function getGrid2IncentivePercent(collection: number, client: string, product: string, vintageDays: number, associateSlabs: any[]) {
    const normalizedClient = client.toLowerCase().replace('bank', '').trim();
    const normalizedProduct = product.toLowerCase();

    const matchingSlabs = associateSlabs.filter(slab => {
        const sc = String(slab.client || '').toLowerCase().replace('bank', '').trim();
        const sp = String(slab.product || '').toLowerCase();
        return sc.includes(normalizedClient) && sp.includes(normalizedProduct);
    });

    if (matchingSlabs.length === 0) return 0;

    let bestPayout = 0;

    for (const slab of matchingSlabs) {
        const v = String(slab.vintage || '').trim();
        if (v.includes('<90') && vintageDays >= 90) continue;
        if (v.includes('>91') && vintageDays <= 90) continue;

        let minStr = String(slab.min || '').trim();
        let maxStr = String(slab.max || '').trim();
        let minNum = parseGrid2Value(minStr);
        let maxNum = parseGrid2Value(maxStr);

        let match = true;

        if (minStr.includes('<')) {
            if (minNum !== null && collection >= minNum) match = false;
        } else if (minStr.includes('>')) {
            if (minNum !== null && collection <= minNum) match = false;
        } else if (minNum !== null) {
            if (collection < minNum) match = false;
        }

        if (maxStr.includes('<')) {
            if (maxNum !== null && collection >= maxNum) match = false;
        } else if (maxStr.includes('>')) {
            if (maxNum !== null && collection <= maxNum) match = false;
        } else if (maxNum !== null) {
            if (collection > maxNum) match = false;
        }

        if (match) {
            const payout = parseFloat(slab.payout_pct) / 100 || 0;
            if (payout > bestPayout) bestPayout = payout;
        }
    }

    return bestPayout;
}

export async function getIncentiveData(req: Request, forcedLocation?: string) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const conditions: string[] = [];
        const queryParams: any[] = [];

        // Base filter: no duplicates
        conditions.push(`(is_duplicate = FALSE OR is_duplicate IS NULL)`);

        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // Determine the calculation boundary date
        const now = new Date();
        let currentCalcDate = new Date();
        if (month && year) {
            conditions.push(`EXTRACT(MONTH FROM upload_at) = $${queryParams.length + 1}`);
            queryParams.push(month);
            conditions.push(`EXTRACT(YEAR FROM upload_at) = $${queryParams.length + 1}`);
            queryParams.push(year);

            const isCurrentMonth = (now.getMonth() + 1).toString() === month && now.getFullYear().toString() === year;
            if (!isCurrentMonth) {
                // End of the selected month
                currentCalcDate = new Date(parseInt(year), parseInt(month), 0);
            }
        } else {
            // Default to the end of the PREVIOUS month (since data is typically from previous month)
            currentCalcDate = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        if (forcedLocation) {
            conditions.push(`r.location = $${queryParams.length + 1}`);
            queryParams.push(forcedLocation);
        }

        // Complex Filters from Live Records
        const multiMatchFilters = [
            'employee_code', 'product', 'bucket', 'location',
            'aph', 'ph', 'client', 'tl_name', 'employee_name'
        ];

        multiMatchFilters.forEach(key => {
            if (key === 'location' && forcedLocation) return; // Skip location if forcedLocation is set
            const vals = searchParams.getAll(key);
            if (vals.length > 0) {
                conditions.push(`r.${key} = ANY($${queryParams.length + 1})`);
                queryParams.push(vals);
            }
        });

        const outMin = searchParams.get('outMin');

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // 1. Fetch Master Data from Keka
        const kekaRes = await pool.query(`SELECT * FROM employee_keka_data`);
        const kekaEmployees = kekaRes.rows;

        // 1.5 Fetch All Grid Rules
        const [gridRes, tenuredRes, vintageRes, leadershipRes] = await Promise.all([
            pool.query(`SELECT * FROM special_grid_rules ORDER BY target_collection DESC`),
            pool.query(`SELECT * FROM associate_tenured_grid ORDER BY target_collection DESC`),
            pool.query(`SELECT * FROM associate_vintage_grid ORDER BY target_collection DESC`),
            pool.query(`SELECT * FROM leadership_grid ORDER BY target_collection DESC`)
        ]);

        const specialGridRules = gridRes.rows.map(r => ({
            target_collection: parseFloat(r.target_collection),
            incentive_percentage: parseFloat(r.incentive_percentage) / 100 // divide by 100 to get decimal e.g. 3.25 -> 0.0325
        }));
        const associateTenuredGrid = tenuredRes.rows;
        const associateVintageGrid = vintageRes.rows;
        const leadershipGrid = leadershipRes.rows;

        // 1.6 Fetch required_columns and assigned_grid from master_client
        const clientParam = searchParams.get('client');
        const productParam = searchParams.get('product');
        let requiredColumns = [];
        let assignedGrid = null;

        let grid2Data: any = { associateSlabs: [], riders: [] };
        try {
            const fileData = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_2.json'), 'utf-8');
            grid2Data = JSON.parse(fileData);
        } catch (e) { /* grid2 not available */ }

        if (clientParam && productParam) {
            const clientConfigRes = await pool.query(
                `SELECT required_columns, assigned_grid FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1`,
                [clientParam, productParam]
            );
            if (clientConfigRes.rows.length > 0) {
                assignedGrid = clientConfigRes.rows[0].assigned_grid || null;
                if (clientConfigRes.rows[0].required_columns) {
                    const raw = clientConfigRes.rows[0].required_columns;
                    requiredColumns = Array.isArray(raw) ? raw : JSON.parse(raw);
                }
            }
        }

        // 2. Fetch individual collections from DPF
        let queryText = `
      SELECT 
          r.employee_code, 
          r.employee_name,
          r.tl_name,
          r.am as am_name,
          r.aph,
          r.ph,
          r.client,
          r.location,
          r.product,
          r.bucket,
          r.payment_mode,
          STRING_AGG(DISTINCT r.cm, ', ') as cm,
          STRING_AGG(DISTINCT r.mobile_no, ', ') as mobile_no,
          STRING_AGG(DISTINCT r.account_no, ', ') as lan,
          COUNT(r.id) as total_records, 
          COALESCE(SUM(CAST(NULLIF(regexp_replace(r.money_collected::text, '[^0-9.]', '', 'g'), '') AS NUMERIC)), 0) as total_money_collected
      FROM dpf_records r
      ${whereClause}
      GROUP BY r.employee_code, r.employee_name, r.tl_name, r.am, r.aph, r.ph, r.client, r.location, r.product, r.bucket, r.payment_mode
    `;

        const res = await pool.query(queryText, queryParams);
        const individualCollections = res.rows;

        // 3. Pre-calculate Team Collections and Headcounts
        const tlTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};
        const amTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};
        const associateTotalData: Record<string, number> = {};

        individualCollections.forEach(row => {
            const coll = parseFloat(row.total_money_collected);

            // Match TL exactly as per Keka/DPF mapping
            if (row.tl_name) {
                const tl = row.tl_name.toLowerCase().trim();
                if (!tlTeamData[tl]) tlTeamData[tl] = { collection: 0, headcount: new Set() };
                tlTeamData[tl].collection += coll;
                if (row.employee_code) tlTeamData[tl].headcount.add(row.employee_code);
            }

            // Match AM
            if (row.am_name) {
                const am = row.am_name.toLowerCase().trim();
                if (!amTeamData[am]) amTeamData[am] = { collection: 0, headcount: new Set() };
                amTeamData[am].collection += coll;
                if (row.employee_code) amTeamData[am].headcount.add(row.employee_code);
            }
            if (row.employee_code) {
                associateTotalData[row.employee_code] = (associateTotalData[row.employee_code] || 0) + coll;
            }
        });

        // 3.5 Inject missing AMs and TLs who have 0 personal collections
        const filterLocs = searchParams.getAll('location');
        const existingEmpCodes = new Set(individualCollections.map(r => r.employee_code).filter(Boolean));
        for (const emp of kekaEmployees) {
            if (filterLocs.length > 0 && !filterLocs.includes(emp.location)) continue;
            if (!existingEmpCodes.has(emp.employee_id)) {
                const nameKey = emp.name?.toLowerCase().trim() || '';
                const firstName = nameKey.split(' ')[0];
                const rawDesig = (emp.designation || '').toLowerCase();
                
                const isAM = rawDesig.includes('manager') || rawDesig === 'am' || Object.keys(amTeamData).some(am => nameKey.includes(am) || am.includes(firstName));
                const isTL = rawDesig.includes('leader') || rawDesig === 'tl' || rawDesig === 'atl' || Object.keys(tlTeamData).some(tl => nameKey.includes(tl) || tl.includes(firstName));
                
                if (isAM || isTL) {
                    individualCollections.push({
                        employee_code: emp.employee_id,
                        employee_name: emp.name,
                        tl_name: emp.tl_name || '—',
                        am_name: emp.am_name || '—',
                        aph: emp.aph || '—',
                        ph: emp.ph || '—',
                        client: emp.client || '—',
                        location: emp.location || '—',
                        product: emp.product || '—',
                        bucket: emp.bucket || '—',
                        total_money_collected: 0
                    });
                }
            }
        }

        // 4. Calculate Incentives
        const calculatedResults = [];

        // Use individuals from DPF (plus injected AMs/TLs)
        for (const record of individualCollections) {
            const empCode = record.employee_code;
            const collection = parseFloat(record.total_money_collected) || 0;
            const empName = record.employee_name;

            const kekaData = kekaEmployees.find(e => e.employee_id === empCode);
            const rawDesignation = (kekaData?.designation || '').toLowerCase();
            const doc = kekaData?.doc ? new Date(kekaData.doc) : null;
            const salary = kekaData?.salary ? parseFloat(kekaData.salary) : 0;

            let designation = rawDesignation || 'associate';
            const nameKey = empName?.toLowerCase().trim() || '';
            const firstName = nameKey.split(' ')[0];

            // Only infer if not explicitly set (ATL is considered a form of TL, so we don't overwrite it)
            const isKekaLeader = rawDesignation.includes('leader') || rawDesignation === 'tl' || rawDesignation === 'atl';
            const isKekaManager = rawDesignation.includes('manager') || rawDesignation === 'am';

            if (rawDesignation === 'atl' || rawDesignation.includes('assistant team leader')) {
                designation = 'atl';
            } else if (isKekaManager) {
                designation = 'am';
            } else if (isKekaLeader) {
                designation = 'tl';
            } else {
                designation = 'associate';
            }
            if (outMin && !isNaN(Number(outMin)) && collection < Number(outMin)) {
                if (!designation.includes('manager') && designation !== 'am' && !designation.includes('leader') && designation !== 'tl' && designation !== 'atl') {
                    continue; // Skip associates under min, but AM/TL still get team incentive
                }
            }

            let incentive = 0;
            let incentivePercent = 0;
            let individualIncentiveAmount = 0;
            let teamIncentiveAmount = 0;
            let vintageMonths = 0;
            let pcp = 0;
            let teamCollection = 0;
            let teamHeadcount = 0;

            if (doc) {
                vintageMonths = calculateVintageDays(doc, currentCalcDate);
            } else {
                vintageMonths = 999;
            }

            if (designation === 'atl') {
                const tlKeyMatch = Object.keys(tlTeamData).find(tl => nameKey.includes(tl) || tl.includes(firstName));
                const tlKey = tlKeyMatch || '';
                const tlData = tlTeamData[tlKey] || { collection: 0, headcount: new Set() };
                teamCollection = tlData.collection;
                teamHeadcount = tlData.headcount.size || 1;
                pcp = teamCollection / teamHeadcount;
            } else if (designation.includes('leader') || designation === 'tl') {
                const tlKeyMatch = Object.keys(tlTeamData).find(tl => nameKey.includes(tl) || tl.includes(firstName));
                const tlKey = tlKeyMatch || '';
                const tlData = tlTeamData[tlKey] || { collection: 0, headcount: new Set() };
                teamCollection = tlData.collection;
                teamHeadcount = tlData.headcount.size || 1;
                pcp = teamCollection / teamHeadcount;
            } else if (designation.includes('manager') || designation === 'am') {
                const amKeyMatch = Object.keys(amTeamData).find(am => nameKey.includes(am) || am.includes(firstName));
                const amKey = amKeyMatch || '';
                const amData = amTeamData[amKey] || { collection: 0, headcount: new Set() };
                teamCollection = amData.collection;
                teamHeadcount = amData.headcount.size || 1;
                pcp = teamCollection / teamHeadcount;
            }

            if (kekaData?.is_special) {
                incentivePercent = 0;
                const totalEmployeeCollection = associateTotalData[record.employee_code] || collection;
                for (const rule of specialGridRules) {
                    if (totalEmployeeCollection >= rule.target_collection) {
                        incentivePercent = rule.incentive_percentage;
                        break; // Because it's ordered DESC, first match is the highest applicable
                    }
                }
                
                individualIncentiveAmount = collection * incentivePercent;
                incentive = individualIncentiveAmount;
            } else if (designation === 'atl') {
                const teamIncentivePercent = getLeadershipIncentivePercentage(teamCollection, 'ATL', leadershipGrid);
                teamIncentiveAmount = teamCollection * teamIncentivePercent;

                const totalEmployeeCollection = associateTotalData[record.employee_code] || collection;
                const { incentive: indInc, incentivePercent: indIncPct } = calculateAssociateIncentive(
                    totalEmployeeCollection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                );
                individualIncentiveAmount = collection * indIncPct;

                incentive = teamIncentiveAmount + individualIncentiveAmount;
                // For reporting, we can either blend the percent or just show team percent. 
                // Showing team percent is standard for ATL display, but the amount will be higher.
                incentivePercent = teamIncentivePercent; 

            } else if (designation.includes('leader') || designation === 'tl') {
                // Team Leader Logic
                incentivePercent = getLeadershipIncentivePercentage(teamCollection, 'TL', leadershipGrid);
                teamIncentiveAmount = teamCollection * incentivePercent;
                incentive = teamIncentiveAmount;

            } else if (designation.includes('manager') || designation === 'am') {
                // Assistant Manager Logic
                incentivePercent = getLeadershipIncentivePercentage(teamCollection, 'AM', leadershipGrid);
                teamIncentiveAmount = teamCollection * incentivePercent;
                
                let matchedTarget = 0;
                for (const rule of leadershipGrid) {
                    if (rule.role === 'AM' && teamCollection >= rule.target_collection * 30) {
                        matchedTarget = Number(rule.target_collection);
                        break;
                    }
                }
                
                let additionalAmount = 0;
                if (matchedTarget == 235000) additionalAmount = teamIncentiveAmount * 0.10;
                else if (matchedTarget == 240000) additionalAmount = teamIncentiveAmount * 0.15;
                else if (matchedTarget == 250000) additionalAmount = teamIncentiveAmount * 0.20;
                else if (matchedTarget >= 275000) additionalAmount = teamIncentiveAmount * 0.25;

                incentive = teamIncentiveAmount + additionalAmount;

            } else {
                // Associate Logic
                const totalEmployeeCollection = associateTotalData[record.employee_code] || collection;
                if (!assignedGrid || assignedGrid === 'unassigned') {
                    incentivePercent = 0;
                    individualIncentiveAmount = 0;
                    incentive = 0;
                } else if (assignedGrid === 'grid_2') {
                    incentivePercent = getGrid2IncentivePercent(totalEmployeeCollection, record.client, record.product, vintageMonths, grid2Data.associateSlabs || []);
                    individualIncentiveAmount = collection * incentivePercent;
                    incentive = individualIncentiveAmount;
                } else {
                    const associateData = calculateAssociateIncentive(
                        totalEmployeeCollection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                    );
                    incentivePercent = associateData.incentivePercent;
                    individualIncentiveAmount = collection * incentivePercent;
                    incentive = individualIncentiveAmount;
                }
            }

            calculatedResults.push({
                employee_code: record.employee_code,
                employee_name: record.employee_name,
                tl_name: record.tl_name,
                am_name: record.am_name,
                aph: record.aph,
                client: record.client,
                ph: record.ph,
                location: record.location,
                product: record.product,
                bucket: record.bucket,
                payment_mode: record.payment_mode,
                designation: designation.toUpperCase(), // expose inferred
                doc: kekaData?.doc || null,
                vintage: vintageMonths,
                salary: salary,
                total_collection: collection,
                team_collection: teamCollection,
                team_headcount: teamHeadcount,
                pcp: pcp,
                incentive_percent: (incentivePercent * 100).toFixed(2) + '%',
                incentive: incentive,
                individual_incentive: individualIncentiveAmount,
                team_incentive: teamIncentiveAmount,
                is_special: kekaData?.is_special || false,
                cm: record.cm,
                mobile_no: record.mobile_no,
                lan: record.lan
            });
        }

        // 5. Apply Group By from UI
        const groupByParam = searchParams.get('groupBy') || 'ph';
        const allowedGroupBy = ['ph', 'tl_name', 'employee_name', 'employee_code', 'client', 'location', 'product', 'bucket'];
        const groupBy = allowedGroupBy.includes(groupByParam) ? groupByParam : 'ph';

        const groupedData: Record<string, any> = {};

        for (const res of calculatedResults) {
            let groupKey = res[groupBy as keyof typeof res] as string;
            if (!groupKey) groupKey = 'Unknown_' + Math.random().toString(36).substr(2, 9);

            if (!groupedData[groupKey]) {
                groupedData[groupKey] = {
                    employee_id: res.employee_code || groupKey,
                    name: res.employee_name || groupKey,
                    total_records: 0,
                    total_collection: 0,
                    incentive: 0,
                    individual_incentive: 0,
                    team_incentive: 0,
                    // Additional fields for detail view
                    designation: res.designation,
                    vintage: res.vintage,
                    salary: res.salary,
                    team_collection: 0,
                    pcp: 0,
                    incentive_percent: res.incentive_percent,
                    tl_name: res.tl_name,
                    am_name: res.am_name,
                    aph: res.aph,
                    ph: res.ph,
                    bucket: res.bucket,
                    payment_mode: res.payment_mode
                };
            }

            groupedData[groupKey].total_records += 1;
            groupedData[groupKey].total_collection += res.total_collection;
            groupedData[groupKey].incentive += res.incentive;
            groupedData[groupKey].individual_incentive += (res.individual_incentive || 0);
            groupedData[groupKey].team_incentive += (res.team_incentive || 0);

            // If grouped by employee, keep precise details
            if (groupBy === 'employee_code' || groupBy === 'employee_name') {
                groupedData[groupKey].team_collection = res.team_collection;
                groupedData[groupKey].pcp = res.pcp;
                groupedData[groupKey].team_headcount = res.team_headcount;
                groupedData[groupKey].vintage = res.vintage;
                groupedData[groupKey].salary = res.salary;
                groupedData[groupKey].is_special = res.is_special;
                groupedData[groupKey].tl_name = res.tl_name;
                groupedData[groupKey].am_name = res.am_name;
                groupedData[groupKey].aph = res.aph;
                groupedData[groupKey].ph = res.ph;
                groupedData[groupKey].bucket = res.bucket;
                groupedData[groupKey].payment_mode = res.payment_mode;
                groupedData[groupKey].cm = res.cm;
                groupedData[groupKey].mobile_no = res.mobile_no;
                groupedData[groupKey].lan = res.lan;
            }
        }

        const finalData = Object.values(groupedData).sort((a: any, b: any) => b.total_collection - a.total_collection);

        const filterableKeys = ['designation', 'location', 'client', 'product', 'bucket', 'payment_mode', 'ph', 'aph', 'am', 'tl_name', 'cm'];
        const activeFilters = filterableKeys.filter(k => requiredColumns.includes(k) || (k === 'am' && requiredColumns.includes('am_name')));

        return NextResponse.json({ 
            success: true, 
            data: finalData,
            column_config: requiredColumns, // keeping for backward compatibility if needed
            ui_config: {
                columns: requiredColumns,
                filters: activeFilters
            },
            assigned_grid: assignedGrid,
            grid2Slabs: assignedGrid === 'grid_2' ? (grid2Data.associateSlabs || []) : [],
            special_grid_rules: specialGridRules.map(r => ({ ...r, incentive_percentage: r.incentive_percentage * 100 })),
            associateTenuredGrid,
            associateVintageGrid,
            leadershipGrid
        });
    } catch (error) {
        console.error('Incentive Fetch Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch incentive data' }, { status: 500 });
    }
}

// Trigger rebuild
