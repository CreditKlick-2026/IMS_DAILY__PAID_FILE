"use client";
import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { TrendingUp, Award, Zap } from 'lucide-react';

interface DashboardDailyTrendChartProps {
  dailyTrend: any[];
  monthLabel: string;
  year: string;
  fmt: (n: number) => string;
}

export function DashboardDailyTrendChart({
  dailyTrend = [],
  monthLabel,
  year,
  fmt
}: DashboardDailyTrendChartProps) {
  const peakDay = dailyTrend.reduce((max, cur) => cur.collected > (max?.collected || 0) ? cur : max, null);

  return (
    <div className="bg-white border border-slate-200/90 shadow-2xs rounded-none overflow-hidden">
      {/* Cohesive Header Banner */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#024e4d] text-white shadow-xs">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Daily Recovery Velocity — {monthLabel} {year}
              </h2>
              <span className="bg-teal-50 text-teal-800 text-[9px] font-mono font-bold px-2 py-0.5 border border-teal-200">
                ACTIVE TIMELINE
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Day-by-day collection volume trajectory across all active branches</p>
          </div>
        </div>

        {peakDay && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Award size={13} className="text-amber-600" />
              <span>Peak: Day {peakDay.day} ({fmt(peakDay.collected)})</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
              <Zap size={13} className="text-teal-600" />
              <span>Velocity Steady</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {dailyTrend.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No trend data available for this timeline.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyTrend} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#024e4d" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#0d9488" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => fmt(v)}
                width={65}
              />
              <Tooltip
                content={({ active, payload, label }: any) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-slate-900 text-white p-3 shadow-2xl border border-teal-500 text-xs font-mono rounded-none">
                      <p className="font-bold text-teal-300 border-b border-slate-700 pb-1 mb-1.5 flex justify-between">
                        <span>Day {label} Recovery</span>
                        <span className="text-emerald-400">✓ Logged</span>
                      </p>
                      <p className="text-emerald-400 font-extrabold text-sm">{fmt(payload[0].value)}</p>
                      {payload[0].payload.files && (
                        <p className="text-slate-400 text-[10px] mt-0.5">{payload[0].payload.files} statements processed</p>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#024e4d"
                strokeWidth={2.8}
                fill="url(#velocityTeal)"
                name="Recovery"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
