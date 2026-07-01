"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import TraceEngine from '@/components/TraceEngine';
import * as XLSX from 'xlsx';

export default function IncentivePage() {
  const { user } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [uiConfig, setUiConfig] = useState<{ columns: string[], filters: string[] }>({ columns: [], filters: [] });
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAM, setSelectedAM] = useState("");
  const [selectedTL, setSelectedTL] = useState("");
  const [selectedAPH, setSelectedAPH] = useState("");
  const [selectedPH, setSelectedPH] = useState("");
  const [selectedDesig, setSelectedDesig] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [specialGridRules, setSpecialGridRules] = useState<any[]>([]);
  const [associateTenuredGrid, setAssociateTenuredGrid] = useState<any[]>([]);
  const [associateVintageGrid, setAssociateVintageGrid] = useState<any[]>([]);
  const [leadershipGrid, setLeadershipGrid] = useState<any[]>([]);
  const [assignedGrid, setAssignedGrid] = useState<string>("");
  const [grid2Slabs, setGrid2Slabs] = useState<any[]>([]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 100;
  
  const [filterMonth, setFilterMonth] = useState("");
  const [filterLocation, setFilterLocation] = useState("Gurugram");
  const [filterClient, setFilterClient] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [clientOptions, setClientOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);

  // Fetch metadata for dropdowns
  useEffect(() => {
    Promise.all([fetch('/api/universal/clients'), fetch('/api/universal/locations'), fetch('/api/universal/products')]).then(async ([c, l, p]) => {
      const clients = await c.json();
      const locations = await l.json();
      const products = await p.json();
      setClientOptions(clients.success ? clients.data : []);
      setLocationOptions(locations.success ? locations.data : []);
      setProductOptions(products.success ? products.data : []);
  });
  }, []);

  
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    setPage(1);
  }, [search, selectedLocation, selectedAM, selectedTL, selectedAPH, selectedPH, selectedDesig, filterMonth, filterYear]);

  useEffect(() => {
    // Only admins allowed to see this raw master list
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      if (filterClient && filterProduct) {
        fetchData();
      } else {
        setData([]);
      }
    }
  }, [user, filterMonth, filterYear, filterLocation, filterClient, filterProduct]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('groupBy', 'employee_code');
      if (filterMonth) queryParams.append('month', filterMonth);
      if (filterYear) queryParams.append('year', filterYear);
      if (filterClient) queryParams.append('client', filterClient);
      if (filterProduct) queryParams.append('product', filterProduct);
      queryParams.append('location', "Gurugram");

      const [kekaRes, incRes] = await Promise.all([
        fetch('/api/keka', { cache: 'no-store' }),
        fetch(`/api/incentives?${queryParams.toString()}`, { cache: 'no-store' })
      ]);
      
      const kekaResult = await kekaRes.json();
      const incResult = await incRes.json();
      
      if (kekaResult.success) {
        const kekaData = kekaResult.data;
        const incData = incResult.success ? incResult.data : [];
        if (incResult.ui_config) setUiConfig(incResult.ui_config); else setUiConfig({ columns: [], filters: [] });
        if (incResult.special_grid_rules) {
            setSpecialGridRules(incResult.special_grid_rules);
        }
        if (incResult.associateTenuredGrid) setAssociateTenuredGrid(incResult.associateTenuredGrid);
        if (incResult.associateVintageGrid) setAssociateVintageGrid(incResult.associateVintageGrid);
        if (incResult.leadershipGrid) setLeadershipGrid(incResult.leadershipGrid);
        if (incResult.assigned_grid) setAssignedGrid(incResult.assigned_grid);
        if (incResult.grid2Slabs) setGrid2Slabs(incResult.grid2Slabs);
        
        let mergedData = [];
        if (filterLocation || filterClient || filterProduct) {
            mergedData = incData.map((match: any) => {
                const emp = kekaData.find((e: any) => e.employee_id === match.employee_id) || {};
                return {
                    ...emp,
                    ...match,
                    name: match.name || emp.name || match.employee_id,
                    final_incentive: match.incentive || 0,
                    total_collection: match.total_collection || 0,
                    am_name: match.am_name || emp.am_name || '—',
                    tl_name: match.tl_name || emp.tl_name || '—',
                    aph: match.aph || emp.aph || '—',
                    ph: match.ph || emp.ph || '—',
                    designation: match.designation || emp.designation || '—'
                };
            });
        } else {
            mergedData = kekaData.map((emp: any) => {
                const match = incData.find((inc: any) => inc.employee_id === emp.employee_id) || {};
                return {
                    ...emp,
                    ...match,
                    name: match.name || emp.name || emp.employee_id,
                    final_incentive: match.incentive || 0,
                    total_collection: match.total_collection || 0,
                    am_name: match.am_name || emp.am_name || '—',
                    tl_name: match.tl_name || emp.tl_name || '—',
                    aph: match.aph || emp.aph || '—',
                    ph: match.ph || emp.ph || '—',
                    designation: match.designation || emp.designation || '—'
                };
            });
        }
        
        setData(mergedData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  
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

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  // Stats
  const totalIncentives = filteredData.reduce((sum, r) => sum + (r.final_incentive || 0), 0);
  const totalColl = filteredData.reduce((sum, r) => sum + (r.total_collection || 0), 0);

  const downloadExcel = () => {
    if (filteredData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incentives");
    const filename = `Incentives_${filterMonth || 'All'}_${filterYear || 'All'}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Dynamic Top Flow Viewer */}
      {selectedRecord && (
        <div style={{ marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--bdr)' }}>
            <TraceEngine 
                record={selectedRecord} 
                assignedGrid={assignedGrid}
                grid2Slabs={grid2Slabs} 
                specialGridRules={specialGridRules} 
                associateTenuredGrid={associateTenuredGrid}
                associateVintageGrid={associateVintageGrid}
                leadershipGrid={leadershipGrid}
                onClose={() => setSelectedRecord(null)} 
            />
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--txt)' }}>Incentive Master</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {false && (
            <select
              style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--txt)', outline: 'none' }}
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setFilterClient(''); }}
            >
              <option value="">All Locations</option>
              {locationOptions.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
            </select>
          )}
          
          <select
              style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--txt)', outline: 'none' }}
              value={filterClient}
              onChange={e => {
                  const val = e.target.value;
                  setFilterClient(val);
                  const client = clientOptions.find(c => c.name === val);
                  if (client && client.product_type) {
                      setFilterProduct(client.product_type);
                  } else {
                      setFilterProduct('');
                  }
              }}
          >
              <option value="">All Clients</option>
              {clientOptions.filter(c => filterLocation ? c.location_names?.includes(filterLocation) : true).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>

          <select
              style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--txt)', outline: 'none' }}
              value={filterProduct}
              onChange={e => setFilterProduct(e.target.value)}
          >
              <option value="">All Products</option>
              {productOptions
                .filter(p => {
                    if (filterClient) {
                        const client = clientOptions.find(c => c.name === filterClient);
                        return client ? client.product_type === p.name : true;
                    }
                    if (!filterLocation) return true;
                    return clientOptions.some(c => c.location_names?.includes(filterLocation) && c.product_type === p.name);
                })
                .map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          
          <select
            style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--txt)', outline: 'none' }}
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {Array.from({length: 12}).map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          
          <select
            style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--txt)', outline: 'none' }}
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button
          onClick={downloadExcel}
          style={{
            background: '#4F46E5',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Excel
        </button>
      </div>

      {(!filterClient || !filterProduct) ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--txt3)', background: 'var(--bg2)', borderRadius: 8, border: '1px dashed var(--bdr)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🏢</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--txt)' }}>Please select a Client and Product</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Select a client from the dropdown to load the incentive data for this location.</div>
        </div>
      ) : (
        <>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Employees', val: (!filterClient || !filterProduct) ? '-' : totalCount, color: 'var(--acc2)', bg: 'rgba(79,125,255,0.06)' },
          { label: 'Active Incentives', val: (!filterClient || !filterProduct) ? '-' : filteredData.filter(d => d.final_incentive > 0).length, color: '#22c55e', bg: 'rgba(34,197,94,0.06)' },
          { label: 'Total Collection', val: (!filterClient || !filterProduct) ? '-' : formatCurrency(totalColl), color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
          { label: 'Total Payout', val: (!filterClient || !filterProduct) ? '-' : formatCurrency(totalIncentives), color: '#10b981', bg: 'rgba(16,185,129,0.06)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 6, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 9, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      {(!filterClient || !filterProduct) ? null : (
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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

      {/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ minWidth: uiConfig.columns?.length > 0 ? `${(uiConfig.columns.length * 120) + 110}px` : 900, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: uiConfig.columns?.length > 0 
            ? `30px ${uiConfig.columns.map(() => 'minmax(120px, 1fr)').join(' ')} 80px`
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
                      ? `30px ${uiConfig.columns.map(() => 'minmax(120px, 1fr)').join(' ')} 80px`
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
                          if (lowerCol === 'employee_name' || lowerCol === 'employee name') {
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
        
        {/* Pagination */}
        <div style={{ background: 'var(--bg-top)', borderTop: '1px solid var(--bdr)', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--txt3)' }}>
            Showing {paginatedData.length ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, totalCount)}
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: page === 1 ? 'var(--txt3)' : 'var(--txt)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Prev
            </button>
            <div style={{ fontSize: 10, color: 'var(--txt)', padding: '2px 4px' }}>
              {page} / {totalPages}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 4, padding: '2px 8px', fontSize: 10, color: page >= totalPages ? 'var(--txt3)' : 'var(--txt)', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
