const fs = require('fs');
const path = require('path');

const dirs = ['uttam-nagar', 'delhi', 'pune', 'gurugram'];
const basePath = path.join(__dirname, 'app', 'dashboard', 'incentive');

for (const dir of dirs) {
    const file = path.join(basePath, dir, 'page.tsx');
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the simple cursor: 'pointer' with the guarded one
    const searchStr = `cursor: 'pointer'`;
    const replaceStr = `cursor: (!row.assigned_grid || row.assigned_grid === 'unassigned' || row.assigned_grid === 'null') ? 'not-allowed' : 'pointer',
                    opacity: (!row.assigned_grid || row.assigned_grid === 'unassigned' || row.assigned_grid === 'null') ? 0.6 : 1`;
                  
    if (content.includes(searchStr)) {
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync(file, content);
        console.log(`Updated cursor style in ${dir}/page.tsx`);
    }
    
    // Also update the onMouseEnter
    const enterSearch = `onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-top)'; }}`;
    const enterReplace = `onMouseEnter={e => { if (!isSelected && row.assigned_grid && row.assigned_grid !== 'unassigned' && row.assigned_grid !== 'null') e.currentTarget.style.background = 'var(--bg-top)'; }}`;
    if (content.includes(enterSearch)) {
        content = content.replace(enterSearch, enterReplace);
        fs.writeFileSync(file, content);
        console.log(`Updated hover style in ${dir}/page.tsx`);
    }
}
