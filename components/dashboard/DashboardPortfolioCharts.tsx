"use client";
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Building2, Layers, Trophy } from 'lucide-react';

const TEAL_PALETTE = ['#024e4d', '#087f7d', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'];
const STAGE_PALETTE = ['#059669', '#0d9488', '#0284c7', '#d97706', '#dc2626', '#475569'];

interface DashboardPortfolioChartsProps {
  clients: any[];
  buckets: any[];
  teamLeaders: any[];
  fmt: (n: number) => string;
}

export function DashboardPortfolioCharts({
  clients = [],
  buckets = [],
  teamLeaders = [],
  fmt
}: DashboardPortfolioChartsProps) {
  const toChart = (arr: any[]) => (arr || []).map(i => ({ name: i.name, value: i.collected, files: i.files }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Client Portfolio */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-none flex flex-col overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#024e4d] text-white shadow-xs"><Building2 size={13} /></div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Client Portfolio Share</h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 border border-teal-200">
            {clients.length} Clients
          </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {clients.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-8">No client data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={toChart(clients).slice(0, 6)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                    <div className="bg-slate-900 text-white p-2 text-xs font-mono border border-teal-500">{payload[0].payload.name}: {fmt(payload[0].value)}</div>
                  ))} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} maxBarSize={14}>
                    {clients.map((_, i) => <Cell key={i} fill={TEAL_PALETTE[i % TEAL_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2 border-t border-slate-100 pt-2">
                {clients.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span style={{ background: TEAL_PALETTE[i % TEAL_PALETTE.length] }} className="w-2 h-2 inline-block rounded-none shrink-0" />
                      <span className="truncate max-w-[120px] font-medium">{c.name}</span>
                    </span>
                    <span className="font-bold text-[#024e4d] font-mono">{fmt(c.collected)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Bucket Wise Recovery */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-none flex flex-col overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#024e4d] text-white shadow-xs"><Layers size={13} /></div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Bucket-Wise Recovery</h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 border border-teal-200">
            Stages
          </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {buckets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-8">No bucket data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={toChart(buckets)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip content={({ active, payload }: any) => (!active || !payload?.length ? null : (
                    <div className="bg-slate-900 text-white p-2 text-xs font-mono border border-teal-500">{payload[0].payload.name}: {fmt(payload[0].value)}</div>
                  ))} />
                  <Bar dataKey="value" radius={[0, 2, 2, 0]} maxBarSize={14}>
                    {buckets.map((_, i) => <Cell key={i} fill={STAGE_PALETTE[i % STAGE_PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2 border-t border-slate-100 pt-2">
                {buckets.slice(0, 4).map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span style={{ background: STAGE_PALETTE[i % STAGE_PALETTE.length] }} className="w-2 h-2 inline-block rounded-none shrink-0" />
                      <span>{b.name}</span>
                    </span>
                    <span className="font-bold text-[#024e4d] font-mono">{fmt(b.collected)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Top Team Leaders */}
      <div className="bg-white border border-slate-200/90 shadow-2xs rounded-none flex flex-col overflow-hidden">
        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#024e4d] text-white shadow-xs"><Trophy size={13} /></div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">TL Leaderboard</h2>
          </div>
          <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 border border-teal-200">
            Podium
          </span>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {teamLeaders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 py-8">No TL data</div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {teamLeaders.map((tl, i) => (
                <div key={i} className={`p-2 border flex items-center justify-between text-xs rounded-none transition-colors ${
                  i === 0 ? 'bg-teal-50/60 border-teal-200' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-extrabold text-white shadow-xs ${
                      i === 0 ? 'bg-[#024e4d]' : i === 1 ? 'bg-slate-600' : i === 2 ? 'bg-slate-500' : 'bg-slate-400'
                    }`}>
                      #{i + 1}
                    </span>
                    <span className="font-bold text-slate-900">{tl.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-extrabold text-slate-900 text-xs">{fmt(tl.collected)}</div>
                    <div className="text-[9px] font-bold text-teal-800">{(tl.percentage ?? 0).toFixed(1)}% share</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
