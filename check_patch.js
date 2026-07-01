const fs = require('fs');
const code = fs.readFileSync('patch_location_grids.js', 'utf8');
console.log(code.includes("if (lowerCol.includes('name') && !lowerCol.includes('tl') && !lowerCol.includes('am'))"));
