const XLSX = require('xlsx');
const fs = require('fs');

async function run() {
    console.log("Logging in...");
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: 'ims7191', password: 'admin123', role: 'admin' })
    });
    const token = loginRes.headers.get('set-cookie').split(';')[0];

    console.log("Fetching API...");
    const url = 'http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar';
    const res = await fetch(url, { headers: { 'Cookie': token } });
    const systemResult = await res.json();
    const sysArray = systemResult.data || [];

    const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
    const workbook = XLSX.readFile(filePath);
    const manualData = XLSX.utils.sheet_to_json(workbook.Sheets['Incentive']);

    const diffs = [];
    for (const sysRow of sysArray) {
        const manRow = manualData.find(m => m['EMP CODE'] === sysRow.employee_code || m['NAME'] === sysRow.employee_name || m['EMP CODE'] === sysRow.employee_id);
        
        const sysInc = Math.round(sysRow.incentive || 0);
        const sysColl = sysRow.collection || sysRow.total_collection || 0;
        
        if (manRow) {
            let manInc = manRow['Total'] || manRow['total'] || 0;
            if (typeof manInc === 'string') manInc = parseFloat(manInc.replace(/,/g, '')) || 0;
            manInc = Math.round(manInc);
            
            let manColl = manRow['Collection'] || 0;
            if (typeof manColl === 'string') manColl = parseFloat(manColl.replace(/,/g, '')) || 0;

            if (Math.abs(sysInc - manInc) > 10) {
                diffs.push({
                    emp: sysRow.employee_name,
                    id: sysRow.employee_code || sysRow.employee_id,
                    systemIncentive: sysInc,
                    manualIncentive: manInc,
                    sysCollection: sysColl,
                    manCollection: manColl,
                    diff: sysInc - manInc,
                    role: sysRow.designation,
                });
            }
        } else if (sysInc > 0) {
            diffs.push({
                emp: sysRow.employee_name,
                id: sysRow.employee_code || sysRow.employee_id,
                systemIncentive: sysInc,
                manualIncentive: 0,
                sysCollection: sysColl,
                manCollection: 0,
                diff: sysInc,
                role: sysRow.designation,
            });
        }
    }

    for (const manRow of manualData) {
        const sysRow = sysArray.find(s => s.employee_code === manRow['EMP CODE'] || s.employee_name === manRow['NAME'] || s.employee_id === manRow['EMP CODE']);
        if (!sysRow) {
            let manInc = manRow['Total'] || manRow['total'] || 0;
            if (typeof manInc === 'string') manInc = parseFloat(manInc.replace(/,/g, '')) || 0;
            let manColl = manRow['Collection'] || 0;
            if (typeof manColl === 'string') manColl = parseFloat(manColl.replace(/,/g, '')) || 0;
            
            if (manInc > 0) {
                diffs.push({
                    emp: manRow['NAME'],
                    id: manRow['EMP CODE'],
                    systemIncentive: 0,
                    manualIncentive: Math.round(manInc),
                    sysCollection: 0,
                    manCollection: manColl,
                    diff: -Math.round(manInc),
                    role: manRow['DESIGNATION'],
                });
            }
        }
    }

    diffs.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    console.table(diffs);
}

run().catch(console.error);
