"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Edit, Trash2, X, Save } from 'lucide-react';

export default function KekaMasterPage() {
  const { user } = useApp();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAM, setSelectedAM] = useState("");
  const [selectedTL, setSelectedTL] = useState("");
  const [selectedDesig, setSelectedDesig] = useState("");
  
  // Edit State
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 500;

  useEffect(() => {
    setPage(1);
  }, [search, selectedLocation, selectedAM, selectedTL, selectedDesig]);

  useEffect(() => {
    // Only admins allowed to see this raw master list
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const kekaRes = await fetch('/api/keka', { cache: 'no-store' });
      const kekaResult = await kekaRes.json();
      
      if (kekaResult.success) {
        setData(kekaResult.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const locationStats = data.reduce((acc, row) => {
    const loc = row.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueLocations = Object.keys(locationStats).sort();
  const uniqueAMs = Array.from(new Set(data.map(d => d.am_name).filter(x => x && x !== '—'))).sort();
  const uniqueTLs = Array.from(new Set(data.map(d => d.tl_name).filter(x => x && x !== '—'))).sort();
  const uniqueDesigs = Array.from(new Set(data.map(d => d.designation).filter(x => x && x !== '—'))).sort();

  const filteredData = data.filter(r => {
    const locMatch = !selectedLocation || selectedLocation === "All" || r.location === selectedLocation || (!r.location && selectedLocation === "Unknown");
    const amMatch = !selectedAM || r.am_name === selectedAM;
    const tlMatch = !selectedTL || r.tl_name === selectedTL;
    const desigMatch = !selectedDesig || r.designation === selectedDesig;
    
    const searchMatch = (
      (r.name?.toLowerCase().includes(search.toLowerCase())) ||
      (r.employee_id?.toLowerCase().includes(search.toLowerCase())) ||
      (r.location?.toLowerCase().includes(search.toLowerCase())) ||
      (r.designation?.toLowerCase().includes(search.toLowerCase()))
    );
    return locMatch && amMatch && tlMatch && desigMatch && searchMatch;
  });

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  const downloadExcel = () => {
    if (filteredData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master Employees");
    const filename = `Master_Employees_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee record? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/keka/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setData(d => d.filter(x => x.employee_id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete');
      }
    } catch (e) {
      alert('Error deleting record');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/keka/${encodeURIComponent(editingEmployee.employee_id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEmployee)
      });
      if (res.ok) {
        const { data: updatedRecord } = await res.json();
        setData(d => d.map(x => x.employee_id === updatedRecord.employee_id ? updatedRecord : x));
        setEditingEmployee(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update');
      }
    } catch (err) {
      alert('Error updating record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--txt)' }}>Employee Master Data</h1>
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
            placeholder="Search employee, ID, location..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        
        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedDesig}
          onChange={e => {
            setSelectedDesig(e.target.value);
            setSelectedAM(""); setSelectedTL("");
            setPage(1);
          }}
        >
          <option value="">Designation</option>
          {uniqueDesigs.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
        </select>


        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedLocation}
          onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
        >
          <option value="">Location</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        
        <div style={{ fontSize: 10, color: 'var(--txt3)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          {totalCount} records
        </div>
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 80px 60px', background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
          {['#', 'Employee', 'Designation', 'Agent OHR', 'DOJ', 'DOC', 'Salary', 'Actions'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Salary' || h === 'Actions' ? 'right' : 'left' }}>{h}</div>
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
              const doj = row.doj ? new Date(row.doj).toLocaleDateString('en-IN') : '—';
              const doc = row.doc ? new Date(row.doc).toLocaleDateString('en-IN') : '—';
              
              return (
                <div key={row.employee_id}
                  style={{
                    display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 80px 60px',
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
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt)' }}>{row.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {row.employee_id} 
                      {row.is_special && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold' }}>SPECIAL</span>}
                      &bull; {row.location}
                    </div>
                  </div>

                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.designation || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.agent_ohr || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{doj}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{doc}</div>
                  
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textAlign: 'right' }}>
                    {row.salary ? formatCurrency(parseFloat(row.salary)) : '—'}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingEmployee({ ...row })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: 0 }} title="Edit">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(row.employee_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
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

      {/* Edit Modal */}
      {editingEmployee && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: 8, width: 600, maxWidth: '90%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--txt)' }}>Edit Employee Record</h2>
              <button onClick={() => setEditingEmployee(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt3)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Employee ID (Read Only)</label>
                  <input value={editingEmployee.employee_id} readOnly style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg-top)', color: 'var(--txt3)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Name</label>
                  <input value={editingEmployee.name || ''} onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })} required style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Designation</label>
                  <input value={editingEmployee.designation || ''} onChange={e => setEditingEmployee({ ...editingEmployee, designation: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Location</label>
                  <input value={editingEmployee.location || ''} onChange={e => setEditingEmployee({ ...editingEmployee, location: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Salary (₹)</label>
                  <input type="number" value={editingEmployee.salary || ''} onChange={e => setEditingEmployee({ ...editingEmployee, salary: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Agent OHR</label>
                  <input value={editingEmployee.agent_ohr || ''} onChange={e => setEditingEmployee({ ...editingEmployee, agent_ohr: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Date of Joining (DOJ)</label>
                  <input type="date" value={editingEmployee.doj ? new Date(editingEmployee.doj).toISOString().split('T')[0] : ''} onChange={e => setEditingEmployee({ ...editingEmployee, doj: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--txt2)', marginBottom: 4 }}>Date of Confirmation (DOC)</label>
                  <input type="date" value={editingEmployee.doc ? new Date(editingEmployee.doc).toISOString().split('T')[0] : ''} onChange={e => setEditingEmployee({ ...editingEmployee, doc: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--bdr)', background: 'var(--bg)', color: 'var(--txt)', fontSize: 13 }} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input type="checkbox" id="isSpecial" checked={editingEmployee.is_special || false} onChange={e => setEditingEmployee({ ...editingEmployee, is_special: e.target.checked })} style={{ cursor: 'pointer' }} />
                  <label htmlFor="isSpecial" style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', cursor: 'pointer' }}>Mark as SPECIAL rule applicable</label>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, borderTop: '1px solid var(--bdr)', paddingTop: 16 }}>
                <button type="button" onClick={() => setEditingEmployee(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--bdr)', borderRadius: 6, fontSize: 13, fontWeight: 600, color: 'var(--txt2)', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '8px 16px', background: '#10b981', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
