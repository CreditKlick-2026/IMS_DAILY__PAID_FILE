const XLSX = require('xlsx');

async function compare() {
    // 1. Fetch system data from API
    const res = await fetch('http://localhost:3000/api/incentives?client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar');
    const systemResult = await res.json();
    const systemData = systemResult.data || systemResult; // adjust based on API response structure
    
    let sysArray = Array.isArray(systemData) ? systemData : [];
    if (!sysArray.length && systemResult.success) {
        sysArray = systemResult.data;
    }

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
        const manRow = manualData.find(m => m['EMP CODE'] === sysRow.employee_id || m['NAME'] === sysRow.employee_name);
        
        const sysInc = Math.round(sysRow.incentive || 0);
        sysTotal += (sysRow.incentive || 0);

        if (manRow) {
            let manInc = manRow['Total'] || manRow['total'] || 0;
            if (typeof manInc === 'string') manInc = parseFloat(manInc.replace(/,/g, '')) || 0;
            manInc = Math.round(manInc);
            manTotal += manInc;

            if (Math.abs(sysInc - manInc) > 10) { // allowing small rounding diffs
                diffs.push({
                    emp: sysRow.employee_name,
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
                    emp: sysRow.employee_name,
                    id: sysRow.employee_id,
                    systemIncentive: sysInc,
                    manualIncentive: 0,
                    diff: sysInc,
                    reason: 'Not found in manual Excel'
                });
            }
        }
    }

    for (const manRow of manualData) {
        const sysRow = sysArray.find(s => s.employee_id === manRow['EMP CODE'] || s.employee_name === manRow['NAME']);
        if (!sysRow) {
            let manInc = manRow['Total'] || manRow['total'] || 0;
            if (typeof manInc === 'string') manInc = parseFloat(manInc.replace(/,/g, '')) || 0;
            if (manInc > 0) {
                diffs.push({
                    emp: manRow['NAME'],
                    id: manRow['EMP CODE'],
                    systemIncentive: 0,
                    manualIncentive: Math.round(manInc),
                    diff: -Math.round(manInc),
                    reason: 'Not found in System API'
                });
            }
        }
    }

    console.log(`System Total Incentive: ${sysTotal}`);
    console.log(`Differences found: ${diffs.length}`);
    console.table(diffs);
}

compare();
