const fs = require('fs');

try {
    const dataPath = 'D:/Office/ims-dpf/data/master_grids.json';
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    data.tenured_salary_ranges = [
        { key: 'under_16k', min: 0, max: 15999, label: '<16k (%)' },
        { key: 'between_16_18k', min: 16000, max: 17999, label: '16k-18k (%)' },
        { key: 'between_18_24k', min: 18000, max: 9999999, label: '>18k (%)' }
    ];
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log("Successfully updated tenured_salary_ranges in master_grids.json");
} catch(e) {
    console.error(e);
}
