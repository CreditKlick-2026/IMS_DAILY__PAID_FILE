"use client";
import React from 'react';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';

interface IncentiveDashboardKpisProps {
  totalPayout: number;
  totalCollection: number;
  eligibleEmployees: number;
  totalEmployees: number;
  avgIncentive: number;
}

export function IncentiveDashboardKpis({
  totalPayout,
  totalCollection,
  eligibleEmployees,
  totalEmployees,
  avgIncentive
}: IncentiveDashboardKpisProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Payout */}
      <div className="bg-white border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Total Incentive Payout
          </span>
          <div className="p-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
            <DollarSign size={13} />
          </div>
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-emerald-800">
          {formatCurrency(totalPayout)}
        </div>
      </div>

      {/* 2. Total Collection */}
      <div className="bg-white border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Total Target Collection
          </span>
          <div className="p-1 bg-teal-50 text-teal-700 border border-teal-200">
            <TrendingUp size={13} />
          </div>
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-[#024e4d]">
          {formatCurrency(totalCollection)}
        </div>
      </div>

      {/* 3. Eligible Employees */}
      <div className="bg-white border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Eligible Agents
          </span>
          <div className="p-1 bg-slate-100 text-slate-700 border border-slate-200">
            <Users size={13} />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono text-slate-900">{eligibleEmployees}</span>
          <span className="text-xs font-mono text-slate-400">/ {totalEmployees}</span>
        </div>
      </div>

      {/* 4. Avg Incentive */}
      <div className="bg-white border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Avg. Incentive / Agent
          </span>
          <div className="p-1 bg-amber-50 text-amber-700 border border-amber-200">
            <Award size={13} />
          </div>
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-amber-800">
          {formatCurrency(avgIncentive)}
        </div>
      </div>
    </div>
  );
}
