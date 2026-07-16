const XLSX = require('xlsx');
const fs = require('fs');

async function compare() {
    // 1. Fetch system data from API
    // Ensure all params are provided exactly as UI sends them
    const url = 'http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar';
    const res = await fetch(url);
    const systemResult = await res.json();
    const sysArray = systemResult.data || [];
    
    console.log(`System API returned ${sysArray.length} records`);

    if (sysArray.length === 0) {
        console.log("No records returned. Check API parameters.");
        return;
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
        const manRow = manualData.find(m => m['EMP CODE'] === sysRow.employee_id || m['NAME'] === sysRow.name);
        
        const sysInc = Math.round(sysRow.final_incentive || 0);
        sysTotal += sysInc;

        if (manRow) {
            let manInc = manRow['Total'] || manRow['total'] || 0;
            if (typeof manInc === 'string') manInc = parseFloat(manInc.replace(/,/g, '')) || 0;
            manInc = Math.round(manInc);
            manTotal += manInc;

            if (Math.abs(sysInc - manInc) > 10) {
                diffs.push({
                    emp: sysRow.name || sysRow.employee_name,
                    id: sysRow.employee_id || sysRow.employee_code,
                    systemIncentive: sysInc,
                    manualIncentive: manInc,
                    diff: sysInc - manInc,
                    sysCollection: sysRow.total_collection,
                    manCollection: manRow['Collection'],
                    role: sysRow.designation,
                    reason: 'Calculation Difference'
                });
            }
        } else {
            if (sysInc > 0) {
                diffs.push({
                    emp: sysRow.name || sysRow.employee_name,
                    id: sysRow.employee_id || sysRow.employee_code,
                    systemIncentive: sysInc,
                    manualIncentive: 0,
                    diff: sysInc,
                    reason: 'Found in System API, but missing in Manual Excel'
                });
            }
        }
    }

    // Check for people in manual Excel but missing in System
    for (const manRow of manualData) {
        const sysRow = sysArray.find(s => s.employee_id === manRow['EMP CODE'] || s.employee_code === manRow['EMP CODE'] || s.name === manRow['NAME'] || s.employee_name === manRow['NAME']);
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
                    reason: 'Found in Manual Excel, but missing in System API'
                });
            }
        }
    }

    console.log(`System Total Incentive: ${sysTotal}`);
    console.log(`Manual Total Incentive (matched): ${manTotal}`);
    console.log(`Differences found: ${diffs.length}`);
    
    // Sort diffs by largest absolute difference
    diffs.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    // Save to markdown artifact
    let md = `# Incentive Comparison Report\n\n`;
    md += `**System Total Incentive:** ₹${sysTotal.toLocaleString()}\n`;
    md += `**Manual Total Incentive:** ₹4,87,301\n`; // using user's number
    md += `**Total Differences Found:** ${diffs.length} Employees\n\n`;
    
    if (diffs.length > 0) {
        md += `| Employee | Code | Role | System Incentive | Manual Incentive | Difference | Reason |\n`;
        md += `|---|---|---|---|---|---|---|\n`;
        for (const d of diffs) {
            md += `| ${d.emp || 'N/A'} | ${d.id || 'N/A'} | ${d.role || '-'} | ₹${d.systemIncentive} | ₹${d.manualIncentive} | **${d.diff > 0 ? '+' : ''}${d.diff}** | ${d.reason} |\n`;
        }
    } else {
        md += `No differences found!\n`;
    }

    fs.writeFileSync('C:\\Users\\ankit\\.gemini\\antigravity-ide\\brain\\5a1cc8c6-363c-4c84-8f44-95490fc8de30\\incentive_differences.md', md);
    console.log("Written artifact to incentive_differences.md");
}

compare().catch(console.error);
