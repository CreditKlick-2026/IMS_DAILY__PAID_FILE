const XLSX = require('xlsx');

const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentives_All_All (6).xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("File:", filePath);
console.log("Total rows:", data.length);
if (data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
}

let sumCol = 0;
let sumInc = 0;
for (const row of data) {
    // Assuming columns might be total_collection, final_incentive, etc.
    const colVal = row['total_collection'];
    if (typeof colVal === 'number') sumCol += colVal;
    else if (typeof colVal === 'string') sumCol += parseFloat(colVal) || 0;
    
    const incVal = row['final_incentive'];
    if (typeof incVal === 'number') sumInc += incVal;
    else if (typeof incVal === 'string') sumInc += parseFloat(incVal) || 0;
}

console.log(`Sum of total_collection:`, sumCol);
console.log(`Sum of final_incentive:`, sumInc);
