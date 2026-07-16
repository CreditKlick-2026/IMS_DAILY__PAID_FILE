const XLSX = require('xlsx');

const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
const workbook = XLSX.readFile(filePath);

console.log("Sheet names:");
for (const name of workbook.SheetNames) {
    console.log("-", name);
}

if (workbook.SheetNames.length > 1) {
    for (let i = 1; i < workbook.SheetNames.length; i++) {
        const sheet = workbook.Sheets[workbook.SheetNames[i]];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`\nSheet: ${workbook.SheetNames[i]}, rows: ${data.length}`);
        
        const sums = {};
        for (const row of data) {
            for (const key of Object.keys(row)) {
                const val = row[key];
                let num = 0;
                if (typeof val === 'number') num = val;
                else if (typeof val === 'string') {
                    const parsed = parseFloat(val.replace(/,/g, ''));
                    if (!isNaN(parsed)) num = parsed;
                }
                if (num !== 0) {
                    if (!sums[key]) sums[key] = 0;
                    sums[key] += num;
                }
            }
        }
        
        console.log(`Column Sums in ${workbook.SheetNames[i]}:`);
        for (const [key, sum] of Object.entries(sums)) {
            console.log(`  ${key}: ${sum}`);
        }
    }
}
