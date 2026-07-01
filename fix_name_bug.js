const fs = require('fs');

const filesToPatch = [
    'app/dashboard/incentive/uttam-nagar/page.tsx',
    'app/dashboard/incentive/gurugram/page.tsx',
    'app/dashboard/incentive/delhi/page.tsx',
    'app/dashboard/incentive/pune/page.tsx'
];

for (const file of filesToPatch) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the bugged condition
    const buggedCondition = "if (lowerCol.includes('name') && !lowerCol.includes('tl') && !lowerCol.includes('am')) {";
    const fixedCondition = "if (lowerCol === 'employee_name' || lowerCol === 'employee name') {";
    
    if (content.includes(buggedCondition)) {
        content = content.replace(buggedCondition, fixedCondition);
        fs.writeFileSync(file, content);
        console.log(`Fixed bug in ${file}`);
    } else {
        console.log(`Bugged condition not found in ${file}`);
    }
}
