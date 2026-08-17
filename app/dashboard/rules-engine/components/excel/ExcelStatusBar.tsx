"use client";
import React from "react";

interface ExcelStatusBarProps {
  maxR: number;
  maxC: number;
}

export function ExcelStatusBar({ maxR, maxC }: ExcelStatusBarProps) {
  return (
    <div className="border-t bg-slate-100 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600 shrink-0 font-mono select-none">
      <div className="flex items-center gap-4">
        <span>
          Rows: <strong className="text-slate-800">{maxR}</strong>
        </span>
        <span>
          Columns: <strong className="text-slate-800">{maxC + 1}</strong>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
          ● Live PostgreSQL Database Linked (Admin Formula Engine)
        </span>
      </div>
    </div>
  );
}
