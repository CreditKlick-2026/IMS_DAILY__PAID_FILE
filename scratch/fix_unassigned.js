const fs = require('fs');

let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');

// 1. Change assignedGrid default and initialization
const oldAssign = `        let assignedGrid = 'grid_1';
        if (clientParam && productParam) {
            const clientConfigRes = await pool.query(
                \`SELECT required_columns, assigned_grid FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1\`,
                [clientParam, productParam]
            );
            if (clientConfigRes.rows.length > 0) {
                assignedGrid = clientConfigRes.rows[0].assigned_grid || 'grid_1';`;

const newAssign = `        let assignedGrid: string | null = null;
        if (clientParam && productParam) {
            const clientConfigRes = await pool.query(
                \`SELECT required_columns, assigned_grid FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1\`,
                [clientParam, productParam]
            );
            if (clientConfigRes.rows.length > 0) {
                assignedGrid = clientConfigRes.rows[0].assigned_grid; // can be null/undefined
`;

code = code.replace(oldAssign, newAssign);

// 2. Add the unassigned guard to the logic
const oldGuard = `
            if (kekaData?.is_special) {
                incentivePercent = 0;
                for (const rule of specialGridRules) {
`;

const newGuard = `
            if (!assignedGrid || assignedGrid === 'unassigned' || assignedGrid === 'null') {
                incentivePercent = 0;
                individualIncentiveAmount = 0;
                teamIncentiveAmount = 0;
                incentive = 0;
            } else if (kekaData?.is_special) {
                incentivePercent = 0;
                for (const rule of specialGridRules) {
`;

code = code.replace(oldGuard, newGuard);

// 3. Replace the associate else condition
const oldAssociate = `
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
`;

const newAssociate = `
                if (assignedGrid === 'grid_2') {
                    incentivePercent = getGrid2IncentivePercent(collection, record.client, record.product, vintageMonths, grid2Data.associateSlabs || []);
                    individualIncentiveAmount = collection * incentivePercent;
                    incentive = individualIncentiveAmount;
                } else if (assignedGrid === 'grid_1') {
                    const associateData = calculateAssociateIncentive(
                        collection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                    );
                    individualIncentiveAmount = associateData.incentive;
                    incentive = individualIncentiveAmount;
                    incentivePercent = associateData.incentivePercent;
                } else {
                    incentivePercent = 0;
                    individualIncentiveAmount = 0;
                    incentive = 0;
                }
`;

code = code.replace(oldAssociate, newAssociate);

fs.writeFileSync('app/api/incentives/service.ts', code);
console.log('Successfully updated service.ts to handle unassigned grids.');
