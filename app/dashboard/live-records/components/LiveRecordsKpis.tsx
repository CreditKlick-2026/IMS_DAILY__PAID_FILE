"use client";
import React from 'react';
import { IndianRupee, FileSpreadsheet, Users, TrendingUp } from 'lucide-react';

interface LiveRecordsKpisProps {
  totalCollection: number;
  totalRecords: number;
  uniqueAgents: number;
  avgCollection: number;
}

export function LiveRecordsKpis({
  totalCollection,
  totalRecords,
  uniqueAgents,
  avgCollection
}: LiveRecordsKpisProps) {
  const cards = [
    {
      title: 'Total Money Collected',
      value: `₹${totalCollection.toLocaleString('en-IN')}`,
      desc: 'Aggregated DPF payment pool',
      icon: IndianRupee,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/60 border-emerald-200'
    },
    {
      title: 'Total Synced Records',
      value: totalRecords.toLocaleString('en-IN'),
      desc: 'Active borrower transactions',
      icon: FileSpreadsheet,
      color: 'text-blue-700',
      bg: 'bg-blue-50/60 border-blue-200'
    },
    {
      title: 'Active Agents Mapped',
      value: uniqueAgents.toLocaleString('en-IN'),
      desc: 'Unique collection officers',
      icon: Users,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50/60 border-indigo-200'
    },
    {
      title: 'Average per Transaction',
      value: `₹${Math.round(avgCollection).toLocaleString('en-IN')}`,
      desc: 'Ticket size average',
      icon: TrendingUp,
      color: 'text-slate-800',
      bg: 'bg-slate-50 border-slate-200'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 border shadow-2xs flex items-center gap-3.5 bg-white rounded-none border-slate-200`}
          >
            <div className={`p-2.5 shrink-0 border ${card.bg} ${card.color} rounded-none`}>
              <Icon size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {card.desc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
