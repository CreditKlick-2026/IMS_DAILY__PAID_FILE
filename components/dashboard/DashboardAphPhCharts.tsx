"use client";
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Headphones, Clock } from 'lucide-react';

const APH_PALETTE = ['#024e4d', '#087f7d', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'];
const PH_PALETTE = ['#0f766e', '#115e59', '#134e4a', '#065f46', '#047857', '#059669'];

interface DashboardAphPhChartsProps {
  aphBreakdown: any[];
  phBreakdown: any[];
  fmt: (n: number) => string;
}

export function DashboardAphPhCharts({
  aphBreakdown = [],
  phBreakdown = [],
  fmt
}: DashboardAphPhChartsProps) {
  const toChart = (arr: any[]) => (arr || []).map(i => ({ name: i.name, value: i.collected, files: i.files }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. APH Wise */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-none flex flex-col overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#024e4d] text-white shadow-xs"><Headphones size={13} /></div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">APH Recovery Breakdown</h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 border border-teal-200">
            Action Plans
          </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {aphBreakdown.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-8">No APH data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={toChart(aphBreakdown)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                    <div className="bg-slate-900 text-white p-2 text-xs font-mono border border-teal-500">{payload[0].payload.name}: {fmt(payload[0].value)}</div>
                  ))} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} maxBarSize={14}>
                    {aphBreakdown.map((_, i) => <Cell key={i} fill={APH_PALETTE[i % APH_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2 border-t border-slate-100 pt-2">
                {aphBreakdown.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex justify-between text-[10px] text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span style={{ background: APH_PALETTE[i % APH_PALETTE.length] }} className="w-2 h-2 inline-block rounded-none" />
                      <span className="font-medium">{item.name}</span>
                    </span>
                    <span className="font-bold text-[#024e4d] font-mono">{fmt(item.collected)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. PH Wise */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-none flex flex-col overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#024e4d] text-white shadow-xs"><Clock size={13} /></div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">PH Recovery Breakdown</h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 border border-teal-200">
            Payment Codes
          </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {phBreakdown.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-8">No PH data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={toChart(phBreakdown)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                    <div className="bg-slate-900 text-white p-2 text-xs font-mono border border-teal-500">{payload[0].payload.name}: {fmt(payload[0].value)}</div>
                  ))} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} maxBarSize={14}>
                    {phBreakdown.map((_, i) => <Cell key={i} fill={PH_PALETTE[i % PH_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2 border-t border-slate-100 pt-2">
                {phBreakdown.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex justify-between text-[10px] text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span style={{ background: PH_PALETTE[i % PH_PALETTE.length] }} className="w-2 h-2 inline-block rounded-none" />
                      <span className="font-medium">{item.name}</span>
                    </span>
                    <span className="font-bold text-[#024e4d] font-mono">{fmt(item.collected)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
