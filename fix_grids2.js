const fs = require('fs');
const grids = JSON.parse(fs.readFileSync('D:/Office/ims-dpf/data/master_grids.json', 'utf8'));

const normalGrid = [
    { target_collection: 225000, under_16k: "2.5", between_16_18k: "0", between_18_24k: "0", over_24k: "0" },
    { target_collection: 260000, under_16k: "2.5", between_16_18k: "2.5", between_18_24k: "0", over_24k: "0" },
    { target_collection: 280000, under_16k: "2.5", between_16_18k: "2.5", between_18_24k: "2.5", over_24k: "2.5" },
    { target_collection: 300000, under_16k: "3", between_16_18k: "3", between_18_24k: "3", over_24k: "3" },
    { target_collection: 350000, under_16k: "3.25", between_16_18k: "3.25", between_18_24k: "3.25", over_24k: "3.25" },
    { target_collection: 400000, under_16k: "4", between_16_18k: "4", between_18_24k: "4", over_24k: "4" }
];

grids.associateTenured = normalGrid;

// don't touch associateVintage or others

// fix the salary limits again
let tenuredRanges = grids.tenured_salary_ranges;
let r1 = tenuredRanges.find(r => r.key === 'between_18_24k');
if (r1) r1.max = 24000;
let r2 = tenuredRanges.find(r => r.key === 'over_24k');
if (r2) r2.min = 24001;

fs.writeFileSync('D:/Office/ims-dpf/data/master_grids.json', JSON.stringify(grids, null, 2));
console.log('Fixed grids correctly in master_grids.json');
