const fs = require('fs');

let code = fs.readFileSync('components/TraceEngine.tsx', 'utf8');

if (!code.includes('grid3Data?: any')) {
    // Replace the destructured params
    code = code.replace('  grid2Slabs,\n  onClose\n}: {', '  grid2Slabs,\n  grid3Data,\n  onClose\n}: {');
    
    // Replace the type definition
    code = code.replace('  grid2Slabs?: any[],\n  onClose: () => void\n}', '  grid2Slabs?: any[],\n  grid3Data?: any,\n  onClose: () => void\n}');
    
    fs.writeFileSync('components/TraceEngine.tsx', code);
    console.log('Fixed TraceEngine props');
} else {
    console.log('Props already fixed');
}
