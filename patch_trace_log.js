const fs = require('fs');
let code = fs.readFileSync('components/TraceEngine.tsx', 'utf8');

if (!code.includes('console.log("TRACE ENGINE PROPS",')) {
    code = code.replace('export default function TraceEngine({', 'export default function TraceEngine({\n  record,\n  specialGridRules,\n  associateTenuredGrid,\n  associateVintageGrid,\n  leadershipGrid,\n  assignedGrid,\n  grid2Slabs,\n  onClose\n}: {\n  record: any,\n  specialGridRules?: any[],\n  associateTenuredGrid?: any[],\n  associateVintageGrid?: any[],\n  leadershipGrid?: any[],\n  assignedGrid?: string,\n  grid2Slabs?: any[],\n  onClose: () => void\n}) {\n  console.log("TRACE ENGINE PROPS", { assignedGrid, recordClient: record.client });');
    // I need to cleanly replace the signature
    code = fs.readFileSync('components/TraceEngine.tsx', 'utf8'); // Reset
    
    // Better replacement
    code = code.replace('const TraceEngine = ({', 'const TraceEngine = ({'); // Just in case it's const
    
    code = code.replace('  onClose\n}: {', '  onClose\n}: {\n  console.log("TRACE ENGINE PROPS assignedGrid:", assignedGrid);\n');
    fs.writeFileSync('components/TraceEngine.tsx', code);
    console.log('Patched TraceEngine with console.log');
}
