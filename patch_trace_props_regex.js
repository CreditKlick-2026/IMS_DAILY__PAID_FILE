const fs = require('fs');

let code = fs.readFileSync('components/TraceEngine.tsx', 'utf8');

// Replace the destructured params
code = code.replace(/grid2Slabs,\r?\n\s+onClose\r?\n\}: \{/, 'grid2Slabs,\n  grid3Data,\n  onClose\n}: {');

// Replace the type definition
code = code.replace(/grid2Slabs\?: any\[\],\r?\n\s+onClose: \(\) => void\r?\n\}/, 'grid2Slabs?: any[],\n  grid3Data?: any,\n  onClose: () => void\n}');

fs.writeFileSync('components/TraceEngine.tsx', code);
console.log('Fixed TraceEngine props with regex');
