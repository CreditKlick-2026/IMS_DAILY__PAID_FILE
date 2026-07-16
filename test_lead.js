const fs = require('fs');

const masterGrids = JSON.parse(fs.readFileSync('D:\\Office\\ims-dpf\\data\\master_grids.json', 'utf8'));

function getLeadershipIncentivePercentage(teamCollection, role, grid) {
    let fixedMultiplier = 1;
    if (role === 'ATL') fixedMultiplier = 5;
    else if (role === 'TL') fixedMultiplier = 9;
    else if (role === 'AM') fixedMultiplier = 30;

    let best = 0; // The actual code has no 'best', it just returns!
    for (const rule of grid) {
        if (rule.role === role && teamCollection >= rule.target_collection * fixedMultiplier) {
            return parseFloat(rule.incentive_percentage) / 100;
        }
    }
    return 0;
}

console.log(getLeadershipIncentivePercentage(2455073, 'TL', masterGrids.leadership));
