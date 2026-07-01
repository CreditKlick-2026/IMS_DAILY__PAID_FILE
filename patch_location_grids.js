const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'app/dashboard/incentive/uttam-nagar/page.tsx',
    'app/dashboard/incentive/gurugram/page.tsx',
    'app/dashboard/incentive/delhi/page.tsx',
    'app/dashboard/incentive/pune/page.tsx'
];

for (const file of filesToPatch) {
    if (!fs.existsSync(file)) continue;
    let code = fs.readFileSync(file, 'utf8');
    
    // Normalize newlines
    code = code.replace(/\r\n/g, '\n');

    // 0. State variables
    if (!code.includes('const [uiConfig')) {
        code = code.replace(
            /const \[search, setSearch\] = useState\(""\);/,
            `const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [uiConfig, setUiConfig] = useState<{ columns: string[], filters: string[] }>({ columns: [], filters: [] });`
        );
    }
    
    // 0.1 Fetch Logic
    if (!code.includes('setUiConfig(result.ui_config)')) {
        code = code.replace(
            /if \(result\.column_config && result\.column_config\.length > 0\) setColumnConfig\(result\.column_config\);/,
            `if (result.ui_config) setUiConfig(result.ui_config); else setUiConfig({ columns: [], filters: [] });
        if (result.column_config && result.column_config.length > 0) setColumnConfig(result.column_config);`
        );
    }

    // 1. Add uniqueFilterValues logic
    if (!code.includes('const uniqueFilterValues = React.useMemo')) {
        const oldFilterLogicStart = code.indexOf('const filteredData = data.filter(r => {');
        const oldFilterLogicEnd = code.indexOf('const totalCount = filteredData.length;');
        
        if (oldFilterLogicStart !== -1 && oldFilterLogicEnd !== -1) {
            const before = code.substring(0, code.indexOf('const locationStats = '));
            const after = code.substring(oldFilterLogicEnd);
            
            const newFilterLogic = `
  const uniqueFilterValues = React.useMemo(() => {
    const filtersObj: Record<string, string[]> = {};
    if (!uiConfig.filters) return filtersObj;
    uiConfig.filters.forEach(key => {
        filtersObj[key] = Array.from(new Set(data.map(d => {
            const val = d[key] || d[key.toLowerCase()];
            return typeof val === 'string' ? val : '';
        }).filter(x => x && x !== '—'))).sort();
    });
    return filtersObj;
  }, [data, uiConfig.filters]);

  const filteredData = data.filter(r => {
    for (const [key, selectedVal] of Object.entries(activeFilters)) {
      if (selectedVal && selectedVal !== "All") {
        const rowVal = r[key] || r[key.toLowerCase()];
        if (rowVal !== selectedVal) return false;
      }
    }
    
    const searchMatch = !search || (
      (r.name?.toLowerCase().includes(search.toLowerCase())) ||
      (r.employee_id?.toLowerCase().includes(search.toLowerCase())) ||
      (r.location?.toLowerCase().includes(search.toLowerCase())) ||
      (r.designation?.toLowerCase().includes(search.toLowerCase()))
    );
    return searchMatch;
  });

  `;
            code = before + newFilterLogic + after;
        }
    }

    // 2. Replace filters
    if (code.includes('value={selectedDesig}')) {
        const filtersStart = code.indexOf('<div style={{ display: \'flex\', gap: 10, marginBottom: 12, alignItems: \'center\', flexWrap: \'wrap\' }}>');
        const filtersEnd = code.indexOf('{/* Table */}');
        
        if (filtersStart !== -1 && filtersEnd !== -1) {
            const before = code.substring(0, filtersStart);
            const after = code.substring(filtersEnd);
            
            const newFilters = `<div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)', fontSize: 13 }}>⌕</span>
          <input
            style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px 6px 28px', fontSize: 11, color: 'var(--txt)', outline: 'none' }}
            placeholder="Search employee, ID, location..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        {uiConfig.filters && uiConfig.filters.map(filterKey => (
          <select
            key={filterKey}
            style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120, textTransform: 'capitalize' }}
            value={activeFilters[filterKey] || ""}
            onChange={e => {
              setActiveFilters(prev => ({ ...prev, [filterKey]: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">{filterKey.replace(/_/g, ' ')}</option>
            {uniqueFilterValues[filterKey]?.map((x: string) => <option key={x} value={x}>{x}</option>)}
          </select>
        ))}

        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 100 }}
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}</option>
          ))}
        </select>

        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 80 }}
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
        >
          <option value="">All Years</option>
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        
        <div style={{ fontSize: 10, color: 'var(--txt3)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          {totalCount} records
        </div>
      </div>

      )}

      `;
            code = before + newFilters + after;
        }
    }

    // 3. Replace Table
    if (code.includes('gridTemplateColumns: \'30px')) {
        const tableStart = code.indexOf('{/* Table */}');
        const paginationStart = code.indexOf('{/* Pagination */}');
        
        if (tableStart !== -1 && paginationStart !== -1) {
            const before = code.substring(0, tableStart);
            const after = code.substring(paginationStart);
            
            const newTable = `{/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minWidth: uiConfig.columns?.length > 0 ? \`\${(uiConfig.columns.length * 120) + 110}px\` : 900, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: uiConfig.columns?.length > 0 
            ? \`30px \${uiConfig.columns.map(() => 'minmax(120px, 1fr)').join(' ')} 80px\`
            : '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px', 
          background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 
        }}>
          {uiConfig.columns?.length > 0 ? (
            ['#', ...uiConfig.columns.map(c => c.replace(/_/g, ' ')), 'Incentive'].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h}</div>
            ))
          ) : (
            ['#', 'Employee', 'Designation', 'AM Name', 'TL Name', 'APH', 'PH', 'Collection', 'Vintage', 'Incentive'].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h}</div>
            ))
          )}
        </div>

        {/* Rows */}
        <div style={{ overflowY: 'auto', background: 'var(--bg2)', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>Loading Master Records...
            </div>
          
          ) : !paginatedData.length ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>No records match your filter.
            </div>
          ) : (
            paginatedData.map((row, idx) => {
              const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
              const isSelected = selectedRecord?.employee_id === row.employee_id;
              
              const totalDays = row.doc ? Math.floor((new Date().getTime() - new Date(row.doc).getTime()) / (1000 * 60 * 60 * 24)) : null;
              let vintage = '—';
              if (totalDays !== null) {
                if (totalDays <= 30) vintage = '0-30';
                else if (totalDays <= 60) vintage = '31-60';
                else if (totalDays <= 90) vintage = '61-90';
                else if (totalDays <= 120) vintage = '91-120';
                else vintage = '120+';
              }

              const formatCurrencyInner = (amt: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

              return (
                <div key={row.employee_id}
                  onClick={() => setSelectedRecord(row)}
                  style={{
                    display: 'grid', 
                    gridTemplateColumns: uiConfig.columns?.length > 0 
                      ? \`30px \${uiConfig.columns.map(() => 'minmax(120px, 1fr)').join(' ')} 80px\`
                      : '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px',
                    padding: '8px 10px', gap: 6, alignItems: 'center',
                    borderBottom: '1px solid #e5e7eb',
                    background: isSelected ? 'rgba(79,125,255,0.08)' : 'transparent',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-top)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600 }}>{rowNum}</div>
                  
                  {uiConfig.columns?.length > 0 ? (
                      <>
                        {uiConfig.columns.map((col: string) => {
                          let val: any = '—';
                          const lowerCol = col.toLowerCase();
                          if (lowerCol.includes('name') && !lowerCol.includes('tl') && !lowerCol.includes('am')) {
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
                             val = formatCurrencyInner(row.total_collection || 0);
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
                          const isLongText = typeof val === 'string' && val.length > 30;
                          return (
                            <div 
                              key={col} 
                              title={isLongText ? val : undefined}
                              style={{ 
                                fontSize: 10, 
                                color: isAmount ? 'var(--txt)' : 'var(--txt2)', 
                                fontWeight: isAmount ? 700 : 400,
                                display: isLongText ? '-webkit-box' : 'block',
                                WebkitLineClamp: isLongText ? 2 : 'none',
                                WebkitBoxOrient: 'vertical',
                                overflow: isLongText ? 'hidden' : 'visible',
                                wordBreak: 'break-word',
                                maxHeight: isLongText ? '32px' : 'none'
                              }}
                            >
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
                            </div>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--txt)' }}>{row.designation || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--txt)' }}>{row.am_name || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--txt)' }}>{row.tl_name || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.aph || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.ph || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--txt)', fontWeight: 700 }}>{formatCurrencyInner(row.total_collection || 0)}</div>
                        <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{vintage}</div>
                      </>
                    )}
                  
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textAlign: 'right' }}>
                    {formatCurrencyInner(row.final_incentive || 0)}
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
        </div>
        
        `;
            code = before + newTable + after;
        }
    }

    fs.writeFileSync(file, code);
    console.log('✅ Properly Patched Grid & Filters for', file);
}
