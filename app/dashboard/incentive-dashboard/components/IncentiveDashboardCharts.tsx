"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface IncentiveDashboardChartsProps {
  desigChartData: { name: string; value: number }[];
  locChartData: { name: string; value: number }[];
}

const TEAL_PALETTE = ['#024e4d', '#0d9488', '#14b8a6', '#0f766e', '#047857', '#059669', '#34d399'];

export function IncentiveDashboardCharts({ desigChartData, locChartData }: IncentiveDashboardChartsProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Designation Payout Distribution */}
      <div className="bg-white border border-slate-200/90 p-4 shadow-2xs flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payout by Designation</span>
          <span className="text-[10px] font-mono text-slate-400">INR Value</span>
        </div>

        <div className="h-64 w-full">
          {desigChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">No payout recorded</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={desigChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Total Incentive']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '0px' }}
                />
                <Bar dataKey="value" fill="#024e4d" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Location Payout Distribution */}
      <div className="bg-white border border-slate-200/90 p-4 shadow-2xs flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payout by Location</span>
          <span className="text-[10px] font-mono text-slate-400">Branch Share</span>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {locChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">No payout recorded</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {locChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TEAL_PALETTE[index % TEAL_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Incentive Share']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '11px', borderRadius: '0px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
