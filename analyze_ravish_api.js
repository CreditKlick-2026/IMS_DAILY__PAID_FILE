async function analyzeRavish() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@ims.com', password: 'admin' })
        });
        const token = loginRes.headers.get('set-cookie').split(';')[0];
        
        console.log("Fetching API for Ravish...");
        const res = await fetch('http://localhost:3000/api/incentives?groupBy=employee_code', { headers: { 'Cookie': token } });
        const json = await res.json();
        
        const data = json.data;
        const ravish = data.find(d => d.employee_id === 'IMS2977');
        console.log("Ravish's Data:", ravish);
        const traceRes = await fetch('http://localhost:3000/api/trace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': token },
            body: JSON.stringify({ record: ravish })
        });
        const traceJson = await traceRes.json();
        console.log("Trace Nodes:", JSON.stringify(traceJson.nodes, null, 2));
    } catch(e) {
        console.error(e);
    }
}
analyzeRavish();
