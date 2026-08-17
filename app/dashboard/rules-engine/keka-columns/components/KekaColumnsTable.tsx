"use client";
import React from 'react';
import { Columns, Trash2, Edit3, Check, X } from 'lucide-react';

interface KekaColumnsTableProps {
  columns: any[];
  loading: boolean;
  coreKeys: string[];
  editingKey: string | null;
  editDisplay: string;
  setEditDisplay: (val: string) => void;
  editLabels: string;
  setEditLabels: (val: string) => void;
  onStartEdit: (col: any) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDeleteColumn: (key: string) => void;
  isConfigReady: boolean;
}

export function KekaColumnsTable({
  columns,
  loading,
  coreKeys,
  editingKey,
  editDisplay,
  setEditDisplay,
  editLabels,
  setEditLabels,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteColumn
}: KekaColumnsTableProps) {
  return (
    <div className="border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col flex-1 rounded-none">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Keka Master Schema Directory</h3>
        <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
          {columns.length} Schema Rules Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-3.5 py-2.5 w-36">Internal Key</th>
              <th className="px-3.5 py-2.5 w-44">Display Label</th>
              <th className="px-3.5 py-2.5">Similar Recognized Aliases (Capital/Small/Gaps)</th>
              <th className="px-3.5 py-2.5 w-24 text-center">Type</th>
              <th className="px-3.5 py-2.5 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#024e4d] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold">Loading column mappings...</span>
                  </div>
                </td>
              </tr>
            ) : columns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                  <Columns className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-800">No columns defined for this schema</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Custom Column" to define new fields.</p>
                </td>
              </tr>
            ) : (
              columns.map((col) => {
                const isCore = coreKeys.includes(col.key);
                const isEditing = editingKey === col.key;

                return (
                  <tr key={col.key} className="hover:bg-slate-50 transition-colors">
                    {/* Key */}
                    <td className="px-3.5 py-2.5 font-mono text-slate-900 font-bold">
                      {col.key}
                    </td>

                    {/* Display Label */}
                    <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDisplay}
                          onChange={(e) => setEditDisplay(e.target.value)}
                          className="w-full px-2 py-1 border border-teal-500 bg-white outline-none rounded-none text-xs"
                        />
                      ) : (
                        col.display
                      )}
                    </td>

                    {/* Aliases */}
                    <td className="px-3.5 py-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editLabels}
                          onChange={(e) => setEditLabels(e.target.value)}
                          className="w-full px-2 py-1 border border-teal-500 bg-white outline-none rounded-none text-xs font-mono"
                          placeholder="e.g. Employee ID, EmployeeId, EMP ID, EMPID, employee_id"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(col.labels || []).map((label: string, i: number) => (
                            <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 border border-slate-200">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Type Tag */}
                    <td className="px-3.5 py-2.5 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase font-mono ${
                        isCore ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}>
                        {isCore ? 'Core' : 'Custom'}
                      </span>
                    </td>

                    {/* Actions: Edit & PostgreSQL Integrity Delete */}
                    <td className="px-3.5 py-2.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={onSaveEdit}
                            className="p-1 bg-[#024e4d] text-white hover:bg-[#036261] rounded-none transition-colors cursor-pointer"
                            title="Save Rule"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={onCancelEdit}
                            className="p-1 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-none transition-colors cursor-pointer"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onStartEdit(col)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                            title="Edit Aliases"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteColumn(col.key)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                            title="Delete Column (Requires 0 DB records)"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
