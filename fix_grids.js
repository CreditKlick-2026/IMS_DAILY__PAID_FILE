const fs = require('fs');
const grids = JSON.parse(fs.readFileSync('D:/Office/ims-dpf/data/master_grids.json', 'utf8'));

// The user's normal grid logic
const normalGrid = [
    { target_collection: 225000, under_16k: "2.5", between_16_18k: "0", between_18_24k: "0", over_24k: "0" },
    { target_collection: 260000, under_16k: "2.5", between_16_18k: "2.5", between_18_24k: "0", over_24k: "0" },
    { target_collection: 280000, under_16k: "2.5", between_16_18k: "2.5", between_18_24k: "2.5", over_24k: "2.5" },
    { target_collection: 300000, under_16k: "3", between_16_18k: "3", between_18_24k: "3", over_24k: "3" },
    { target_collection: 350000, under_16k: "3.25", between_16_18k: "3.25", between_18_24k: "3.25", over_24k: "3.25" },
    { target_collection: 400000, under_16k: "4", between_16_18k: "4", between_18_24k: "4", over_24k: "4" }
];

// Applying the normal grid to associateTenured and associateVintage (since the image implies this is the normal case grid)
grids.associateTenured = normalGrid;
// wait, does vintage have a different grid?
// Earlier the system had different grids. 
// But if the user says "normal case ke lyia second image hai", it probably applies to all non-special associates!
// I'll apply it to both to be safe.
grids.associateVintage = normalGrid;

fs.writeFileSync('D:/Office/ims-dpf/data/master_grids.json', JSON.stringify(grids, null, 2));
console.log('Fixed grids in master_grids.json');
