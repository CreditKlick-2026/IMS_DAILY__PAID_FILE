const fs = require('fs');

async function run() {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: 'ims7191', password: 'admin123', role: 'admin' })
    });
    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) return console.error("Login failed");
    const token = setCookie.split(';')[0];

    const url = 'http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar';
    const res = await fetch(url, { headers: { 'Cookie': token } });
    const systemResult = await res.json();
    
    const row = systemResult.data.find(r => r.employee_code === 'IMS1146' || r.employee_id === 'IMS1146');
    console.log("IMS1146 Data:");
    console.dir(row, {depth: null});
}
run().catch(console.error);
