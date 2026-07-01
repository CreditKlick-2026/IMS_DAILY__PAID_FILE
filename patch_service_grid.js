const fs = require('fs');
let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');

// 1. Add associate collection aggregator
const preCalcBlock = `        // 3. Pre-calculate Team Collections and Headcounts
        const tlTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};
        const amTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};`;

const newPreCalcBlock = `        // 3. Pre-calculate Team Collections and Headcounts
        const tlTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};
        const amTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};
        const associateTotalData: Record<string, number> = {};`;

code = code.replace(preCalcBlock, newPreCalcBlock);

// 2. Populate associate total
const populateBlock = `            if (row.am_name) {
                const am = row.am_name.toLowerCase().trim();
                if (!amTeamData[am]) amTeamData[am] = { collection: 0, headcount: new Set() };
                amTeamData[am].collection += coll;
                if (row.employee_code) amTeamData[am].headcount.add(row.employee_code);
            }
        });`;

const newPopulateBlock = `            if (row.am_name) {
                const am = row.am_name.toLowerCase().trim();
                if (!amTeamData[am]) amTeamData[am] = { collection: 0, headcount: new Set() };
                amTeamData[am].collection += coll;
                if (row.employee_code) amTeamData[am].headcount.add(row.employee_code);
            }
            if (row.employee_code) {
                associateTotalData[row.employee_code] = (associateTotalData[row.employee_code] || 0) + coll;
            }
        });`;

code = code.replace(populateBlock, newPopulateBlock);

// 3. Use aggregate collection for associate logic
const calcBlock = `            } else {
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

const newCalcBlock = `            } else {
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
            }`;

code = code.replace(calcBlock, newCalcBlock);

// 4. Also fix the special grid logic which uses collection!
const specialBlock = `            if (kekaData?.is_special) {
                incentivePercent = 0;
                for (const rule of specialGridRules) {
                    if (collection >= rule.target_collection) {
                        incentivePercent = rule.incentive_percentage;
                        break; // Because it's ordered DESC, first match is the highest applicable
                    }
                }
                
                individualIncentiveAmount = collection * incentivePercent;
                incentive = individualIncentiveAmount;
            } else if (designation === 'atl') {`;

const newSpecialBlock = `            if (kekaData?.is_special) {
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
            } else if (designation === 'atl') {`;

code = code.replace(specialBlock, newSpecialBlock);

// 5. Fix ATL associate logic
const atlBlock = `                const { incentive: indInc, incentivePercent: indIncPct } = calculateAssociateIncentive(
                    collection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                );
                individualIncentiveAmount = indInc;`;

const newAtlBlock = `                const totalEmployeeCollection = associateTotalData[record.employee_code] || collection;
                const { incentive: indInc, incentivePercent: indIncPct } = calculateAssociateIncentive(
                    totalEmployeeCollection, salary, doc, vintageMonths, associateVintageGrid, associateTenuredGrid
                );
                individualIncentiveAmount = collection * indIncPct;`;

code = code.replace(atlBlock, newAtlBlock);


// 6. Fix grouping so incentive_percent isn't overridden blindly. Let's make it calculate at the end.
const groupBlock = `                groupedData[groupKey].team_collection += res.team_collection;
                groupedData[groupKey].incentive += res.incentive;
                groupedData[groupKey].individual_incentive += res.individual_incentive;
                groupedData[groupKey].team_incentive += res.team_incentive;
                groupedData[groupKey].incentive_percent = res.incentive_percent; 
            }
        }`;

const newGroupBlock = `                groupedData[groupKey].team_collection += res.team_collection;
                groupedData[groupKey].incentive += res.incentive;
                groupedData[groupKey].individual_incentive += res.individual_incentive;
                groupedData[groupKey].team_incentive += res.team_incentive;
                // Weighted average or recalculated percent at the end is better, but since rate is same for all rows of employee, just keep it.
                if (res.incentive_percent !== '0.00%') {
                    groupedData[groupKey].incentive_percent = res.incentive_percent; 
                }
            }
        }
        
        // Final pass for percentage recalculation for grouped data
        for (const key in groupedData) {
            if (groupedData[key].total_collection > 0) {
                groupedData[key].incentive_percent = (groupedData[key].incentive / groupedData[key].total_collection * 100).toFixed(2) + '%';
            } else {
                groupedData[key].incentive_percent = '0.00%';
            }
        }`;

code = code.replace(groupBlock, newGroupBlock);

fs.writeFileSync('app/api/incentives/service.ts', code);
console.log('Fixed service.ts');
