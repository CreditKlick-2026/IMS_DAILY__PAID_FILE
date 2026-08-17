"use client";
import React from 'react';
import { UploadCloud, Calendar, Clock } from 'lucide-react';

interface UploadHeaderProps {
  globalDate: string;
  countdown: string;
}

export function UploadHeader({ globalDate, countdown }: UploadHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#024e4d] text-white shrink-0 rounded-none shadow-2xs">
          <UploadCloud size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">DPF Daily Data Ingestion</h1>
            <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200 rounded-none">
              Daily Paid Files
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest, validate, and parse Daily Collection files with multi-tier validation & duplicate protection.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {globalDate && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 rounded-none shadow-2xs">
            <Calendar size={13} className="text-slate-400" />
            <span>{globalDate}</span>
          </div>
        )}
        {countdown && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 rounded-none shadow-2xs">
            <Clock size={13} className="text-amber-600 animate-pulse" />
            <span className="font-mono">{countdown}</span>
            <span className="text-[10px] uppercase text-amber-600 font-semibold">cutoff</span>
          </div>
        )}
      </div>
    </div>
  );
}
