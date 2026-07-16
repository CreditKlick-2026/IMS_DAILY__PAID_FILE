const XLSX = require('xlsx');

const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const sums = {};

for (const row of data) {
    for (const key of Object.keys(row)) {
        const val = row[key];
        let num = 0;
        if (typeof val === 'number') num = val;
        else if (typeof val === 'string') {
            // Remove commas and try to parse
            const cleaned = val.replace(/,/g, '');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed)) num = parsed;
        }
        
        if (num !== 0) {
            if (!sums[key]) sums[key] = 0;
            sums[key] += num;
        }
    }
}

console.log("Column Sums in Incentive Paid UN (2).xlsx:");
for (const [key, sum] of Object.entries(sums)) {
    console.log(`${key}: ${sum}`);
}
