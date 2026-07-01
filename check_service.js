const fs = require('fs');
const code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');
console.log(code.substring(code.indexOf("if (groupBy === 'employee_code'"), code.indexOf("if (groupBy === 'employee_code'") + 500));
