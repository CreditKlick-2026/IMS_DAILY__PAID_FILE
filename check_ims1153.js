const XLSX = require('xlsx');

const manPath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
const manWorkbook = XLSX.readFile(manPath);
const manSheet = manWorkbook.Sheets['Incentive'];
const manData = XLSX.utils.sheet_to_json(manSheet);

const empMan = manData.find(e => e['EMP CODE'] === 'IMS1153');

console.log("EXACT MATCH FOR IMS1153 IN MANUAL EXCEL:");
console.log(empMan);

// Let's also check if there's any other row with this code or similar name
const sumits = manData.filter(e => e['NAME'] && e['NAME'].toLowerCase().includes('sumit'));
console.log("\nALL SUMITS IN MANUAL EXCEL:");
console.log(sumits);
