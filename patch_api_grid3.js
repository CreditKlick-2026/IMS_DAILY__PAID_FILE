const fs = require('fs');
let code = fs.readFileSync('app/api/admin/master-grids-3/route.ts', 'utf8');

code = code.replace(/master_grids_2\.json/g, 'master_grids_3.json');

fs.writeFileSync('app/api/admin/master-grids-3/route.ts', code);
console.log('Patched master-grids-3 API route');
