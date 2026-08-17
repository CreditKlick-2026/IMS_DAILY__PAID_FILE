"use client";
import React from 'react';
import { X, Save, Edit } from 'lucide-react';

interface EditEmployeeModalProps {
  editingEmployee: any;
  setEditingEmployee: (emp: any) => void;
  saving: boolean;
  onUpdate: (e: React.FormEvent) => void;
  locations?: string[];
  clients?: string[];
  kekaColumns?: any[];
}

const CORE_KEYS = [
  'location', 'employee_id', 'name', 'designation', 
  'agent_ohr', 'doj', 'doc', 'salary', 'tl_name', 
  'am_name', 'client', 'product'
];

export function EditEmployeeModal({
  editingEmployee,
  setEditingEmployee,
  saving,
  onUpdate,
  locations = [],
  clients = [],
  kekaColumns = []
}: EditEmployeeModalProps) {
  if (!editingEmployee) return null;

  const customColumns = kekaColumns.filter(c => !CORE_KEYS.includes(c.key));

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 rounded-none max-h-[90vh] flex flex-col">
        <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#024e4d] text-white">
              <Edit size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Edit Master Record</h2>
              <p className="text-[10px] text-slate-500 font-mono">Emp ID: {editingEmployee.employee_id}</p>
            </div>
          </div>
          <button onClick={() => setEditingEmployee(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUpdate(e);
          }} 
          className="p-5 space-y-4 text-xs overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <input
                value={editingEmployee.name || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                required
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Designation</label>
              <input
                value={editingEmployee.designation || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Location (Backend Master)</label>
              <select
                value={editingEmployee.location || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, location: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none cursor-pointer"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Client (Backend Master)</label>
              <select
                value={editingEmployee.client || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, client: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none cursor-pointer"
              >
                <option value="">Select Client</option>
                {clients.map((cli) => (
                  <option key={cli} value={cli}>{cli}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Product</label>
              <input
                value={editingEmployee.product || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, product: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Salary (₹)</label>
              <input
                type="number"
                value={editingEmployee.salary || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Agent OHR</label>
              <input
                value={editingEmployee.agent_ohr || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, agent_ohr: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">TL Name</label>
              <input
                value={editingEmployee.tl_name || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, tl_name: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">AM Name</label>
              <input
                value={editingEmployee.am_name || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, am_name: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">DOJ</label>
              <input
                type="date"
                value={editingEmployee.doj ? new Date(editingEmployee.doj).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, doj: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">DOC</label>
              <input
                type="date"
                value={editingEmployee.doc ? new Date(editingEmployee.doc).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, doc: e.target.value })}
                className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
              />
            </div>

            {/* Dynamic Custom Columns (e.g. test) */}
            {customColumns.map(col => (
              <div key={col.key}>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{col.display}</label>
                <input
                  value={editingEmployee[col.key] ?? editingEmployee.extra_data?.[col.key] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const currentExtra = editingEmployee.extra_data || {};
                    setEditingEmployee({
                      ...editingEmployee,
                      [col.key]: val,
                      extra_data: { ...currentExtra, [col.key]: val }
                    });
                  }}
                  className="w-full bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 rounded-none"
                />
              </div>
            ))}
          </div>


          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditingEmployee(null)}
              className="px-3.5 py-1.5 bg-white border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs rounded-none cursor-pointer disabled:opacity-50"
            >
              <Save size={13} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
