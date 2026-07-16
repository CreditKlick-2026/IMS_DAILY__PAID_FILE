const XLSX = require('xlsx');

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

    const tlRow = sysArray.find(r => r.employee_code === 'IMS1741');
    console.log("TL IMS1741 System Output:");
    console.log(tlRow);
}
run().catch(console.error);
