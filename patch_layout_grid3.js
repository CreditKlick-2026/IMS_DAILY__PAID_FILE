const fs = require('fs');

let code = fs.readFileSync('app/dashboard/rules-engine/layout.tsx', 'utf8');

code = code.replace(
    "{ label: 'Master Grid 2', path: '/dashboard/rules-engine/master-grids-2', icon: Grid3X3 },",
    "{ label: 'Master Grid 2', path: '/dashboard/rules-engine/master-grids-2', icon: Grid3X3 },\n    { label: 'Master Grid 3', path: '/dashboard/rules-engine/master-grids-3', icon: Grid3X3 },"
);

fs.writeFileSync('app/dashboard/rules-engine/layout.tsx', code);
console.log('Patched layout.tsx');
