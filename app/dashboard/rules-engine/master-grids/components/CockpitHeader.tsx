"use client";
import React from 'react';
import { Link2 } from 'lucide-react';

interface CockpitHeaderProps {
  dpfCount: number;
  kekaCount: number;
  onOpenSchemaModal: () => void;
}

export function CockpitHeader({ dpfCount, kekaCount, onOpenSchemaModal }: CockpitHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Master Grid 1 — Rules Engine Cockpit
          </h1>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-emerald-300 rounded-none">
            ● Active: v2026.08 (Live)
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise Incentive Rules Matrix & Live Database Operations Engine for BPO Collections.
        </p>
      </div>

      {/* Schema & Database Stats Pill Bar */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Schema Mappings Trigger Button */}
        <button
          onClick={onOpenSchemaModal}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer rounded-none"
          title="Inspect mapped database columns"
        >
          <Link2 className="h-3.5 w-3.5 text-slate-600" />
          <span>Schema (8 Linked)</span>
        </button>

        {/* Database Record Counts */}
        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 font-medium text-slate-700 flex items-center gap-2 rounded-none">
          <span className="w-1.5 h-1.5 bg-blue-600"></span>
          <span>Live DB: <strong>{dpfCount} DPF</strong> | <strong>{kekaCount} Keka</strong></span>
        </div>
      </div>
    </div>
  );
}
