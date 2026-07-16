const XLSX = require('xlsx');

async function compare() {
    // 1. Fetch system data from API
    const res = await fetch('http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar');
    const systemResult = await res.json();
    const sysArray = systemResult.data || [];
    
    console.log(`System API returned ${sysArray.length} records`);

    // 2. Read manual excel data
    const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['Incentive'];
    const manualData = XLSX.utils.sheet_to_json(sheet);

    // 3. Compare
    let sysTotal = 0;
    let manTotal = 0;

    const diffs = [];

    for (const sysRow of sysArray) {
        // Find in manual data
        const manRow = manualData.find(m => m['EMP CODE'] === sysRow.employee_id || m['NAME'] === sysRow.name);
        
        const sysInc = Math.round(sysRow.final_incentive || 0); // it's final_incentive in API
        sysTotal += (sysRow.final_incentive || 0);

        if (manRow) {
            let manInc = manRow['Total'] || manRow['total'] || 0;
            if (typeof manInc === 'string') manInc = parseFloat(manInc.replace(/,/g, '')) || 0;
            manInc = Math.round(manInc);
            manTotal += manInc;

            if (Math.abs(sysInc - manInc) > 10) {
                diffs.push({
                    emp: sysRow.name,
                    id: sysRow.employee_id,
                    systemIncentive: sysInc,
                    manualIncentive: manInc,
                    diff: sysInc - manInc,
                    sysCollection: sysRow.total_collection,
                    manCollection: manRow['Collection'],
                    role: sysRow.designation
                });
            }
        } else {
            if (sysInc > 0) {
                diffs.push({
                    emp: sysRow.name,
                    id: sysRow.employee_id,
                    systemIncentive: sysInc,
                    manualIncentive: 0,
                    diff: sysInc,
                    reason: 'Not found in manual Excel'
                });
            }
        }
    }

    console.log(`System Total Incentive: ${sysTotal}`);
    console.log(`Differences found: ${diffs.length}`);
    console.table(diffs);
}

compare();
