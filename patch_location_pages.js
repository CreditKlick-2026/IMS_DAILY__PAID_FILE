const fs = require('fs');
const path = require('path');

const dirs = ['uttam-nagar', 'delhi', 'pune', 'gurugram'];
const basePath = path.join(__dirname, 'app', 'dashboard', 'incentive');

for (const dir of dirs) {
    const file = path.join(basePath, dir, 'page.tsx');
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the simple onClick with the guarded one
    const searchStr = `onClick={() => setSelectedRecord(row)}`;
    const replaceStr = `onClick={() => {
                    const grid = row.assigned_grid;
                    if (!grid || grid === 'unassigned' || grid === 'null') {
                      alert('⚠️ No calculation trace available because no grid is assigned to this client.');
                      return;
                    }
                    setSelectedRecord(row);
                  }}`;
                  
    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync(file, content);
        console.log(`Updated ${dir}/page.tsx`);
    } else {
        console.log(`Skipped ${dir}/page.tsx (already updated or not found)`);
    }
}
