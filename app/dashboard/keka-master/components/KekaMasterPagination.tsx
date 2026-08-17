"use client";
import React from 'react';

interface KekaMasterPaginationProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  paginatedCount: number;
}

export function KekaMasterPagination({
  page,
  setPage,
  totalPages,
  totalCount,
  pageSize,
  paginatedCount
}: KekaMasterPaginationProps) {
  if (totalPages <= 1 && totalCount <= pageSize) return null;

  const start = paginatedCount ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200/90 shadow-2xs">
      <div className="text-xs text-slate-500 font-mono">
        Showing <span className="font-bold text-slate-900">{start}</span> to{' '}
        <span className="font-bold text-slate-900">{end}</span> of{' '}
        <span className="font-bold text-slate-900">{totalCount}</span> employees
      </div>

      <div className="flex items-center gap-1.5">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs rounded-none cursor-pointer"
        >
          Previous
        </button>
        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs rounded-none cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
