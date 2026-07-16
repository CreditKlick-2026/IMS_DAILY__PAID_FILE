const fs = require('fs');

async function run() {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: 'ims7191', password: 'admin123', role: 'admin' })
    });
    const token = loginRes.headers.get('set-cookie')?.split(';')[0];

    const url = 'http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar';
    const res = await fetch(url, { headers: { 'Cookie': token } });
    const systemResult = await res.json();
    
    const teamMembers = systemResult.data.filter(r => (r.tl_name || '').toLowerCase() === 'imtiyaz alam' || (r.cm_name || '').toLowerCase() === 'imtiyaz alam');
    
    console.log("Team members for Imtiyaz Alam:");
    let total = 0;
    teamMembers.forEach(m => {
        console.log(`${m.employee_code}: ${m.name} - ${m.total_collection}`);
        total += m.total_collection;
    });
    console.log("Total Collection:", total);
    console.log("Count:", teamMembers.length);
}
run().catch(console.error);
