"use client";
import React from 'react';
import { Trophy, Award } from 'lucide-react';

interface DashboardAgentPerformanceTableProps {
  agents: any[];
  fmt: (n: number) => string;
}

export function DashboardAgentPerformanceTable({
  agents = [],
  fmt
}: DashboardAgentPerformanceTableProps) {
  return (
    <div className="bg-white border border-slate-200/90 shadow-2xs rounded-none overflow-hidden flex flex-col">
      <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#024e4d] text-white shadow-xs">
            <Trophy size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Operator Performance Leaderboard (Top 10)
              </h2>
              <span className="bg-teal-50 text-teal-800 text-[9px] font-mono font-bold px-1.5 py-0.2 border border-teal-200">
                TOP PERFORMERS
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Agent recovery volumes, accounts handled, and total contribution share</p>
          </div>
        </div>

        {agents.length > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-900 text-xs font-bold">
            <Award size={13} className="text-amber-600" />
            <span>#1 Star: {agents[0]?.name} ({fmt(agents[0]?.collected)})</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-2.5 w-14 text-center">Rank</th>
              <th className="px-4 py-2.5">Operator Name</th>
              <th className="px-4 py-2.5 font-mono">Emp Code</th>
              <th className="px-4 py-2.5 text-right">Statements</th>
              <th className="px-4 py-2.5 text-right">Unique A/C</th>
              <th className="px-4 py-2.5 text-right">Recovery Amount</th>
              <th className="px-4 py-2.5 w-52 text-right">% Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">No agent performance data recorded.</td>
              </tr>
            ) : (
              agents.map((a: any, i: number) => (
                <tr key={i} className={`hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-teal-50/20' : ''}`}>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`w-6 h-6 inline-flex items-center justify-center text-[10px] font-extrabold text-white rounded-none shadow-xs ${
                      i === 0 ? 'bg-[#024e4d]' :
                      i === 1 ? 'bg-slate-600' :
                      i === 2 ? 'bg-slate-500' : 'bg-slate-400'
                    }`}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{a.name}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500 text-[11px]">{a.code || '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-700 text-right">{a.files}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-[#024e4d] text-right">{a.uniqueAccounts}</td>
                  <td className="px-4 py-2.5 font-mono font-black text-slate-900 text-right">{fmt(a.collected)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-28 h-2 bg-slate-100 border border-slate-200 overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, Math.max(0, a.percentage || 0))}%` }}
                          className="h-full bg-[#024e4d]"
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700 min-w-[38px]">
                        {(a.percentage ?? 0).toFixed(1)}%
                      </span>
                    </div>
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
