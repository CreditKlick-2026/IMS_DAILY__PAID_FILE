const XLSX = require('xlsx');

const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
const workbook = XLSX.readFile(filePath);

const sheet = workbook.Sheets['Incentive'];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Total rows in 'Incentive': ${data.length}`);
if (data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
    console.log("First row:", data[0]);
    console.log("Second row:", data[1]);
}

let collectionSum = 0;
let incSum = 0;
for (const row of data) {
    let col = row['Collection'] || row['collection'] || 0;
    if (typeof col === 'string') col = parseFloat(col.replace(/,/g, '')) || 0;
    collectionSum += col;
    
    let inc = row['Total'] || row['total'] || 0;
    if (typeof inc === 'string') inc = parseFloat(inc.replace(/,/g, '')) || 0;
    incSum += inc;
}

console.log("Calculated Collection Sum:", collectionSum);
console.log("Calculated Total Incentive Sum:", incSum);

