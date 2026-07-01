const fs = require('fs');
const code = fs.readFileSync('app/dashboard/incentive/gurugram/page.tsx', 'utf8'); 
console.log(code.substring(code.indexOf('uiConfig.columns.map((col: string) => {'), code.indexOf('return (') + 2000));
