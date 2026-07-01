const fs = require('fs');
const path = require('path');

const dirs = ['uttam-nagar', 'delhi', 'pune', 'gurugram'];
const basePath = path.join(__dirname, 'app', 'dashboard', 'incentive');

for (const dir of dirs) {
    const file = path.join(basePath, dir, 'page.tsx');
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Find the exact block starting with onClick={() => setSelectedRecord(row)}
    // down to onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
    
    const regex = /onClick=\{\(\) => setSelectedRecord\(row\)\}[\s\S]*?onMouseLeave=\{e => \{ if \(!isSelected\) e\.currentTarget\.style\.background = 'transparent'; \}\}/;
    
    const replaceBlock = `onClick={() => {
                    const grid = row.assigned_grid;
                    if (!grid || grid === 'unassigned' || grid === 'null') {
                      alert('⚠️ No calculation trace available because no grid is assigned to this client.');
                      return;
                    }
                    setSelectedRecord(row);
                  }}
                  style={{
                    display: 'grid', 
                    gridTemplateColumns: uiConfig.columns?.length > 0 
                      ? \`30px \${uiConfig.columns.map(() => 'minmax(120px, 1fr)').join(' ')} 80px\`
                      : '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px',
                    padding: '8px 10px', gap: 6, alignItems: 'center',
                    borderBottom: '1px solid #e5e7eb',
                    background: isSelected ? 'rgba(79,125,255,0.08)' : 'transparent',
                    transition: 'all 0.2s',
                    cursor: (!row.assigned_grid || row.assigned_grid === 'unassigned' || row.assigned_grid === 'null') ? 'not-allowed' : 'pointer',
                    opacity: (!row.assigned_grid || row.assigned_grid === 'unassigned' || row.assigned_grid === 'null') ? 0.6 : 1
                  }}
                  onMouseEnter={e => { if (!isSelected && row.assigned_grid && row.assigned_grid !== 'unassigned' && row.assigned_grid !== 'null') e.currentTarget.style.background = 'var(--bg-top)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}`;
                
    if (regex.test(content)) {
        content = content.replace(regex, replaceBlock);
        fs.writeFileSync(file, content);
        console.log(`Successfully patched ${dir}/page.tsx`);
    } else {
        console.log(`Failed to patch ${dir}/page.tsx`);
    }
}
