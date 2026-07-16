const fs = require('fs');
const grids = JSON.parse(fs.readFileSync('D:/Office/ims-dpf/data/master_grids.json', 'utf8'));

function getAssociateTenuredIncentivePercentage(collection, salary, grid) {
    for (const rule of grid) {
        if (collection >= rule.target_collection) {
            if (salary < 16000) return parseFloat(rule.under_16k) / 100;
            if (salary >= 16000 && salary < 18000) return parseFloat(rule.between_16_18k) / 100;
            if (salary >= 18000 && salary <= 24000) return parseFloat(rule.between_18_24k) / 100;
            return parseFloat(rule.over_24k) / 100;
        }
    }
    return 0;
}

const p = getAssociateTenuredIncentivePercentage(340904, 25000, grids.associateTenured.reverse());
console.log("Percentage:", p);
