const XLSX = require('xlsx');
const fs = require('fs');

async function run() {
    console.log("Logging in...");
    // 1. Login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_code: 'IMS7191', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
        console.error("Login failed!", await loginRes.text());
        return;
    }
    
    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) {
        console.error("No cookie returned!");
        return;
    }
    
    // Extract token
    const token = setCookie.split(';')[0];
    console.log("Logged in successfully. Fetching data...");

    // 2. Fetch API Data
    const url = 'http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar';
    const res = await fetch(url, {
        headers: {
            'Cookie': token
        }
    });
    
    if (!res.ok) {
        console.error("Fetch failed!", await res.text());
        return;
    }
    
    const systemResult = await res.json();
    const sysArray = systemResult.data || [];
    
    console.log(`System API returned ${sysArray.length} records`);
    if (sysArray.length === 0) return;

    // 3. Read manual excel data
    const filePath = 'D:\\Office\\ims-dpf\\Files\\UploadTestJuneUttamNagar\\Incentive Paid UN (2).xlsx';
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['Incentive'];
    const manualData = XLSX.utils.sheet_to_json(sheet);

    // 4. Compare
    let sysTotal = 0;
    let manTotal = 0;
    const diffs = [];

    for (const sysRow of sysArray) {
        const manRow = manualData.find(m => m['EMP CODE'] === sysRow.employee_code || m['NAME'] === sysRow.employee_name);
        
        const sysInc = Math.round(sysRow.incentive || 0);
        sysTotal += sysInc;

        if (manRow) {
            let manInc = manRow['Total'] || manRow['total'] || 0;
            if (typeof manInc === 'string') manInc = parseFloat(manInc.replace(/,/g, '')) || 0;
            manInc = Math.round(manInc);
            manTotal += manInc;

            if (Math.abs(sysInc - manInc) > 10) {
                diffs.push({
                    emp: sysRow.employee_name,
                    id: sysRow.employee_code,
                    systemIncentive: sysInc,
                    manualIncentive: manInc,
                    diff: sysInc - manInc,
                    role: sysRow.designation,
                    reason: 'Calculation Difference'
                });
            }
        } else {
            if (sysInc > 0) {
                diffs.push({
                    emp: sysRow.employee_name,
                    id: sysRow.employee_code,
                    systemIncentive: sysInc,
                    manualIncentive: 0,
                    diff: sysInc,
                    reason: 'Found in System, Missing in Manual Excel'
                });
            }
        }
    }

    for (const manRow of manualData) {
        const sysRow = sysArray.find(s => s.employee_code === manRow['EMP CODE'] || s.employee_name === manRow['NAME']);
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
                    reason: 'Found in Manual Excel, Missing in System'
                });
            }
        }
    }

    console.log(`System Total Incentive: ${sysTotal}`);
    console.log(`Manual Total Incentive (matched): ${manTotal}`);
    console.log(`Differences found: ${diffs.length}`);
    
    diffs.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    let md = `# Incentive Comparison Report\n\n`;
    md += `**System Total Incentive:** ₹${sysTotal.toLocaleString()}\n`;
    md += `**Manual Total Incentive:** ₹4,87,301\n`;
    md += `**Total Differences Found:** ${diffs.length} Employees\n\n`;
    
    if (diffs.length > 0) {
        md += `| Employee | Code | Role | System | Manual | Diff | Reason |\n`;
        md += `|---|---|---|---|---|---|---|\n`;
        for (const d of diffs) {
            md += `| ${d.emp || 'N/A'} | ${d.id || 'N/A'} | ${d.role || '-'} | ₹${d.systemIncentive} | ₹${d.manualIncentive} | **${d.diff > 0 ? '+' : ''}${d.diff}** | ${d.reason} |\n`;
        }
    } else {
        md += `No differences found!\n`;
    }

    const outPath = 'C:\\Users\\ankit\\.gemini\\antigravity-ide\\brain\\5a1cc8c6-363c-4c84-8f44-95490fc8de30\\incentive_differences.md';
    fs.writeFileSync(outPath, md);
    console.log("Artifact written to", outPath);
}

run().catch(console.error);
