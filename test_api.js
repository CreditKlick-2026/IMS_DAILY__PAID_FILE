async function testAPI() {
    const res = await fetch('http://localhost:3000/api/incentives?client=Sbi%20Recovery&product=Card&location=Uttam%20Nagar&outMin=0');
    const data = await res.json();
    
    let totalIncentive = 0;
    for (const d of data) {
        totalIncentive += (d.incentive || 0);
    }
    
    console.log("Total Records:", data.length);
    console.log("Total Incentive in API response:", totalIncentive);
}

testAPI();
