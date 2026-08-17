"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';

interface UploadProgressCardProps {
  activeJob: any;
  progressPercent: number;
}

export function UploadProgressCard({ activeJob, progressPercent }: UploadProgressCardProps) {
  if (!activeJob) return null;

  return (
    <div className="bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3 rounded-none">
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          {activeJob.status === 'PENDING' || activeJob.status === 'PROCESSING' ? (
            <Loader2 size={15} className="animate-spin text-[#024e4d]" />
          ) : null}
          <span className="text-slate-800 uppercase tracking-wider">
            Ingestion Progress: {activeJob.status}
          </span>
        </div>
        <span className="font-mono text-slate-700 font-bold">{progressPercent}%</span>
      </div>

      <div className="w-full bg-slate-100 h-2 border border-slate-200 overflow-hidden">
        <div
          className="bg-[#024e4d] h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
        <span>Rows: {activeJob.processed_rows} / {activeJob.total_rows}</span>
        <span>Batch ID: {activeJob.id}</span>
      </div>
    </div>
  );
}
