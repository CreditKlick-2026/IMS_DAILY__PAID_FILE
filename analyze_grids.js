const XLSX = require('xlsx');

const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentives_All_All (6).xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const gridSummary = {};

for (const row of data) {
    const grid = row['assigned_grid'] || 'Unassigned / Missing';
    if (!gridSummary[grid]) {
        gridSummary[grid] = { count: 0, total_collection: 0, final_incentive: 0 };
    }
    gridSummary[grid].count++;
    
    let col = row['total_collection'];
    if (typeof col === 'string') col = parseFloat(col.replace(/,/g, '')) || 0;
    gridSummary[grid].total_collection += col || 0;
    
    let inc = row['final_incentive'];
    if (typeof inc === 'string') inc = parseFloat(inc.replace(/,/g, '')) || 0;
    gridSummary[grid].final_incentive += inc || 0;
}

console.log("Summary by Grid:");
for (const [grid, stats] of Object.entries(gridSummary)) {
    console.log(`${grid}: count=${stats.count}, collection=${stats.total_collection.toFixed(2)}, incentive=${stats.final_incentive.toFixed(2)}`);
}

// Let's also check missing clients or products
const missingPlans = data.filter(d => (d['assigned_grid'] === 'No Plan Matched' || !d['assigned_grid']) && d['total_collection'] > 0);
console.log(`\nRecords with Collection but No Plan Matched: ${missingPlans.length}`);
const missingSummary = {};
for (const row of missingPlans) {
    const key = `${row.client} - ${row.product}`;
    if (!missingSummary[key]) missingSummary[key] = { count: 0, collection: 0 };
    missingSummary[key].count++;
    missingSummary[key].collection += parseFloat(row['total_collection']) || 0;
}
for (const [key, stats] of Object.entries(missingSummary)) {
    console.log(`  ${key}: count=${stats.count}, collection=${stats.collection.toFixed(2)}`);
}
