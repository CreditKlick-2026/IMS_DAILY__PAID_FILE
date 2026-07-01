const fs = require('fs');

let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');

const oldFilter = "const matchingSlabs = associateSlabs.filter(slab => slab.client === client && slab.product === product);";
const newFilter = `    // Loose match client and product
    const normalizedClient = client.toLowerCase().replace('bank', '').trim();
    const normalizedProduct = product.toLowerCase();
    
    const matchingSlabs = associateSlabs.filter(slab => {
        const slabClient = String(slab.client || '').toLowerCase().replace('bank', '').trim();
        const slabProduct = String(slab.product || '').toLowerCase();
        
        // Allow partial match (e.g. "Axis" matches "Axis Bank", "Card" matches "Credit Card - NPA - BAU")
        return slabClient.includes(normalizedClient) && slabProduct.includes(normalizedProduct);
    });`;

if (code.includes(oldFilter)) {
    code = code.replace(oldFilter, newFilter);
    fs.writeFileSync('app/api/incentives/service.ts', code);
    console.log('Successfully updated service.ts to use loose string matching for Grid 2 slabs.');
} else {
    console.log('Could not find old filter string.');
}
