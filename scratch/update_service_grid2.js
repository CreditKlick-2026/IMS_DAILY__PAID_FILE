const fs = require('fs');

let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');

// 1. Add fs/promises and path if not imported
if (!code.includes("import fs from 'fs/promises'")) {
    code = code.replace("import { NextResponse } from 'next/server';", "import { NextResponse } from 'next/server';\nimport fs from 'fs/promises';\nimport path from 'path';");
}

// 2. Add Grid 2 helper functions at the top level
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
    // Exact match client and product
    const matchingSlabs = associateSlabs.filter(slab => slab.client === client && slab.product === product);
    if (matchingSlabs.length === 0) return 0;

    let bestPayout = 0;

    for (const slab of matchingSlabs) {
        // Check vintage
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
            if (payout > bestPayout) {
                bestPayout = payout;
            }
        }
    }

    return bestPayout;
}
`;

if (!code.includes('parseGrid2Value')) {
    code = code.replace("function getAssociateFixedIncentive", grid2Helpers + "\nfunction getAssociateFixedIncentive");
}

// 3. Load Grid 2 Data and assigned_grid
const grid2Load = `
        let grid2Data: any = { associateSlabs: [], riders: [] };
        try {
            const fileData = await fs.readFile(path.join(process.cwd(), 'data', 'master_grids_2.json'), 'utf-8');
            grid2Data = JSON.parse(fileData);
        } catch (e) {
            console.error('Failed to load grid 2 data:', e);
        }

        // 1.6 Fetch required_columns and assigned_grid from master_client
        const clientParam = searchParams.get('client');
        const productParam = searchParams.get('product');
        let requiredColumns: string[] = [];
        let assignedGrid = 'grid_1';
        if (clientParam && productParam) {
            const clientConfigRes = await pool.query(
                \`SELECT required_columns, assigned_grid FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1\`,
                [clientParam, productParam]
            );
            if (clientConfigRes.rows.length > 0) {
                assignedGrid = clientConfigRes.rows[0].assigned_grid || 'grid_1';
                if (clientConfigRes.rows[0].required_columns) {
                    const raw = clientConfigRes.rows[0].required_columns;
                    requiredColumns = Array.isArray(raw) ? raw : JSON.parse(raw);
                }
            }
        }
`;

// Replace old 1.6 block
code = code.replace(/\/\/ 1\.6 Fetch required_columns[\s\S]*?(?=\/\/ 2\. Fetch individual collections)/, grid2Load + "\n        ");

// 4. Update Associate Logic
const associateLogic = `
            } else {
                // Associate Logic
                if (assignedGrid === 'grid_2') {
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
            }
`;

code = code.replace(/\} else \{\s+\/\/ Associate Logic\s+const associateData = calculateAssociateIncentive\([\s\S]*?incentivePercent = associateData.incentivePercent;\s+\}/, associateLogic.trim());

fs.writeFileSync('app/api/incentives/service.ts', code);
console.log('Successfully updated service.ts');
