const XLSX = require('xlsx');

const dpfPath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\PaidFile.xlsx';
const dpfWorkbook = XLSX.readFile(dpfPath);
const dpfSheet = dpfWorkbook.Sheets[dpfWorkbook.SheetNames[0]];
const dpfData = XLSX.utils.sheet_to_json(dpfSheet);

let matches = [];
for (const row of dpfData) {
    if (row['Agent Name'] && row['Agent Name'].toLowerCase().includes('rani')) {
        matches.push(row['Agent Name']);
    }
}
console.log("Rani Matches:", [...new Set(matches)]);
