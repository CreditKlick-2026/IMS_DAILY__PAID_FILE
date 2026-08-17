"use client";
import React from 'react';
import { Users, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

interface IncentiveKpisProps {
  totalCount: number;
  activeCount: number;
  totalCollection: number;
  totalPayout: number;
  enabled: boolean;
}

export function IncentiveKpis({
  totalCount,
  activeCount,
  totalCollection,
  totalPayout,
  enabled
}: IncentiveKpisProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const kpis = [
    { label: 'Total Employees', val: enabled ? totalCount.toLocaleString('en-IN') : '—', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: <Users size={16} /> },
    { label: 'Active Incentives', val: enabled ? activeCount.toLocaleString('en-IN') : '—', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle size={16} /> },
    { label: 'Total Collections', val: enabled ? formatCurrency(totalCollection) : '—', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: <TrendingUp size={16} /> },
    { label: 'Total Payout', val: enabled ? formatCurrency(totalPayout) : '—', color: 'text-emerald-900 bg-emerald-100/70 border-emerald-300', icon: <DollarSign size={16} /> },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-4 bg-slate-50 border-b border-slate-200">
      {kpis.map((k) => (
        <div key={k.label} className={`border p-3 rounded-none shadow-2xs ${k.color}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">{k.label}</span>
            {k.icon}
          </div>
          <div className="text-lg font-black font-mono tracking-tight">{k.val}</div>
        </div>
      ))}
    </div>
  );
}
