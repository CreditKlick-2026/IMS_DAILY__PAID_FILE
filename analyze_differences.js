const XLSX = require('xlsx');

function analyzeEmployee(employeeCode) {
    // 1. Read Keka file
    const kekaPath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\KeKa.xlsx';
    const kekaWorkbook = XLSX.readFile(kekaPath);
    const kekaSheet = kekaWorkbook.Sheets[kekaWorkbook.SheetNames[0]];
    const kekaData = XLSX.utils.sheet_to_json(kekaSheet);

    const empKeka = kekaData.find(e => e['Employee Number'] === employeeCode || e['EMP CODE'] === employeeCode);
    console.log(`--- ${employeeCode} KEKA DATA ---`);
    if(empKeka) {
        console.log(`Name: ${empKeka['NAME'] || empKeka['Display Name']}`);
        console.log(`Role: ${empKeka['DESIGNATION'] || empKeka['Job Title']}`);
        console.log(`Salary: ${empKeka['salary'] || empKeka['Salary']}`);
        console.log(`DOC: ${empKeka['DOC'] || empKeka['Date of Joining']}`);
    } else {
        console.log("NOT FOUND IN KEKA");
    }

    // 2. Read Raw DPF file
    const dpfPath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\PaidFile.xlsx';
    const dpfWorkbook = XLSX.readFile(dpfPath);
    const dpfSheet = dpfWorkbook.Sheets[dpfWorkbook.SheetNames[0]];
    const dpfData = XLSX.utils.sheet_to_json(dpfSheet);

    let empDpfCollection = 0;
    for (const row of dpfData) {
        if (row['Agent Name'] && (row['Agent Name'].includes(employeeCode) || (empKeka && row['Agent Name'].includes(empKeka['NAME'] || empKeka['Display Name'])))) {
            let coll = row['Total Amount'] || row['Paid Amount'] || 0;
            if (typeof coll === 'string') coll = parseFloat(coll.replace(/,/g, ''));
            empDpfCollection += coll;
        }
    }
    console.log(`\n--- DPF TOTAL COLLECTION ---`);
    console.log(`${empDpfCollection}`);

    // 3. Read Manual Excel file
    const manPath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
    const manWorkbook = XLSX.readFile(manPath);
    const manSheet = manWorkbook.Sheets['Incentive'];
    const manData = XLSX.utils.sheet_to_json(manSheet);

    const empMan = manData.find(e => e['EMP CODE'] === employeeCode);
    console.log("\n--- MANUAL INCENTIVE EXCEL ROW ---");
    if(empMan) {
        console.log(`Collection: ${empMan['Collection']}`);
        console.log(`Incentive Total: ${empMan['Total']}`);
    } else {
        console.log("NOT FOUND IN MANUAL EXCEL");
    }
}

analyzeEmployee('IMS1153');
console.log("\n===========================================\n");
analyzeEmployee('IMS1146');
console.log("\n===========================================\n");
analyzeEmployee('IMSA250279');
