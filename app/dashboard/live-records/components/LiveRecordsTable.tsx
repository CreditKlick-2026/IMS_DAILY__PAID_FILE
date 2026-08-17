"use client";
import React from 'react';
import { FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';

interface LiveRecordsTableProps {
  records: any[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  setPage: (p: number) => void;
}

export function LiveRecordsTable({
  records,
  loading,
  total,
  page,
  limit,
  setPage
}: LiveRecordsTableProps) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col flex-1 rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Ingested DPF Record Stream</h3>
        <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-none">
          Showing {records.length} of {total.toLocaleString('en-IN')} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 font-semibold w-16">ID</th>
              <th className="px-3 py-2 font-semibold">Account No</th>
              <th className="px-3 py-2 font-semibold">Collection Agent</th>
              <th className="px-3 py-2 font-semibold">Client & Product</th>
              <th className="px-3 py-2 font-semibold">Location / Bucket</th>
              <th className="px-3 py-2 font-semibold text-right">Money Collected (₹)</th>
              <th className="px-3 py-2 font-semibold">Mode & Type</th>
              <th className="px-3 py-2 font-semibold">Leadership (TL / AM)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading live collection records...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  <FileSpreadsheet className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-800">No records found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting search query or active filter selections.</p>
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2 font-mono text-slate-400 text-[11px]">#{r.id}</td>
                  
                  {/* Account No */}
                  <td className="px-3 py-2 font-mono font-bold text-slate-900">{r.account_no || '—'}</td>

                  {/* Agent Code & Name */}
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{r.employee_name || '—'}</span>
                      <span className="font-mono text-[10px] text-slate-400">{r.employee_code || '—'}</span>
                    </div>
                  </td>

                  {/* Client & Product */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 border border-blue-200 rounded-none">
                        {r.client || '—'}
                      </span>
                      {r.product && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 border border-slate-200 rounded-none font-medium">
                          {r.product}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Location & Bucket */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span>{r.location || '—'}</span>
                      {r.bucket && (
                        <span className="text-[10px] font-mono text-slate-400">({r.bucket})</span>
                      )}
                    </div>
                  </td>

                  {/* Money Collected */}
                  <td className="px-3 py-2 text-right">
                    <span className="font-mono font-bold text-emerald-800 text-xs">
                      ₹{Number(r.money_collected || 0).toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Mode & Type */}
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 border border-slate-200 text-slate-700">
                        {r.payment_mode || 'Online'}
                      </span>
                      {r.recovery_or_upgrade && (
                        <span className="text-[10px] font-medium text-slate-500">
                          {r.recovery_or_upgrade}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* TL & AM */}
                  <td className="px-3 py-2 text-slate-600">
                    <div className="flex flex-col text-[11px]">
                      <span>TL: <strong className="text-slate-800">{r.tl_name || '—'}</strong></span>
                      {r.am && <span className="text-[10px] text-slate-400">AM: {r.am}</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-mono text-[11px]">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 disabled:opacity-40 rounded-none cursor-pointer font-medium flex items-center gap-1"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 disabled:opacity-40 rounded-none cursor-pointer font-medium flex items-center gap-1"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
