const fs = require('fs');
const file = 'app/dashboard/keka-master/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update imports
content = content.replace(
  /import \{ Edit, Trash2, X, Save \} from 'lucide-react';/,
  "import { Edit, Trash2, X, Save, Download, Search, Database, Users, MapPin, Briefcase } from 'lucide-react';"
);

// Replace return block
const newReturn = `
  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar bg-slate-50/30">
      <div className="w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Employee Master Data</h1>
              <p className="text-sm font-medium text-slate-500">Manage and oversee all raw Keka records</p>
            </div>
          </div>
          <button
            onClick={downloadExcel}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-sm border border-slate-200/60">
          
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all placeholder:text-slate-400"
              placeholder="Search employee, ID, location, designation..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                className="appearance-none bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all min-w-[140px] cursor-pointer"
                value={selectedDesig}
                onChange={e => {
                  setSelectedDesig(e.target.value);
                  setSelectedAM(""); setSelectedTL("");
                  setPage(1);
                }}
              >
                <option value="">All Designations</option>
                {uniqueDesigs.map(x => <option key={x as string} value={x as string}>{x as string}</option>)}
              </select>
            </div>

            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                className="appearance-none bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all min-w-[140px] cursor-pointer"
                value={selectedLocation}
                onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
          </div>
          
          <div className="ml-auto bg-primary/5 text-primary border border-primary/10 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm">
            {totalCount.toLocaleString()} Records
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Header Grid */}
          <div className="grid grid-cols-[40px_2fr_1.5fr_1fr_1fr_1fr_100px_80px] bg-slate-50/80 border-b border-slate-100 px-6 py-4 gap-4 items-center">
            {['#', 'Employee', 'Designation', 'Agent OHR', 'DOJ', 'DOC', 'Salary', 'Actions'].map((h, i) => (
              <div key={h} className={\`text-[10px] font-bold text-slate-400 uppercase tracking-widest \${i >= 6 ? 'text-right' : 'text-left'}\`}>
                {h}
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 bg-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <div className="text-sm font-semibold">Loading Master Records...</div>
              </div>
            ) : !paginatedData.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                  <Database className="w-8 h-8 text-slate-300" />
                </div>
                <div className="text-sm font-semibold">No records match your filters.</div>
              </div>
            ) : (
              paginatedData.map((row, idx) => {
                const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                const doj = row.doj ? new Date(row.doj).toLocaleDateString('en-IN') : '—';
                const doc = row.doc ? new Date(row.doc).toLocaleDateString('en-IN') : '—';
                
                return (
                  <div key={row.employee_id} className="grid grid-cols-[40px_2fr_1.5fr_1fr_1fr_1fr_100px_80px] px-6 py-3.5 gap-4 items-center border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    
                    <div className="text-xs font-bold text-slate-400">{rowNum}</div>
                    
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-bold text-slate-800">{row.name}</div>
                      <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-2">
                        {row.employee_id} 
                        {row.is_special && <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider border border-red-100/50">SPECIAL</span>}
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        {row.location}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-600">{row.designation || '—'}</div>
                    <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md w-fit">{row.agent_ohr || '—'}</div>
                    <div className="text-xs font-semibold text-slate-500">{doj}</div>
                    <div className="text-xs font-semibold text-slate-500">{doc}</div>
                    
                    <div className="text-sm font-black text-emerald-600 text-right">
                      {row.salary ? formatCurrency(parseFloat(row.salary)) : '—'}
                    </div>
                    
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingEmployee({ ...row })} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(row.employee_id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900">{paginatedData.length ? (page - 1) * PAGE_SIZE + 1 : 0}</span> to <span className="text-slate-900">{Math.min(page * PAGE_SIZE, totalCount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                Prev
              </button>
              <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-black text-slate-700">
                {page} / {totalPages}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20">
              
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Edit Employee</h2>
                    <p className="text-xs font-medium text-slate-500">Update master record details</p>
                  </div>
                </div>
                <button onClick={() => setEditingEmployee(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Employee ID (Locked)</label>
                    <input value={editingEmployee.employee_id} readOnly className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Name</label>
                    <input value={editingEmployee.name || ''} onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })} required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Designation</label>
                    <input value={editingEmployee.designation || ''} onChange={e => setEditingEmployee({ ...editingEmployee, designation: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Location</label>
                    <input value={editingEmployee.location || ''} onChange={e => setEditingEmployee({ ...editingEmployee, location: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Salary (₹)</label>
                    <input type="number" value={editingEmployee.salary || ''} onChange={e => setEditingEmployee({ ...editingEmployee, salary: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Agent OHR</label>
                    <input value={editingEmployee.agent_ohr || ''} onChange={e => setEditingEmployee({ ...editingEmployee, agent_ohr: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">DOJ</label>
                    <input type="date" value={editingEmployee.doj ? new Date(editingEmployee.doj).toISOString().split('T')[0] : ''} onChange={e => setEditingEmployee({ ...editingEmployee, doj: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">DOC</label>
                    <input type="date" value={editingEmployee.doc ? new Date(editingEmployee.doc).toISOString().split('T')[0] : ''} onChange={e => setEditingEmployee({ ...editingEmployee, doc: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-primary/30 outline-none transition-all shadow-sm" />
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 mt-2 bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="isSpecial" 
                      checked={editingEmployee.is_special || false} 
                      onChange={e => setEditingEmployee({ ...editingEmployee, is_special: e.target.checked })} 
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer accent-primary" 
                    />
                    <label htmlFor="isSpecial" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                      Mark as SPECIAL rule applicable
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
                  <button type="button" onClick={() => setEditingEmployee(null)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 disabled:opacity-70">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
\`;

const startIdx = content.indexOf('  return (');
content = content.substring(0, startIdx) + newReturn + "\n}\n";

fs.writeFileSync(file, content);
console.log('UI updated successfully');
