const XLSX = require('xlsx');

const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("Total rows:", data.length);
if (data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
}

let sum = 0;
// Look for a column that might be "Total Col", "Collection", "Amount", etc.
// The user said "total col me uska total aa raha hai 487301"
// Maybe there's a column called 'total col' or 'Total Collection'
let targetCol = null;
if (data.length > 0) {
    const keys = Object.keys(data[0]);
    targetCol = keys.find(k => k.toLowerCase().includes('col') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('paid'));
    console.log("Using column for sum:", targetCol);
}

if (targetCol) {
    for (const row of data) {
        const val = row[targetCol];
        if (typeof val === 'number') sum += val;
        else if (typeof val === 'string') sum += parseFloat(val) || 0;
    }
    console.log(`Sum of ${targetCol}:`, sum);
}
