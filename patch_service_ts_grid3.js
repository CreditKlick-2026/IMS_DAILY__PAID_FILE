const fs = require('fs');

let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');

// 1. Load grid3Data
const loadGrid2Block = `        let grid2Data: any = { associateSlabs: [], riders: [] };
        try {
            const fileData = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_2.json'), 'utf-8');
            grid2Data = JSON.parse(fileData);
        } catch (e) { /* grid2 not available */ }`;

const newLoadGridBlock = `        let grid2Data: any = { associateSlabs: [], riders: [] };
        try {
            const fileData = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_2.json'), 'utf-8');
            grid2Data = JSON.parse(fileData);
        } catch (e) { /* grid2 not available */ }
        
        let grid3Data: any = { associateSlabs: [], tlSlabs: [], amSlabs: [] };
        try {
            const fileData3 = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_3.json'), 'utf-8');
            grid3Data = JSON.parse(fileData3);
        } catch (e) { /* grid3 not available */ }`;

code = code.replace(loadGrid2Block, newLoadGridBlock);

// 2. Helper functions for grid 3
const helperBlock = `function getGrid2IncentivePercent(collection: number, client: string, product: string, vintageMonths: number, slabs: any[]): number {`;
const newHelperBlock = `function getGrid3IncentivePercent(value: number, slabs: any[], isPcp = false): number {
    if (!slabs || slabs.length === 0) return 0;
    
    let bestPayout = 0;
    for (const slab of slabs) {
        const min = isPcp ? (slab.pcp_min || 0) : (slab.min || 0);
        const max = isPcp ? (slab.pcp_max === '-' ? Infinity : slab.pcp_max) : (slab.max === '-' ? Infinity : slab.max);
        
        if (value >= min && value <= max) {
            const pct = parseFloat(slab.payout_pct) / 100;
            if (pct > bestPayout) bestPayout = pct;
        }
    }
    return bestPayout;
}

function getGrid2IncentivePercent(collection: number, client: string, product: string, vintageMonths: number, slabs: any[]): number {`;

code = code.replace(helperBlock, newHelperBlock);

// 3. TL logic
const tlBlock = `            } else if (designation.includes('leader') || designation === 'tl') {
                // Team Leader Logic
                incentivePercent = getLeadershipIncentivePercentage(teamCollection, 'TL', leadershipGrid);
                teamIncentiveAmount = teamCollection * incentivePercent;
                incentive = teamIncentiveAmount;

            } else if (designation.includes('manager') || designation === 'am') {`;

const newTlBlock = `            } else if (designation.includes('leader') || designation === 'tl') {
                // Team Leader Logic
                if (assignedGrid === 'grid_3') {
                    incentivePercent = getGrid3IncentivePercent(pcp, grid3Data.tlSlabs, true);
                    teamIncentiveAmount = teamCollection * incentivePercent;
                    incentive = teamIncentiveAmount;
                } else {
                    incentivePercent = getLeadershipIncentivePercentage(teamCollection, 'TL', leadershipGrid);
                    teamIncentiveAmount = teamCollection * incentivePercent;
                    incentive = teamIncentiveAmount;
                }

            } else if (designation.includes('manager') || designation === 'am') {`;

code = code.replace(tlBlock, newTlBlock);

// 4. AM logic
const amBlock = `                let additionalAmount = 0;
                if (matchedTarget == 235000) additionalAmount = teamIncentiveAmount * 0.10;
                else if (matchedTarget == 240000) additionalAmount = teamIncentiveAmount * 0.15;
                else if (matchedTarget == 250000) additionalAmount = teamIncentiveAmount * 0.20;
                else if (matchedTarget >= 275000) additionalAmount = teamIncentiveAmount * 0.25;

                incentive = teamIncentiveAmount + additionalAmount;

            } else {`;

const newAmBlock = `                let additionalAmount = 0;
                if (assignedGrid === 'grid_3') {
                    incentivePercent = getGrid3IncentivePercent(pcp, grid3Data.amSlabs, true);
                    teamIncentiveAmount = teamCollection * incentivePercent;
                    if (teamIncentiveAmount < 18000 && teamIncentiveAmount > 0) {
                        additionalAmount = 5000;
                    }
                    incentive = teamIncentiveAmount + additionalAmount;
                } else {
                    if (matchedTarget == 235000) additionalAmount = teamIncentiveAmount * 0.10;
                    else if (matchedTarget == 240000) additionalAmount = teamIncentiveAmount * 0.15;
                    else if (matchedTarget == 250000) additionalAmount = teamIncentiveAmount * 0.20;
                    else if (matchedTarget >= 275000) additionalAmount = teamIncentiveAmount * 0.25;
                    incentive = teamIncentiveAmount + additionalAmount;
                }

            } else {`;

code = code.replace(amBlock, newAmBlock);

// 5. Associate Logic
const ascBlock = `                } else if (assignedGrid === 'grid_2') {
                    incentivePercent = getGrid2IncentivePercent(totalEmployeeCollection, record.client, record.product, vintageMonths, grid2Data.associateSlabs || []);
                    individualIncentiveAmount = collection * incentivePercent;
                    incentive = individualIncentiveAmount;
                } else {`;

const newAscBlock = `                } else if (assignedGrid === 'grid_2') {
                    incentivePercent = getGrid2IncentivePercent(totalEmployeeCollection, record.client, record.product, vintageMonths, grid2Data.associateSlabs || []);
                    individualIncentiveAmount = collection * incentivePercent;
                    incentive = individualIncentiveAmount;
                } else if (assignedGrid === 'grid_3') {
                    incentivePercent = getGrid3IncentivePercent(totalEmployeeCollection, grid3Data.associateSlabs, false);
                    individualIncentiveAmount = collection * incentivePercent;
                    incentive = individualIncentiveAmount;
                } else {`;

code = code.replace(ascBlock, newAscBlock);

// 6. Return response
const resBlock = `            assigned_grid: assignedGrid,
            grid2Slabs: assignedGrid === 'grid_2' ? (grid2Data.associateSlabs || []) : [],
            special_grid_rules: specialGridRules.map(r => ({ ...r, inc`;

const newResBlock = `            assigned_grid: assignedGrid,
            grid2Slabs: assignedGrid === 'grid_2' ? (grid2Data.associateSlabs || []) : [],
            grid3Data: assignedGrid === 'grid_3' ? grid3Data : null,
            special_grid_rules: specialGridRules.map(r => ({ ...r, inc`;

code = code.replace(resBlock, newResBlock);

fs.writeFileSync('app/api/incentives/service.ts', code);
console.log('Patched service.ts');
