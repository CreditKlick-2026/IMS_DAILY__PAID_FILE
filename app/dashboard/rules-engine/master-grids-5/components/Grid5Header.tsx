"use client";
import React from 'react';
import { Grid3X3, Save } from 'lucide-react';

interface Grid5HeaderProps {
  isSaving: boolean;
  onSave: () => Promise<void>;
}

export function Grid5Header({ isSaving, onSave }: Grid5HeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 text-white shrink-0 rounded-none shadow-2xs">
          <Grid3X3 size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Master Grid 5 — Upgrade & Recovery Incentive Matrix
            </h1>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-blue-200 rounded-none">
              ● Grid Matrix 5
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dual-rate incentive matrix (Upgrade % and Recovery %) for Associates, TLs, and AMs.
          </p>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none disabled:opacity-50 cursor-pointer"
      >
        <Save size={14} />
        <span>{isSaving ? 'Saving...' : 'Save Grid 5'}</span>
      </button>
    </div>
  );
}
