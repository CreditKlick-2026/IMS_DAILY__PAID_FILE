const xlsx = require('xlsx');

const file1 = "D:\\Office\\ims-dpf\\New Incentive Schemes -GGN.xlsx";
const file2 = "D:\\Office\\ims-dpf\\Incentive May'26 nnn.xlsx";

function readExcel(filePath) {
    console.log(`\n--- Reading ${filePath} ---`);
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;
        console.log(`Sheets: ${sheetNames.join(', ')}`);
        
        for (const sheetName of sheetNames) {
            console.log(`\nSheet: ${sheetName}`);
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
            // Print first 50 rows, format nicely
            for (let i = 0; i < Math.min(data.length, 50); i++) {
                console.log(`Row ${i}: ${JSON.stringify(data[i])}`);
            }
            if (data.length > 50) {
                console.log(`... and ${data.length - 50} more rows.`);
            }
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

readExcel(file1);
readExcel(file2);
