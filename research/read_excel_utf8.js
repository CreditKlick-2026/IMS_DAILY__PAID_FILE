const ExcelJS = require('exceljs');
const fs = require('fs');

const file1 = "D:\\Office\\ims-dpf\\New Incentive Schemes -GGN.xlsx";
const file2 = "D:\\Office\\ims-dpf\\Incentive May'26 nnn.xlsx";
const outFile = "D:\\Office\\ims-dpf\\scratch\\excel_utf8.txt";

let outStr = "";
function log(msg) {
    outStr += msg + "\n";
}

async function readExcel(filePath) {
    log(`\n--- Reading ${filePath} ---`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);
        log(`Sheets: ${workbook.worksheets.map(ws => ws.name).join(', ')}`);
        
        for (const sheet of workbook.worksheets) {
            log(`\nSheet: ${sheet.name}`);
            let rowCount = 0;
            sheet.eachRow({ includeEmpty: false }, function(row, rowNumber) {
                if (rowCount < 50) {
                    log(`Row ${rowNumber}: ${JSON.stringify(row.values)}`);
                }
                rowCount++;
            });
            if (rowCount > 50) {
                log(`... and ${rowCount - 50} more rows.`);
            }
        }
    } catch (e) {
        log(`Error reading ${filePath}: ${e.message}`);
    }
}

async function main() {
    await readExcel(file1);
    await readExcel(file2);
    fs.writeFileSync(outFile, outStr, "utf8");
}

main();
