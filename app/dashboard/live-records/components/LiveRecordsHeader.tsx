"use client";
import React from 'react';
import { Activity, Download, RefreshCw, Radio } from 'lucide-react';

interface LiveRecordsHeaderProps {
  totalRecords: number;
  loading: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
}

export function LiveRecordsHeader({
  totalRecords,
  loading,
  onRefresh,
  onExportCSV
}: LiveRecordsHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 text-white shrink-0 rounded-none shadow-2xs">
          <Activity size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Live DPF Collection Records</h1>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-emerald-200 rounded-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-600 animate-pulse"></span>
              {totalRecords.toLocaleString('en-IN')} Live Records Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ingested Daily Paid Files (DPF) collection accounts and agent transaction logs.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="h-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
          <span>Refresh</span>
        </button>

        <button
          onClick={onExportCSV}
          className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-3.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}
