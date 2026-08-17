"use client";
import React from 'react';

interface LeadsPaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalCount: number;
  limit: number;
  setLimit: (l: number) => void;
}

export function LeadsPagination({
  page,
  setPage,
  totalCount,
  limit,
  setLimit
}: LeadsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 z-20">
      <span className="text-xs text-slate-500 font-mono text-[11px]">
        Page {page} of {totalPages} • {totalCount.toLocaleString('en-IN')} records
      </span>
      <div className="flex items-center gap-1">
        <button
          className="px-2 py-1 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-none"
          disabled={page <= 1}
          onClick={() => setPage(1)}
        >
          «
        </button>
        <button
          className="px-2 py-1 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-none"
          disabled={page <= 1}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          ‹ Prev
        </button>
        <span className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-none shadow-2xs">
          {page}
        </span>
        <button
          className="px-2 py-1 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-none"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next ›
        </button>
        <button
          className="px-2 py-1 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-none"
          disabled={page >= totalPages}
          onClick={() => setPage(totalPages)}
        >
          »
        </button>
        
        <select
          className="ml-3 text-[11px] font-semibold border border-slate-300 rounded-none px-2 py-1 bg-white text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
          value={limit}
          onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
        >
          <option value="25">25 / page</option>
          <option value="50">50 / page</option>
          <option value="100">100 / page</option>
        </select>
      </div>
    </div>
  );
}
