const fs = require('fs');
let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8').replace(/\r\n/g, '\n');

const lines = code.split('\n').length;
console.log('Starting with', lines, 'lines');

// ── 1. Add Grid 2 helper functions before `export async function GET` ──────────
const grid2Helpers = `
function parseGrid2Value(val) {
    if (val === '-' || val === '' || val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const clean = val.replace(/,/g, '').replace(/[<>]/g, '').trim();
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
    }
    return null;
}

function getGrid2IncentivePercent(collection, client, product, vintageDays, associateSlabs) {
    const normalizedClient = (client || '').toLowerCase().replace('bank', '').trim();
    const normalizedProduct = (product || '').toLowerCase();
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
        const minStr = String(slab.min || '').trim();
        const maxStr = String(slab.max || '').trim();
        const minNum = parseGrid2Value(minStr);
        const maxNum = parseGrid2Value(maxStr);
        let match = true;
        if (minStr.includes('<')) { if (minNum !== null && collection >= minNum) match = false; }
        else if (minStr.includes('>')) { if (minNum !== null && collection <= minNum) match = false; }
        else if (minNum !== null) { if (collection < minNum) match = false; }
        if (maxStr.includes('<')) { if (maxNum !== null && collection >= maxNum) match = false; }
        else if (maxStr.includes('>')) { if (maxNum !== null && collection <= maxNum) match = false; }
        else if (maxNum !== null) { if (collection > maxNum) match = false; }
        if (match) {
            const payout = parseFloat(slab.payout_pct) / 100 || 0;
            if (payout > bestPayout) bestPayout = payout;
        }
    }
    return bestPayout;
}

`;

if (!code.includes('parseGrid2Value')) {
    code = code.replace('export async function GET', grid2Helpers + 'export async function GET');
    console.log('✅ Added Grid 2 helpers');
} else {
    console.log('ℹ️  Grid 2 helpers already present');
}

// ── 2. Add required_columns + assignedGrid + grid2Data block after leadershipGrid ──
const afterGrid = `        const leadershipGrid = leadershipRes.rows;

        // 1.6 Fetch required_columns and assigned_grid from master_client
        const clientParam = searchParams.get('client');
        const productParam = searchParams.get('product');
        let requiredColumns = [];
        let assignedGrid = null;

        let grid2Data = { associateSlabs: [], riders: [] };
        try {
            const { readFile } = require('fs/promises');
            const path = require('path');
            const fileData = await readFile(require('path').join(process.cwd(), 'data', 'master_grids_2.json'), 'utf-8');
            grid2Data = JSON.parse(fileData);
        } catch (e) { /* grid2 not available */ }

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
        }

        // 2. Fetch individual collections from DPF`;

const oldAfterGrid = `        const leadershipGrid = leadershipRes.rows;

        // 2. Fetch individual collections from DPF`;

if (code.includes(oldAfterGrid)) {
    code = code.replace(oldAfterGrid, afterGrid);
    console.log('✅ Added required_columns + assignedGrid + grid2Data block');
} else {
    console.log('❌ Could not find leadershipGrid block');
}

// ── 3. Replace associate logic to support grid_2 and unassigned ──────────────
const oldAssociate = `            } else {
                // Associate Logic
                const associateData = calculateAssociateIncentive(
                    collection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                );
                individualIncentiveAmount = associateData.incentive;
                incentive = individualIncentiveAmount;
                incentivePercent = associateData.incentivePercent;
            }`;

const newAssociate = `            } else {
                // Associate Logic
                if (!assignedGrid || assignedGrid === 'unassigned') {
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

if (code.includes(oldAssociate)) {
    code = code.replace(oldAssociate, newAssociate);
    console.log('✅ Replaced associate logic');
} else {
    console.log('❌ Could not find old associate block');
}

// ── 4. Add bucket + payment_mode to groupedData init object ──────────────────
code = code.replace(
    '                    aph: res.aph,\n                    ph: res.ph\n                };',
    '                    aph: res.aph,\n                    ph: res.ph,\n                    bucket: res.bucket,\n                    payment_mode: res.payment_mode\n                };'
);

// ── 5. Update return to include column_config, assigned_grid, grid2Slabs ─────
code = code.replace(
    `        return NextResponse.json({ \n            success: true, \n            data: finalData,\n            special_grid_rules:`,
    `        return NextResponse.json({ \n            success: true, \n            data: finalData,\n            column_config: requiredColumns,\n            assigned_grid: assignedGrid,\n            grid2Slabs: assignedGrid === 'grid_2' ? (grid2Data.associateSlabs || []) : [],\n            special_grid_rules:`
);

fs.writeFileSync('app/api/incentives/service.ts', code);
console.log('✅ Done. service.ts now has', code.split('\n').length, 'lines.');
