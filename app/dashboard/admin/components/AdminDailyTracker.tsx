"use client";
import React from 'react';
import { Calendar, CheckCircle2, XCircle, Shield, Trash2, Clock, AlertCircle } from 'lucide-react';
import { TrackerTableRows } from './TrackerTableRows';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

interface AdminDailyTrackerProps {
  filterLocation: string;
  setFilterLocation: (l: string) => void;
  locationOptions: any[];
  filterClient: string;
  setFilterClient: (c: string) => void;
  clientOptions: any[];
  filterProduct: string;
  setFilterProduct: (p: string) => void;
  trackerMonth: number;
  setTrackerMonth: (m: number) => void;
  trackerYear: number;
  setTrackerYear: (y: number) => void;
  trackerData: any[];
  trackerLoading: boolean;
  onClearFilters: () => void;
}

export function AdminDailyTracker({
  filterLocation,
  setFilterLocation,
  locationOptions,
  trackerMonth,
  setTrackerMonth,
  trackerYear,
  setTrackerYear,
  trackerData,
  trackerLoading,
  onClearFilters
}: AdminDailyTrackerProps) {
  const daysInMonth = new Date(trackerYear, trackerMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === trackerYear && now.getMonth() + 1 === trackerMonth;
  const currentDay = now.getDate();
  const elapsedDays = isCurrentMonth ? currentDay : daysInMonth;

  // Calculate Overall Compliance Metrics
  let totalPossibleUploads = trackerData.length * elapsedDays;
  let totalActualUploads = 0;
  trackerData.forEach(u => {
    daysArray.forEach(d => {
      if (!isCurrentMonth || d <= currentDay) {
        const dateStr = `${trackerYear}-${String(trackerMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const s = u.uploads?.[dateStr];
        if (s && s !== 'DELETED_BY_ADMIN' && s !== 'FAILED') {
          totalActualUploads++;
        }
      }
    });
  });
  const overallRate = totalPossibleUploads > 0 ? Math.round((totalActualUploads / totalPossibleUploads) * 100) : 100;
  const totalPending = Math.max(0, totalPossibleUploads - totalActualUploads);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/50">
      {/* Header Toolbar */}
      <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#024e4d] text-white shrink-0 shadow-2xs">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Daily Compliance Tracker</h1>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
                Matrix
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Real-time daily collection file monitoring matrix across operators.</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locationOptions.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
          </select>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={trackerMonth}
            onChange={(e) => setTrackerMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={trackerYear}
            onChange={(e) => setTrackerYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-none transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Tracked Operators</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{trackerData.length}</p>
        </div>
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Compliance</p>
          <p className={`text-xl font-bold font-mono mt-0.5 ${overallRate >= 85 ? 'text-teal-700' : 'text-amber-600'}`}>{overallRate}%</p>
        </div>
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Successful Uploads</p>
          <p className="text-xl font-bold font-mono text-teal-800 mt-0.5">{totalActualUploads}</p>
        </div>
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Missing / Pending</p>
          <p className={`text-xl font-bold font-mono mt-0.5 ${totalPending > 0 ? 'text-red-600' : 'text-slate-400'}`}>{totalPending}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-3 py-2 bg-white border border-slate-200 text-xs text-slate-600">
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Legend:</span>
        <div className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-teal-700" strokeWidth={2.5} /> <span className="text-[11px]">Uploaded</span></div>
        <div className="flex items-center gap-1.5"><XCircle size={13} className="text-red-500" strokeWidth={2.2} /> <span className="text-[11px]">Pending / Missed</span></div>
        <div className="flex items-center gap-1.5"><Shield size={13} className="text-blue-600" /> <span className="text-[11px]">Uploaded by Admin</span></div>
        <div className="flex items-center gap-1.5"><Trash2 size={13} className="text-amber-500" /> <span className="text-[11px]">Purged / Deleted</span></div>
        <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-slate-300 rounded-full inline-block"></span> <span className="text-[11px]">Future Date</span></div>
      </div>

      {/* Tracker Grid Table */}
      <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto flex-1 max-h-[calc(100vh-280px)]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-bold sticky top-0 z-20 border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5 border-r border-slate-200 min-w-[150px] sticky left-0 bg-slate-50 z-30 shadow-xs">Operator</th>
                <th className="px-3 py-2.5 border-r border-slate-200 min-w-[110px]">Location</th>
                {daysArray.map(day => (
                  <th
                    key={day}
                    className={`px-1 py-2.5 text-center border-r border-slate-200 min-w-[32px] font-mono ${
                      isCurrentMonth && day === currentDay ? 'bg-teal-100/70 text-teal-950 font-black' : ''
                    }`}
                  >
                    {day}
                  </th>
                ))}
                <th className="px-3 py-2.5 border-l border-slate-200 text-center min-w-[65px] font-mono text-teal-800">Done</th>
                <th className="px-3 py-2.5 border-l border-slate-200 text-center min-w-[65px] font-mono text-red-600">Missed</th>
                <th className="px-3 py-2.5 border-l border-slate-200 text-center min-w-[80px] font-mono sticky right-0 bg-slate-50 z-30 shadow-xs">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trackerLoading ? (
                <TableRowSkeleton cols={4 + daysArray.length} rows={6} />
              ) : trackerData.length === 0 ? (
                <tr>
                  <td colSpan={4 + daysArray.length} className="px-4 py-12 text-center text-slate-500">
                    No active operator tracking data recorded for this selection.
                  </td>
                </tr>
              ) : (
                <TrackerTableRows
                  trackerData={trackerData}
                  daysArray={daysArray}
                  trackerYear={trackerYear}
                  trackerMonth={trackerMonth}
                  isCurrentMonth={isCurrentMonth}
                  currentDay={currentDay}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
