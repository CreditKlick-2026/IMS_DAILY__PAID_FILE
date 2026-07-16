const XLSX = require('xlsx');

const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentives_All_All (6).xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const raghuveer = data.find(d => d.employee_id === 'IMS0857' || d.name.includes('Raghuveer'));
if (raghuveer) {
    console.log("Raghuveer in System Excel:");
    console.log("Collection:", raghuveer.total_collection);
    console.log("Incentive:", raghuveer.final_incentive);
} else {
    console.log("Raghuveer not found in system excel!");
}
