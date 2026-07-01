const fs = require('fs');

const filesToPatch = [
    'app/dashboard/incentive/uttam-nagar/page.tsx',
    'app/dashboard/incentive/gurugram/page.tsx',
    'app/dashboard/incentive/delhi/page.tsx',
    'app/dashboard/incentive/pune/page.tsx',
    'components/IncentiveView.tsx'
];

for (const file of filesToPatch) {
    if (!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');

    // Add state
    if (!code.includes('const [grid3Data')) {
        code = code.replace('const [grid2Slabs, setGrid2Slabs] = useState<any[]>([]);',
            'const [grid2Slabs, setGrid2Slabs] = useState<any[]>([]);\n  const [grid3Data, setGrid3Data] = useState<any>(null);');
    }

    // Map from API
    if (!code.includes('setGrid3Data(incResult.grid3Data);')) {
        code = code.replace('if (incResult.grid2Slabs) setGrid2Slabs(incResult.grid2Slabs);',
            'if (incResult.grid2Slabs) setGrid2Slabs(incResult.grid2Slabs);\n        if (incResult.grid3Data) setGrid3Data(incResult.grid3Data);');
    }

    // Pass to TraceEngine
    if (!code.includes('grid3Data={grid3Data}')) {
        code = code.replace('grid2Slabs={grid2Slabs}',
            'grid2Slabs={grid2Slabs}\n                grid3Data={grid3Data}');
    }

    fs.writeFileSync(file, code);
    console.log('Patched', file);
}
