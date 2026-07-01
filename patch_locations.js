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

    // 1. Add missing state variables
    if (!code.includes('const [uiConfig')) {
        code = code.replace(
            /const \[search, setSearch\] = useState\(""\);/,
            `const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [uiConfig, setUiConfig] = useState<{ columns: string[], filters: string[] }>({ columns: [], filters: [] });`
        );
    }

    // 2. Fix useEffect dependencies
    code = code.replace(
        /  \}, \[search, selectedLocation, selectedAM, selectedTL, selectedAPH, selectedPH, selectedDesig, filterMonth, filterYear\]\);/g,
        `  }, [search, activeFilters, filterMonth, filterYear]);`
    );

    // 3. Fix API result parsing in fetchData
    code = code.replace(
        /        if \(result\.column_config && result\.column_config\.length > 0\) setColumnConfig\(result\.column_config\);/g,
        `        if (result.ui_config) setUiConfig(result.ui_config);
        else setUiConfig({ columns: [], filters: [] });
        if (result.column_config && result.column_config.length > 0) setColumnConfig(result.column_config);`
    );

    // 4. Replace filter calculation
    const oldFilterLogic = `  const locationStats = data.reduce((acc, row) => {
    const loc = row.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueLocations = Object.keys(locationStats).sort();
  const uniqueAMs = Array.from(new Set(data.map(d => d.am_name).filter(x => x && x !== '—'))).sort();
  const uniqueTLs = Array.from(new Set(data.map(d => d.tl_name).filter(x => x && x !== '—'))).sort();
  const uniqueAPHs = Array.from(new Set(data.map(d => d.aph).filter(x => x && x !== '—'))).sort();
  const uniquePHs = Array.from(new Set(data.map(d => d.ph).filter(x => x && x !== '—'))).sort();
  const uniqueDesigs = Array.from(new Set(data.map(d => d.designation).filter(x => x && x !== '—'))).sort();

  const filteredData = data.filter(r => {
    const locMatch = !selectedLocation || selectedLocation === "All" || r.location === selectedLocation || (!r.location && selectedLocation === "Unknown");
    const amMatch = !selectedAM || r.am_name === selectedAM;
    const tlMatch = !selectedTL || r.tl_name === selectedTL;
    const aphMatch = !selectedAPH || r.aph === selectedAPH;
    const phMatch = !selectedPH || r.ph === selectedPH;
    const desigMatch = !selectedDesig || r.designation === selectedDesig;
    
    const searchMatch = (
      (r.name?.toLowerCase().includes(search.toLowerCase())) ||
      (r.employee_id?.toLowerCase().includes(search.toLowerCase())) ||
      (r.location?.toLowerCase().includes(search.toLowerCase())) ||
      (r.designation?.toLowerCase().includes(search.toLowerCase()))
    );
    return locMatch && amMatch && tlMatch && aphMatch && phMatch && desigMatch && searchMatch;
  });`;

    const newFilterLogic = `  const uniqueFilterValues = React.useMemo(() => {
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
  });`;

    if (!code.includes('const uniqueFilterValues = React.useMemo')) {
        code = code.replace(oldFilterLogic, newFilterLogic);
    }

    // 5. Replace Grid Logic
    const oldTableStr = `      {/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minWidth: 900, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplateCols, background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
          {['#', ...reqCols, 'Incentive'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h.replace(/_/g,' ')}</div>
          ))}
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

              return (
                <div key={row.employee_id}
                  onClick={() => setSelectedRecord(row)}
                  style={{
                    display: 'grid', gridTemplateColumns: gridTemplateCols,
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
                  {reqCols.map((col, ci) => (
                    <React.Fragment key={ci}>{renderCell(col, row, vintage)}</React.Fragment>
                  ))}
                  
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textAlign: 'right' }}>
                    {formatCurrency(row.final_incentive || 0)}
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
        </div>`;

    const newTableStr = `      {/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minWidth: uiConfig.columns?.length > 0 ? \`\${(uiConfig.columns.length * 120) + 110}px\` : 900, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: uiConfig.columns?.length > 0 
            ? \`30px \${uiConfig.columns.map(() => 'minmax(120px, 1fr)').join(' ')} 80px\`
            : gridTemplateCols, 
          background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 
        }}>
          {uiConfig.columns?.length > 0 ? (
            ['#', ...uiConfig.columns.map(c => c.replace(/_/g, ' ')), 'Incentive'].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h}</div>
            ))
          ) : (
            ['#', ...reqCols, 'Incentive'].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h.replace(/_/g,' ')}</div>
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

              return (
                <div key={row.employee_id}
                  onClick={() => setSelectedRecord(row)}
                  style={{
                    display: 'grid', 
                    gridTemplateColumns: uiConfig.columns?.length > 0 
                      ? \`30px \${uiConfig.columns.map(() => 'minmax(120px, 1fr)').join(' ')} 80px\`
                      : gridTemplateCols,
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
                        {reqCols.map((col, ci) => (
                          <React.Fragment key={ci}>{renderCell(col, row, vintage)}</React.Fragment>
                        ))}
                      </>
                    )}
                  
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981', textAlign: 'right' }}>
                    {formatCurrency(row.final_incentive || 0)}
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
        </div>`;

    if (code.includes('overflowX: \'auto\'') && !code.includes('uiConfig.columns?.length > 0')) {
        code = code.replace(oldTableStr, newTableStr);
    }

    // 6. Replace drop-down filters
    const oldDropdowns = `        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedDesig}
          onChange={e => {
            setSelectedDesig(e.target.value);
            setSelectedPH(""); setSelectedAPH(""); setSelectedAM(""); setSelectedTL("");
            setPage(1);
          }}
        >
          <option value="">Designation</option>
          {uniqueDesigs.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
        </select>

        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedPH}
          onChange={e => {
            setSelectedPH(e.target.value);
            setSelectedDesig(""); setSelectedAPH(""); setSelectedAM(""); setSelectedTL("");
            setPage(1);
          }}
        >
          <option value="">PH Name</option>
          {uniquePHs.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
        </select>

        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedAPH}
          onChange={e => {
            setSelectedAPH(e.target.value);
            setSelectedDesig(""); setSelectedPH(""); setSelectedAM(""); setSelectedTL("");
            setPage(1);
          }}
        >
          <option value="">APH Name</option>
          {uniqueAPHs.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
        </select>

        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedAM}
          onChange={e => {
            setSelectedAM(e.target.value);
            setSelectedDesig(""); setSelectedPH(""); setSelectedAPH(""); setSelectedTL("");
            setPage(1);
          }}
        >
          <option value="">AM Name</option>
          {uniqueAMs.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
        </select>

        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedTL}
          onChange={e => {
            setSelectedTL(e.target.value);
            setSelectedDesig(""); setSelectedPH(""); setSelectedAPH(""); setSelectedAM("");
            setPage(1);
          }}
        >
          <option value="">TL Name</option>
          {uniqueTLs.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
        </select>

        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedLocation}
          onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
        >
          <option value="">Location</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>`;

    const newDropdowns = `        {uiConfig.filters && uiConfig.filters.map(filterKey => (
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
        ))}`;

    if (!code.includes('uiConfig.filters && uiConfig.filters.map')) {
        code = code.replace(oldDropdowns, newDropdowns);
    }

    fs.writeFileSync(file, code);
    console.log('✅ Patched', file);
}
