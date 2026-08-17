"use client";
import React from 'react';
import { CheckCircle2, Shield, Trash2, XCircle, AlertCircle, Clock } from 'lucide-react';

interface TrackerTableRowsProps {
  trackerData: any[];
  daysArray: number[];
  trackerYear: number;
  trackerMonth: number;
  isCurrentMonth: boolean;
  currentDay: number;
}

export function TrackerTableRows({
  trackerData,
  daysArray,
  trackerYear,
  trackerMonth,
  isCurrentMonth,
  currentDay
}: TrackerTableRowsProps) {
  return (
    <>
      {trackerData.map((u: any) => {
        let uploadedCount = 0;
        let pendingCount = 0;
        let elapsedDays = isCurrentMonth ? currentDay : daysArray.length;

        return (
          <tr key={u.employee_id || u.username} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
            {/* Operator Name & ID */}
            <td className="px-3.5 py-2.5 border-r border-slate-200 sticky left-0 bg-white hover:bg-slate-50 z-10 whitespace-nowrap shadow-xs">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-xs">{u.name}</span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">{u.employee_id || u.username}</span>
              </div>
            </td>

            {/* Location */}
            <td className="px-3 py-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-medium text-xs">
              {u.location || '—'}
            </td>

            {/* Daily Calendar Matrix */}
            {daysArray.map(day => {
              const dateStr = `${trackerYear}-${String(trackerMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const cellStatus = u.uploads?.[dateStr];
              const isUploaded = !!cellStatus && cellStatus !== 'DELETED_BY_ADMIN' && cellStatus !== 'FAILED';
              const isFuture = isCurrentMonth && day > currentDay;

              if (isUploaded) {
                uploadedCount++;
              } else if (!isFuture) {
                pendingCount++;
              }

              const isToday = isCurrentMonth && day === currentDay;

              return (
                <td
                  key={day}
                  className={`p-0.5 border-r border-slate-100 text-center ${isToday ? 'bg-teal-50/50' : ''}`}
                >
                  <div className="flex items-center justify-center min-h-[26px]">
                    {isFuture ? (
                      <span className="w-1.5 h-1.5 bg-slate-200 rounded-full inline-block"></span>
                    ) : !cellStatus ? (
                      <span title={`Day ${day}: Missing Upload`} className="text-red-500 hover:scale-110 transition-transform">
                        <XCircle size={13} strokeWidth={2.2} />
                      </span>
                    ) : cellStatus === 'DELETED_BY_ADMIN' ? (
                      <span title={`Day ${day}: Deleted by Admin`} className="text-amber-500">
                        <Trash2 size={13} />
                      </span>
                    ) : cellStatus === 'UPLOADED_BY_ADMIN' ? (
                      <span title={`Day ${day}: Uploaded by Admin (Proxy)`} className="text-blue-600">
                        <Shield size={13} />
                      </span>
                    ) : cellStatus === 'PROCESSING' ? (
                      <span title={`Day ${day}: Processing...`} className="text-amber-600 animate-spin">
                        <Clock size={13} />
                      </span>
                    ) : cellStatus === 'FAILED' ? (
                      <span title={`Day ${day}: Failed`} className="text-rose-600">
                        <AlertCircle size={13} />
                      </span>
                    ) : (
                      <span title={`Day ${day}: Uploaded ✓`} className="text-teal-700 hover:scale-110 transition-transform">
                        <CheckCircle2 size={13} strokeWidth={2.4} />
                      </span>
                    )}
                  </div>
                </td>
              );
            })}

            {/* Uploaded Count */}
            <td className="px-3 py-2 border-l border-slate-200 text-center font-mono font-bold text-teal-800 text-xs">
              {uploadedCount}
            </td>

            {/* Pending Count */}
            <td className="px-3 py-2 border-l border-slate-200 text-center font-mono font-bold text-xs">
              <span className={pendingCount > 0 ? 'text-red-600' : 'text-slate-400'}>
                {pendingCount}
              </span>
            </td>

            {/* Compliance Rate */}
            <td className="px-3 py-2 border-l border-slate-200 text-center font-mono font-bold text-xs sticky right-0 bg-white z-10 shadow-xs">
              {elapsedDays > 0 ? (
                <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                  (uploadedCount / elapsedDays) >= 0.9 ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                  (uploadedCount / elapsedDays) >= 0.7 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {Math.round((uploadedCount / elapsedDays) * 100)}%
                </span>
              ) : '100%'}
            </td>
          </tr>
        );
      })}
    </>
  );
}
