"use client";
import React from 'react';
import { Award } from 'lucide-react';

interface IncentiveTopEarnersTableProps {
  topEarners: any[];
}

export function IncentiveTopEarnersTable({ topEarners }: IncentiveTopEarnersTableProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  return (
    <div className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <Award size={15} className="text-[#024e4d]" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top 10 Incentive Earners</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 font-semibold">
          Leaderboard
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-3.5 py-2.5 w-10 text-center">Rank</th>
              <th className="px-3.5 py-2.5">Agent Details</th>
              <th className="px-3.5 py-2.5">Designation</th>
              <th className="px-3.5 py-2.5">Location</th>
              <th className="px-3.5 py-2.5 text-right">Target Collection</th>
              <th className="px-3.5 py-2.5 text-right font-bold text-emerald-800">Final Incentive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topEarners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No incentive earners found for this process cycle.
                </td>
              </tr>
            ) : (
              topEarners.map((row, idx) => (
                <tr key={`${row.employee_code || 'earner'}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3.5 py-2.5 text-center font-mono text-xs font-bold text-slate-600">
                    <span className={`inline-flex items-center justify-center w-5 h-5 ${idx === 0 ? 'bg-amber-100 text-amber-900 font-black' : idx === 1 ? 'bg-slate-200 text-slate-800' : idx === 2 ? 'bg-amber-50 text-amber-800' : 'text-slate-400'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="font-bold text-slate-900">{row.employee_name || 'Agent ' + (idx + 1)}</div>
                    <div className="text-[10px] font-mono text-slate-400">{row.employee_code}</div>
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-700 font-medium">{row.designation || '—'}</td>
                  <td className="px-3.5 py-2.5 text-slate-600">{row.location || '—'}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-slate-800 font-bold">
                    {formatCurrency(row.total_collection || 0)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-xs font-black text-emerald-700">
                    {formatCurrency(row.final_incentive || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
