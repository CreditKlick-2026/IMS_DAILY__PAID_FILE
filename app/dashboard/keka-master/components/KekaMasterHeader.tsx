"use client";
import React from 'react';
import { Users, Download } from 'lucide-react';

interface KekaMasterHeaderProps {
  totalCount: number;
  onDownloadExcel: () => void;
}

export function KekaMasterHeader({ totalCount, onDownloadExcel }: KekaMasterHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#024e4d] text-white shrink-0 shadow-2xs rounded-none">
          <Users size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Employee Master Directory</h1>
            <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
              Keka Master DB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage employee master mappings, designations, agent OHRs, and special incentive rules.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <div className="bg-slate-50 text-slate-700 border border-slate-300 font-mono px-3 py-1.5 text-xs font-bold shadow-2xs">
          {totalCount.toLocaleString()} <span className="font-normal text-slate-400">Headcount</span>
        </div>
        <button
          onClick={onDownloadExcel}
          disabled={totalCount === 0}
          className="px-3.5 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs rounded-none disabled:opacity-50"
        >
          <Download size={13} />
          <span>Export Excel</span>
        </button>
      </div>
    </div>
  );
}
