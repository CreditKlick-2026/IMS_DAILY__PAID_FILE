"use client";
import React from 'react';
import { Eye, Trash2, ShieldAlert } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

interface AuditTableProps {
  logs: any[];
  loading: boolean;
  selectedIds: number[];
  onToggleSelectAll: () => void;
  onToggleSelect: (id: number) => void;
  onViewDetails: (log: any) => void;
  onDeleteSingle: (id: number) => void;
  onDeleteBulk: () => void;
  isDeleting: boolean;
}

export function AuditTable({
  logs = [],
  loading,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelect,
  onViewDetails,
  onDeleteSingle,
  onDeleteBulk,
  isDeleting
}: AuditTableProps) {
  const formatActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_USER':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold font-mono">CREATED USER</span>;
      case 'DELETE_USER':
        return <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 text-[9px] font-bold font-mono">DELETED USER</span>;
      case 'UPDATE_PASSWORD':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[9px] font-bold font-mono">CHANGED PASSWORD</span>;
      case 'UPLOAD_EXCEL':
        return <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 text-[9px] font-bold font-mono">UPLOADED BATCH</span>;
      case 'DELETE_EXCEL':
        return <span className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 text-[9px] font-bold font-mono">DELETED BATCH</span>;
      case 'RULE_SET_UPDATE':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 text-[9px] font-bold font-mono">RULE MODIFIED</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[9px] font-bold font-mono">{action}</span>;
    }
  };

  const isAllSelected = logs.length > 0 && selectedIds.length === logs.length;

  return (
    <div className="border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col flex-1 rounded-none">
      {/* Bulk Action Bar if items are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-teal-900 text-white px-4 py-2 flex items-center justify-between text-xs animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedIds.length}</span>
            <span>audit records selected</span>
          </div>
          <button
            onClick={onDeleteBulk}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={12} />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600 uppercase font-bold sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2.5 w-8 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="accent-[#024e4d] cursor-pointer"
                />
              </th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Timestamp</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Action</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Entity</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap">Changed By</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap font-mono">Target ID</th>
              <th className="px-3.5 py-2.5">Payload Details</th>
              <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableRowSkeleton cols={8} rows={10} />
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                  <ShieldAlert size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No audit logs match the current search & filters.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try widening the date range or resetting query criteria.</p>
                </td>
              </tr>
            ) : (
              logs.map((log: any) => {
                const isSelected = selectedIds.includes(log.id);
                return (
                  <tr
                    key={log.id}
                    className={`transition-colors ${isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(log.id)}
                        className="accent-[#024e4d] cursor-pointer"
                      />
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {new Date(log.created_at).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {formatActionBadge(log.action)}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-mono font-semibold text-slate-700 text-[11px]">
                      {log.entity_type || log.entity || '—'}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-bold text-slate-900">
                      {log.changed_by || 'System'}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                      {log.entity_id || '—'}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '—')}
                    </td>
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDetails(log)}
                          className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Inspect Payload"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete audit log #${log.id}?`)) onDeleteSingle(log.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Delete Audit Log"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
