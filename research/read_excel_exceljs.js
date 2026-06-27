const ExcelJS = require('exceljs');

const file1 = "D:\\Office\\ims-dpf\\New Incentive Schemes -GGN.xlsx";
const file2 = "D:\\Office\\ims-dpf\\Incentive May'26 nnn.xlsx";

async function readExcel(filePath) {
    console.log(`\n--- Reading ${filePath} ---`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        console.log(`Sheets: ${workbook.worksheets.map(ws => ws.name).join(', ')}`);
        
        for (const sheet of workbook.worksheets) {
            console.log(`\nSheet: ${sheet.name}`);
            let rowCount = 0;
            sheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
                if (rowCount < 50) {
                    console.log(`Row ${rowNumber}: ${JSON.stringify(row.values)}`);
                }
                rowCount++;
            });
            if (rowCount > 50) {
                console.log(`... and ${rowCount - 50} more rows.`);
            }
        }
    } catch (e) {
        console.error(`Error reading ${filePath}: ${e.message}`);
    }
}

async function main() {
    await readExcel(file1);
    await readExcel(file2);
}

main();
