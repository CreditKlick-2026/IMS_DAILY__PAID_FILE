"use client";
import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export function SpecialHeader() {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-600 text-white shrink-0 rounded-none shadow-2xs">
          <AlertTriangle size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Special Exceptions & High Collection Overrides</h1>
            <span className="bg-red-50 text-red-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-red-200 rounded-none">
              Override Policy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure exception payout rate slabs (e.g. ₹3.5L+) and toggle individual employee special case overrides.
          </p>
        </div>
      </div>
    </div>
  );
}
