const fs = require('fs');

async function analyzeRani() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employee_id: 'ims7191', password: 'admin123', role: 'admin' })
        });
        const token = loginRes.headers.get('set-cookie').split(';')[0];
        
        console.log("Fetching API...");
        const res = await fetch('http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar', { headers: { 'Cookie': token } });
        const json = await res.json();
        
        const data = json.data;
        const rani = data.find(d => d.name && d.name.toLowerCase().includes('rani'));
        console.log("Rani's Data:", rani);

        // Also check her assigned grid logic
        const gridLabel = rani.assigned_grid;
        console.log("Assigned Grid:", gridLabel);
        
        // Find if she is in associateSlabs for Grid 2 (which is 2.50%)
        const grid2 = json.dynamicGridData.associateSlabs;
        const matchingGrid2 = grid2.filter(s => s.client.toLowerCase().includes(rani.client.toLowerCase()) || rani.client.toLowerCase().includes(s.client.toLowerCase()));
        console.log("Matching Grid 2 Slabs:", matchingGrid2);

    } catch (e) {
        console.error(e);
    }
}
analyzeRani();
