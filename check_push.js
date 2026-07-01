const fs = require('fs');
const code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');
console.log(code.substring(code.indexOf("else if (assignedGrid === 'grid_2')"), code.indexOf("calculatedResults.push") + 1500));
