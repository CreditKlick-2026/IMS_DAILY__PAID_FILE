async function debugAPI() {
    const url = 'http://localhost:3000/api/incentives?groupBy=employee_code&client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar';
    const res = await fetch(url);
    const systemResult = await res.json();
    console.log("API Response:", JSON.stringify(systemResult, null, 2).slice(0, 1500));
}

debugAPI();
