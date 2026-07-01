const fs = require('fs');

const filesToPatch = [
    'app/dashboard/incentive/uttam-nagar/page.tsx',
    'app/dashboard/incentive/gurugram/page.tsx',
    'app/dashboard/incentive/delhi/page.tsx',
    'app/dashboard/incentive/pune/page.tsx'
];

for (const file of filesToPatch) {
    if (!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');

    // Add states
    if (!code.includes('const [assignedGrid')) {
        code = code.replace('const [leadershipGrid, setLeadershipGrid] = useState<any[]>([]);',
            'const [leadershipGrid, setLeadershipGrid] = useState<any[]>([]);\n  const [assignedGrid, setAssignedGrid] = useState<string>("");\n  const [grid2Slabs, setGrid2Slabs] = useState<any[]>([]);');
    }

    // Map from API
    if (!code.includes('setAssignedGrid(incResult.assigned_grid);')) {
        code = code.replace('setLeadershipGrid(incResult.leadershipGrid);',
            'setLeadershipGrid(incResult.leadershipGrid);\n        if (incResult.assigned_grid) setAssignedGrid(incResult.assigned_grid);\n        if (incResult.grid2Slabs) setGrid2Slabs(incResult.grid2Slabs);');
    }

    // Pass to TraceEngine
    if (!code.includes('assignedGrid={assignedGrid}')) {
        code = code.replace('<TraceEngine \n                record={selectedRecord}',
            '<TraceEngine \n                record={selectedRecord} \n                assignedGrid={assignedGrid}\n                grid2Slabs={grid2Slabs}');
    }

    fs.writeFileSync(file, code);
    console.log('Patched', file);
}
