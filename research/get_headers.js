const ExcelJS = require('exceljs');
async function run() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile("D:\\Office\\ims-dpf\\Incentive May'26 nnn.xlsx");
    for (const ws of wb.worksheets) {
        console.log('Sheet: ' + ws.name);
        ws.eachRow((r, i) => {
            if (i === 1) console.log(JSON.stringify(r.values));
        });
    }
}
run();
