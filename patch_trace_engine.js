const fs = require('fs');
const path = require('path');

const dirs = ['uttam-nagar', 'delhi', 'pune', 'gurugram'];
const basePath = path.join(__dirname, 'app', 'dashboard', 'incentive');

for (const dir of dirs) {
    const file = path.join(basePath, dir, 'page.tsx');
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    
    const regex = /<TraceEngine[\s\S]*?\/>/;
    
    const replaceBlock = `<TraceEngine 
                record={selectedRecord} 
                onClose={() => setSelectedRecord(null)} 
            />`;
                
    if (regex.test(content)) {
        content = content.replace(regex, replaceBlock);
        fs.writeFileSync(file, content);
        console.log(`Successfully patched TraceEngine props in ${dir}/page.tsx`);
    } else {
        console.log(`Failed to patch TraceEngine props in ${dir}/page.tsx`);
    }
}
