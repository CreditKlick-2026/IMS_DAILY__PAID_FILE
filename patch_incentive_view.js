const fs = require('fs');
let code = fs.readFileSync('components/IncentiveView.tsx', 'utf8');

// 1. Add state for columnConfig
code = code.replace(
  'const [leadershipGrid, setLeadershipGrid] = useState<any[]>([]);',
  'const [leadershipGrid, setLeadershipGrid] = useState<any[]>([]);\n  const [columnConfig, setColumnConfig] = useState<string[]>([]);'
);

// 2. Set columnConfig in fetchData
code = code.replace(
  'if (incResult.leadershipGrid) setLeadershipGrid(incResult.leadershipGrid);',
  'if (incResult.leadershipGrid) setLeadershipGrid(incResult.leadershipGrid);\n        if (incResult.column_config) setColumnConfig(incResult.column_config);\n        else setColumnConfig([]);'
);

// 3. Dynamic Headers Logic
// We will replace the table Header grid layout and map
const oldHeader = `        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px', background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
          {['#', 'Employee', 'Designation', 'AM Name', 'TL Name', 'APH', 'PH', 'Collection', 'Vintage', 'Incentive'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>`;

const newHeader = `        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: columnConfig.length > 0 
            ? \`30px \${columnConfig.map(() => '1fr').join(' ')} 80px\`
            : '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px', 
          background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 
        }}>
          {columnConfig.length > 0 ? (
            ['#', ...columnConfig.map(c => c.replace(/_/g, ' ')), 'Incentive'].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h}</div>
            ))
          ) : (
            ['#', 'Employee', 'Designation', 'AM Name', 'TL Name', 'APH', 'PH', 'Collection', 'Vintage', 'Incentive'].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h}</div>
            ))
          )}
        </div>`;

code = code.replace(oldHeader, newHeader);

// 4. Dynamic Row Logic
const oldRowStart = `              return (
                <div key={row.employee_id}
                  onClick={() => setSelectedRecord(row)}
                  style={{
                    display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px',`;

const newRowStart = `              return (
                <div key={row.employee_id}
                  onClick={() => setSelectedRecord(row)}
                  style={{
                    display: 'grid', 
                    gridTemplateColumns: columnConfig.length > 0 
                      ? \`30px \${columnConfig.map(() => '1fr').join(' ')} 80px\`
                      : '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px',`;

code = code.replace(oldRowStart, newRowStart);

const oldRowContent = `                  <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600 }}>{rowNum}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--acc2)' : 'var(--txt)' }}>{row.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {row.employee_id} 
                      {row.is_special && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold' }}>SPECIAL</span>}
                      &bull; {row.location}
                    </div>
                  </div>

                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.designation || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.am_name || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.tl_name || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.aph || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.ph || '—'}</div>
                  
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt)' }}>{formatCurrency(row.total_collection || 0)}</div>
                  
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)' }}>{vintage !== '—' ? \`\${vintage} d\` : '—'}</div>
                  
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textAlign: 'right' }}>
                    {formatCurrency(row.final_incentive || 0)}
                  </div>
                </div>`;

const newRowContent = `                  <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600 }}>{rowNum}</div>
                  
                  {columnConfig.length > 0 ? (
                    <>
                      {columnConfig.map(col => {
                        let val = '—';
                        const lowerCol = col.toLowerCase();
                        if (lowerCol.includes('name') && !lowerCol.includes('tl') && !lowerCol.includes('am')) {
                           // Main employee name field
                           return (
                             <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                               <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--acc2)' : 'var(--txt)' }}>{row.name || '—'}</div>
                               <div style={{ fontSize: 9, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                 {row.employee_id} 
                                 {row.is_special && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold' }}>SPECIAL</span>}
                               </div>
                             </div>
                           );
                        } else if (lowerCol.includes('code') || lowerCol === 'employee_code') {
                           val = row.employee_id || '—';
                        } else if (lowerCol === 'money_collected' || lowerCol === 'collection') {
                           val = formatCurrency(row.total_collection || 0);
                        } else if (lowerCol === 'tl_name' || lowerCol === 'tl name') {
                           val = row.tl_name || '—';
                        } else if (lowerCol === 'am_name' || lowerCol === 'am' || lowerCol === 'am name') {
                           val = row.am_name || '—';
                        } else if (lowerCol === 'ph') {
                           val = row.ph || '—';
                        } else if (lowerCol === 'aph') {
                           val = row.aph || '—';
                        } else if (lowerCol === 'designation') {
                           val = row.designation || '—';
                        } else {
                           if (row[lowerCol] !== undefined && row[lowerCol] !== null && row[lowerCol] !== '') {
                               val = row[lowerCol];
                           } else if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
                               val = row[col];
                           }
                        }
                        
                        const isAmount = lowerCol === 'money_collected' || lowerCol === 'collection';
                        return (
                          <div key={col} style={{ fontSize: 10, color: isAmount ? 'var(--txt)' : 'var(--txt2)', fontWeight: isAmount ? 700 : 400 }}>
                            {val}
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--acc2)' : 'var(--txt)' }}>{row.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {row.employee_id} 
                          {row.is_special && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold' }}>SPECIAL</span>}
                          &bull; {row.location}
                        </div>
                      </div>

                      <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.designation || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.am_name || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.tl_name || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.aph || '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.ph || '—'}</div>
                      
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt)' }}>{formatCurrency(row.total_collection || 0)}</div>
                      
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)' }}>{vintage !== '—' ? \`\${vintage} d\` : '—'}</div>
                    </>
                  )}
                  
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textAlign: 'right' }}>
                    {formatCurrency(row.final_incentive || 0)}
                  </div>
                </div>`;

code = code.replace(oldRowContent, newRowContent);

fs.writeFileSync('components/IncentiveView.tsx', code);
console.log('✅ Patched IncentiveView.tsx');
