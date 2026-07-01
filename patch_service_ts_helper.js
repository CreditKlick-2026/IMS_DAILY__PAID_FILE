const fs = require('fs');
let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');

if (!code.includes('function getGrid3IncentivePercent')) {
    const helperBlock = `function getGrid2IncentivePercent(collection: number, client: string, product: string, vintageDays: number, associateSlabs: any[]) {`;
    const newHelperBlock = `function getGrid3IncentivePercent(value: number, slabs: any[], isPcp = false): number {
    if (!slabs || slabs.length === 0) return 0;
    
    let bestPayout = 0;
    for (const slab of slabs) {
        const min = isPcp ? (slab.pcp_min || 0) : (slab.min || 0);
        const max = isPcp ? (slab.pcp_max === '-' ? Infinity : slab.pcp_max) : (slab.max === '-' ? Infinity : slab.max);
        
        if (value >= min && value <= max) {
            const pct = parseFloat(slab.payout_pct) / 100;
            if (pct > bestPayout) bestPayout = pct;
        }
    }
    return bestPayout;
}

function getGrid2IncentivePercent(collection: number, client: string, product: string, vintageDays: number, associateSlabs: any[]) {`;

    code = code.replace(helperBlock, newHelperBlock);
    fs.writeFileSync('app/api/incentives/service.ts', code);
    console.log('Fixed helper functions in service.ts');
} else {
    console.log('Already fixed helper functions');
}
