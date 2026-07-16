const XLSX = require('xlsx');
async function run() {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: 'ims7191', password: 'admin123', role: 'admin' })
    });
    const token = loginRes.headers.get('set-cookie').split(';')[0];
    const url = 'http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar';
    const res = await fetch(url, { headers: { 'Cookie': token } });
    const systemResult = await res.json();
    const sysArray = systemResult.data || [];
    
    for (const r of sysArray) {
        if (r.designation === 'tl' || r.designation === 'TL' || r.employee_code === 'IMS1741' || r.employee_id === 'IMS1741') {
            console.log(r);
        }
    }
}
run().catch(console.error);
