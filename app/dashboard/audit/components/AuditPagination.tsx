"use client";
import React from 'react';

interface AuditPaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export function AuditPagination({ page, setPage, totalPages }: AuditPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200/90 shadow-2xs">
      <div className="text-xs text-slate-500 font-mono">
        Showing page <span className="font-bold text-slate-900">{page}</span> of{' '}
        <span className="font-bold text-slate-900">{totalPages}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs rounded-none cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs rounded-none cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
