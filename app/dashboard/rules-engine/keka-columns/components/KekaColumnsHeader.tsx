"use client";
import React from 'react';
import { Columns, Plus } from 'lucide-react';

interface KekaColumnsHeaderProps {
  isConfigReady: boolean;
  onOpenAdd: () => void;
}

export function KekaColumnsHeader({ onOpenAdd }: KekaColumnsHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#024e4d] text-white shrink-0 rounded-none shadow-2xs">
          <Columns size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Keka Columns Control Panel</h1>
            <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
              Admin Schema Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full dynamic control of backend column mappings, expected Excel headers, and matching aliases.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenAdd}
        className="h-8 bg-[#024e4d] hover:bg-[#036261] text-white px-3.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
      >
        <Plus size={15} />
        <span>Add Custom Column</span>
      </button>
    </div>
  );
}
