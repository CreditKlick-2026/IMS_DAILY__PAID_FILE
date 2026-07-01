const fs = require('fs');

// Read the restored route.ts as the base
let code = fs.readFileSync('app/api/incentives/route.ts', 'utf8').replace(/\r\n/g, '\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. Add fs/promises and path imports (after NextResponse import)
// ─────────────────────────────────────────────────────────────────────────────
code = code.replace(
  "import { NextResponse } from 'next/server';",
  "import { NextResponse } from 'next/server';\nimport fs_promises from 'fs/promises';\nimport path from 'path';"
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Add Grid 2 helpers before the main exported function
// ─────────────────────────────────────────────────────────────────────────────
const grid2Helpers = `
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

`;

// Insert helpers before `export async function GET`
code = code.replace('export async function GET', grid2Helpers + 'export async function GET');

// ─────────────────────────────────────────────────────────────────────────────
// 3. Add payment_mode to SQL SELECT and GROUP BY
// ─────────────────────────────────────────────────────────────────────────────
code = code.replace(
  '          r.bucket,\n          COUNT(r.id) as total_records,',
  '          r.bucket,\n          r.payment_mode,\n          COUNT(r.id) as total_records,'
);

code = code.replace(
  'GROUP BY r.employee_code, r.employee_name, r.tl_name, r.am, r.aph, r.ph, r.client, r.location, r.product, r.bucket',
  'GROUP BY r.employee_code, r.employee_name, r.tl_name, r.am, r.aph, r.ph, r.client, r.location, r.product, r.bucket, r.payment_mode'
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. Replace old required_columns block with new block that also fetches assigned_grid
//    and loads grid2 data
// ─────────────────────────────────────────────────────────────────────────────
const oldClientBlock = `        // 1.6 Fetch required_columns from master_client for selected client+product
        const clientParam = searchParams.get('client');
        const productParam = searchParams.get('product');
        let requiredColumns: string[] = [];
        if (clientParam && productParam) {
            const clientConfigRes = await pool.query(
                \`SELECT required_columns FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1\`,
                [clientParam, productParam]
            );
            if (clientConfigRes.rows.length > 0 && clientConfigRes.rows[0].required_columns) {
                const raw = clientConfigRes.rows[0].required_columns;
                requiredColumns = Array.isArray(raw) ? raw : JSON.parse(raw);
            }
        }`;

const newClientBlock = `        // 1.6 Fetch required_columns and assigned_grid from master_client
        const clientParam = searchParams.get('client');
        const productParam = searchParams.get('product');
        let requiredColumns: string[] = [];
        let assignedGrid: string | null = null;

        let grid2Data: any = { associateSlabs: [], riders: [] };
        try {
            const fileData = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_2.json'), 'utf-8');
            grid2Data = JSON.parse(fileData);
        } catch (e) {
            console.error('Failed to load grid 2 data:', e);
        }

        if (clientParam && productParam) {
            const clientConfigRes = await pool.query(
                \`SELECT required_columns, assigned_grid FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1\`,
                [clientParam, productParam]
            );
            if (clientConfigRes.rows.length > 0) {
                assignedGrid = clientConfigRes.rows[0].assigned_grid || null;
                if (clientConfigRes.rows[0].required_columns) {
                    const raw = clientConfigRes.rows[0].required_columns;
                    requiredColumns = Array.isArray(raw) ? raw : JSON.parse(raw);
                }
            }
        }`;

if (code.includes(oldClientBlock)) {
    code = code.replace(oldClientBlock, newClientBlock);
    console.log('✅ Replaced client block');
} else {
    console.log('❌ Could not find client block to replace');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Add unassigned guard + grid2 associate calculation
//    Replace the existing associate else block
// ─────────────────────────────────────────────────────────────────────────────
const oldAssociateBlock = `            } else {
                const associateData = calculateAssociateIncentive(
                    collection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                );
                individualIncentiveAmount = associateData.incentive;
                incentive = individualIncentiveAmount;
                incentivePercent = associateData.incentivePercent;
            }`;

const newAssociateBlock = `            } else {
                if (!assignedGrid || assignedGrid === 'unassigned' || assignedGrid === 'null') {
                    incentivePercent = 0;
                    individualIncentiveAmount = 0;
                    incentive = 0;
                } else if (assignedGrid === 'grid_2') {
                    incentivePercent = getGrid2IncentivePercent(collection, record.client, record.product, vintageMonths, grid2Data.associateSlabs || []);
                    individualIncentiveAmount = collection * incentivePercent;
                    incentive = individualIncentiveAmount;
                } else {
                    const associateData = calculateAssociateIncentive(
                        collection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                    );
                    individualIncentiveAmount = associateData.incentive;
                    incentive = individualIncentiveAmount;
                    incentivePercent = associateData.incentivePercent;
                }
            }`;

if (code.includes(oldAssociateBlock)) {
    code = code.replace(oldAssociateBlock, newAssociateBlock);
    console.log('✅ Replaced associate block');
} else {
    console.log('❌ Could not find associate block to replace. Trying partial...');
    // Try without leading whitespace issues
    const idx = code.indexOf('const associateData = calculateAssociateIncentive(');
    if (idx !== -1) {
        console.log('Found calculateAssociateIncentive at char index:', idx);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Add payment_mode to calculatedResults.push
// ─────────────────────────────────────────────────────────────────────────────
code = code.replace(
  '                bucket: record.bucket,\n                designation: designation.toUpperCase(),',
  '                bucket: record.bucket,\n                payment_mode: record.payment_mode,\n                designation: designation.toUpperCase(),'
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. Add payment_mode and bucket to grouped data mapping
// ─────────────────────────────────────────────────────────────────────────────
// In the first groupedData init:
code = code.replace(
  '                    bucket: res.bucket\n                };',
  '                    bucket: res.bucket,\n                    payment_mode: res.payment_mode\n                };'
);

// In the if (groupBy === employee_code) detailed block:
code = code.replace(
  '                groupedData[groupKey].ph = res.ph;\n            }\n        }\n\n        const finalData',
  '                groupedData[groupKey].ph = res.ph;\n                groupedData[groupKey].bucket = res.bucket;\n                groupedData[groupKey].payment_mode = res.payment_mode;\n            }\n        }\n\n        const finalData'
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. Add assigned_grid and grid2Slabs to API return
// ─────────────────────────────────────────────────────────────────────────────
code = code.replace(
  '            column_config: requiredColumns,\n            special_grid_rules:',
  '            column_config: requiredColumns,\n            assigned_grid: assignedGrid,\n            grid2Slabs: assignedGrid === \'grid_2\' ? (grid2Data.associateSlabs || []) : [],\n            special_grid_rules:'
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. Write the final service.ts
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync('app/api/incentives/service.ts', code);
console.log('✅ service.ts written with', code.split('\n').length, 'lines');
