const XLSX = require('xlsx');

const dpfPath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\PaidFile.xlsx';
const dpfWorkbook = XLSX.readFile(dpfPath);
const dpfSheet = dpfWorkbook.Sheets[dpfWorkbook.SheetNames[0]];
const dpfData = XLSX.utils.sheet_to_json(dpfSheet);

let sumitMatches = [];
let vindheshMatches = [];
for (const row of dpfData) {
    if (row['Agent Name'] && row['Agent Name'].toLowerCase().includes('sumit')) {
        sumitMatches.push(row['Agent Name']);
    }
    if (row['Agent Name'] && row['Agent Name'].toLowerCase().includes('vindhesh')) {
        vindheshMatches.push(row['Agent Name']);
    }
}
console.log("Sumit Matches:", [...new Set(sumitMatches)]);
console.log("Vindhesh Matches:", [...new Set(vindheshMatches)]);
