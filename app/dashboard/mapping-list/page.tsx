"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Edit, X, Save } from 'lucide-react';

export default function MappingListPage() {
  const { user } = useApp();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Edit State
  const [editingMapping, setEditingMapping] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/mapping')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setData(res.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    if (!['admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [user, router]);

  const handleSave = async () => {
    if (!editingMapping) return;
    setSaving(true);
    try {
      const res = await fetch('/api/mapping', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMapping)
      });
      if (res.ok) {
        setEditingMapping(null);
        await fetchData(); // Refresh data to see new mapping
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update mapping');
      }
    } catch (err) {
      alert('Error updating mapping');
    } finally {
      setSaving(false);
    }
  };

  // Derived filtered data
  const filteredData = data.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = 
      (r.keka_name?.toLowerCase().includes(s) || '') || 
      (r.employee_id?.toLowerCase().includes(s) || '') || 
      (r.designation?.toLowerCase().includes(s) || '');
    return matchSearch;
  });

  const totalCount = filteredData.length;
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(r => ({
      "Employee ID": r.employee_id,
      "Name (Keka)": r.keka_name,
      "Name (DPF)": r.dpf_name || '-',
      "Designation": r.designation || '-',
      "Location": r.location || '-',
      "AM Assigned (DPF)": r.am || '-',
      "TL Assigned (DPF)": r.tl_name || '-'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mapping Data");
    XLSX.writeFile(wb, `Mapping_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!user || !['admin'].includes(user.role)) return null;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--txt)' }}>Employee Mapping List</h1>
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

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)', fontSize: 13 }}>⌕</span>
          <input
            style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px 6px 28px', fontSize: 11, color: 'var(--txt)', outline: 'none' }}
            placeholder="Search employee, ID, designation..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <div style={{ fontSize: 10, color: 'var(--txt3)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          {totalCount} records
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr 80px', background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
          {['#', 'Employee (Keka)', 'Designation', 'Location', 'AM (from DPF)', 'TL (from DPF)', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ overflowY: 'auto', background: 'var(--bg2)', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>Loading Mapping Records...
            </div>
          ) : !paginatedData.length ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--txt3)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>No records match your filter.
            </div>
          ) : (
            paginatedData.map((row, idx) => {
              const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
              
              return (
                <div key={row.employee_id}
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr 80px',
                    padding: '8px 10px', gap: 6, alignItems: 'center',
                    borderBottom: '1px solid #e5e7eb',
                    background: 'transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-top)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ fontSize: 10, color: 'var(--txt3)', fontWeight: 600 }}>{rowNum}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt)' }}>{row.keka_name}</div>
                    <div style={{ fontSize: 9, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {row.employee_id} 
                    </div>
                  </div>

                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.designation || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.location || '—'}</div>
                  
                  <div style={{ fontSize: 10, color: 'var(--txt2)', fontWeight: 600 }}>{row.am || <span style={{ color: 'var(--txt3)', fontWeight: 400 }}>Unassigned</span>}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)', fontWeight: 600 }}>{row.tl_name || <span style={{ color: 'var(--txt3)', fontWeight: 400 }}>Unassigned</span>}</div>
                  
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setEditingMapping({ ...row })}
                      style={{ background: 'transparent', border: '1px solid var(--bdr)', borderRadius: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4F46E5' }}
                      title="Edit Mapping"
                    >
                      <Edit size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {totalCount > PAGE_SIZE && (
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--bdr)', background: 'var(--bg-top)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--txt3)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} records
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '4px 10px', fontSize: 10, borderRadius: 4, border: '1px solid var(--bdr)', background: page === 1 ? 'transparent' : 'var(--bg)', color: page === 1 ? 'var(--txt3)' : 'var(--txt)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * PAGE_SIZE >= totalCount}
                style={{ padding: '4px 10px', fontSize: 10, borderRadius: 4, border: '1px solid var(--bdr)', background: page * PAGE_SIZE >= totalCount ? 'transparent' : 'var(--bg)', color: page * PAGE_SIZE >= totalCount ? 'var(--txt3)' : 'var(--txt)', cursor: page * PAGE_SIZE >= totalCount ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMapping && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: 12, width: '100%', maxWidth: 450, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Edit Mapping: {editingMapping.keka_name}</h2>
              <button onClick={() => setEditingMapping(null)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Designation</label>
                  <select 
                    value={editingMapping.designation || ''} 
                    onChange={e => setEditingMapping({ ...editingMapping, designation: e.target.value })} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', color: '#111827', fontSize: 13, cursor: 'pointer' }}
                  >
                    <option value="">Unassigned</option>
                    {Array.from(new Set(data.map(r => r.designation).filter(Boolean))).sort().map((des: any) => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Location</label>
                  <select 
                    value={editingMapping.location || ''} 
                    onChange={e => setEditingMapping({ ...editingMapping, location: e.target.value })} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', color: '#111827', fontSize: 13, cursor: 'pointer' }}
                  >
                    <option value="">Unassigned</option>
                    {Array.from(new Set(data.map(r => r.location).filter(Boolean))).sort().map((loc: any) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>AM Assigned</label>
                  <select 
                    value={editingMapping.am || ''} 
                    onChange={e => setEditingMapping({ ...editingMapping, am: e.target.value })} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', color: '#111827', fontSize: 13, cursor: 'pointer' }}
                  >
                    <option value="">Unassigned</option>
                    {Array.from(new Set(data.map(r => r.am).filter(Boolean))).sort().map((am: any) => (
                      <option key={am} value={am}>{am}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>TL Assigned</label>
                  <select 
                    value={editingMapping.tl_name || ''} 
                    onChange={e => setEditingMapping({ ...editingMapping, tl_name: e.target.value })} 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#f9fafb', color: '#111827', fontSize: 13, cursor: 'pointer' }}
                  >
                    <option value="">Unassigned</option>
                    {Array.from(new Set(data.map(r => r.tl_name).filter(Boolean))).sort().map((tl: any) => (
                      <option key={tl} value={tl}>{tl}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#f3f4f6' }}>
              <button onClick={() => setEditingMapping(null)} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #d1d5db', background: '#ffffff', color: '#111827', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {saving ? 'Saving...' : <><Save size={14} /> Save Mapping</>}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
