"use client";
import React from 'react';
import { FileText, Download, Trash2, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

interface AdminKekaExcelsProps {
  excels: any[];
  excelsLoading: boolean;
  onDeleteExcel: (id: string) => void;
  kekaMonth?: number;
  setKekaMonth?: (m: number) => void;
  kekaYear?: number;
  setKekaYear?: (y: number) => void;
  onClearFilters?: () => void;
}

export function AdminKekaExcels({
  excels = [],
  excelsLoading,
  onDeleteExcel,
  kekaMonth = new Date().getMonth() + 1,
  setKekaMonth,
  kekaYear = new Date().getFullYear(),
  setKekaYear,
  onClearFilters
}: AdminKekaExcelsProps) {
  const safeExcels = Array.isArray(excels) ? excels : [];
  const kekaExcels = safeExcels.filter((j: any) => j.job_type === 'KEKA' && j.status !== 'DELETED_BY_ADMIN');

  const formatPeriod = (targetDate?: string, createdAt?: string) => {
    const dStr = targetDate || createdAt;
    if (!dStr) return '—';
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/50">
      {/* Header Toolbar */}
      <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#024e4d] text-white shrink-0 shadow-2xs">
            <FileText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Keka Upload History</h1>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
                {kekaExcels.length} Batches
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Audit, download and delete monthly Keka HR master rosters.</p>
          </div>
        </div>

        {/* Month and Year Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {setKekaMonth && (
            <select
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
              value={kekaMonth}
              onChange={(e) => setKekaMonth(parseInt(e.target.value))}
            >
              <option value={0}>All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          )}

          {setKekaYear && (
            <select
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
              value={kekaYear}
              onChange={(e) => setKekaYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-none transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Uploaded History Table */}
      <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5">Batch / File Name</th>
                <th className="px-3 py-2.5">Roster Period</th>
                <th className="px-3 py-2.5">Uploaded By</th>
                <th className="px-3 py-2.5">Upload Date</th>
                <th className="px-3 py-2.5 text-right font-mono">Headcount Rows</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {excelsLoading ? (
                <TableRowSkeleton cols={7} rows={4} />
              ) : kekaExcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No Keka Excel uploads found for this selection.
                  </td>
                </tr>
              ) : (
                kekaExcels.map((job: any) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-3.5 py-2.5 font-mono text-slate-900 font-bold">
                      {job.file_name || job.filename || job.file_path || 'KEKA_MASTER.xlsx'}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-teal-800">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-teal-600 shrink-0" />
                        {formatPeriod(job.target_date, job.created_at)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{job.uploaded_by_name || 'Admin'}</span>
                        <span className="text-[10px] font-mono text-slate-400">{job.uploaded_by_employee_id || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 font-mono">
                      {job.created_at ? new Date(job.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                      {job.processed_rows || job.total_rows || 0}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {job.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          <CheckCircle2 size={11} /> Synced
                        </span>
                      ) : job.status === 'PROCESSING' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                          <Clock size={11} /> Ingesting
                        </span>
                      ) : job.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle size={11} /> Failed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600">
                          {job.status}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.file_path && (
                          <a
                            href={job.file_path}
                            download
                            className="p-1.5 text-slate-400 hover:text-teal-700 transition-colors"
                            title="Download Original File"
                          >
                            <Download size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteExcel(job.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Keka Batch & Associated Records"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
