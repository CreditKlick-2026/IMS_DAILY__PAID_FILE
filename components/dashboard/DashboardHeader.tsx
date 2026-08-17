"use client";
import React from 'react';
import { Layers, Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
  currentTime: string;
  lastUpdated: string;
  month: string;
  setMonth: (m: string) => void;
  year: string;
  setYear: (y: string) => void;
  months: { v: string; l: string }[];
}

export function DashboardHeader({
  user,
  currentTime,
  lastUpdated,
  month,
  setMonth,
  year,
  setYear,
  months
}: DashboardHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-[#024e4d] text-white shrink-0 rounded-none shadow-2xs">
          <Layers size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {user?.name ? `Welcome, ${user.name}` : 'Operations Intelligence Cockpit'}
            </h1>
            {user?.location && (
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200 rounded-none">
                {user.location} Hub
              </span>
            )}
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-emerald-200 rounded-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" /> LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            IMS Daily Collection & Recovery Intelligence • {currentTime}
            {lastUpdated && ` • Sync: ${lastUpdated}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-stretch sm:self-auto">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1.5">
          <Calendar size={13} className="text-slate-500" />
          <select
            className="text-xs font-semibold bg-transparent outline-none cursor-pointer text-slate-800"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            {months.map(m => (
              <option key={m.v} value={m.v}>{m.l}</option>
            ))}
          </select>
        </div>

        <select
          className="px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none cursor-pointer text-slate-800 rounded-none"
          value={year}
          onChange={e => setYear(e.target.value)}
        >
          {['2024', '2025', '2026', '2027'].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
