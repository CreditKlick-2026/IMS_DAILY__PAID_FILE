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
    if (!code.includes('setUiConfig(incResult.ui_config)')) {
        code = code.replace(
            /if \(incResult\.special_grid_rules\)/,
            `if (incResult.ui_config) setUiConfig(incResult.ui_config); else setUiConfig({ columns: [], filters: [] });
        if (incResult.special_grid_rules)`
        );
        fs.writeFileSync(file, code);
        console.log('Fixed', file);
    }
}
