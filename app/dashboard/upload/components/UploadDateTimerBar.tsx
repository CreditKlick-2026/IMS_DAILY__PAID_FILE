"use client";
import React from 'react';

interface UploadDateTimerBarProps {
  dateOptions: any[];
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  userRole?: string;
}

export function UploadDateTimerBar({
  dateOptions,
  selectedDate,
  setSelectedDate,
  userRole
}: UploadDateTimerBarProps) {
  if (!dateOptions.length) return null;

  return (
    <div className="bg-white px-4 py-2.5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-3 rounded-none">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Target File Date:
      </span>
      <div className="flex items-center gap-1.5">
        {dateOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedDate(opt.value)}
            className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer rounded-none border ${
              selectedDate === opt.value
                ? 'bg-[#024e4d] border-[#024e4d] text-white shadow-2xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {opt.display}
          </button>
        ))}
      </div>

      {userRole === 'admin' && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Custom Date:</span>
          <input
            type="date"
            className="bg-white border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-teal-600 rounded-none cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
