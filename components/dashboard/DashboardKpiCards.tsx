"use client";
import React from 'react';
import {
  IndianRupee, FileText, Users, BarChart3,
  UserCheck, Building2, AlertTriangle, ShieldAlert
} from 'lucide-react';

interface DashboardKpiCardsProps {
  summary: {
    totalCollected: number;
    totalFiles: number;
    uniqueAccounts: number;
    avgPerFile: number;
    activeAgents: number;
    topClient: string;
    duplicateCount?: number;
    fraudCount?: number;
  };
  monthLabel: string;
  fmt: (num: number) => string;
}

export function DashboardKpiCards({ summary, monthLabel, fmt }: DashboardKpiCardsProps) {
  const cards = [
    {
      label: `Collection (${monthLabel})`,
      value: fmt(summary.totalCollected),
      sub: 'Total Recovery Value',
      icon: IndianRupee,
      cardBg: 'bg-gradient-to-br from-emerald-50 via-emerald-50/40 to-white border-emerald-300',
      iconBg: 'bg-emerald-600 text-white shadow-xs',
      valColor: 'text-emerald-900',
      tagBg: 'bg-emerald-100/80 text-emerald-900 border-emerald-300',
      tag: '▲ Primary KPI'
    },
    {
      label: 'Paid Files',
      value: summary.totalFiles.toLocaleString('en-IN'),
      sub: 'Uploaded Statements',
      icon: FileText,
      cardBg: 'bg-gradient-to-br from-blue-50 via-blue-50/40 to-white border-blue-300',
      iconBg: 'bg-blue-600 text-white shadow-xs',
      valColor: 'text-blue-950',
      tagBg: 'bg-blue-100/80 text-blue-900 border-blue-300',
      tag: 'Files'
    },
    {
      label: 'Unique A/Cs',
      value: summary.uniqueAccounts.toLocaleString('en-IN'),
      sub: 'Distinct Borrowers',
      icon: Users,
      cardBg: 'bg-gradient-to-br from-indigo-50 via-indigo-50/40 to-white border-indigo-300',
      iconBg: 'bg-indigo-600 text-white shadow-xs',
      valColor: 'text-indigo-950',
      tagBg: 'bg-indigo-100/80 text-indigo-900 border-indigo-300',
      tag: 'Borrowers'
    },
    {
      label: 'Avg / Statement',
      value: fmt(summary.avgPerFile),
      sub: 'Ticket Size',
      icon: BarChart3,
      cardBg: 'bg-gradient-to-br from-sky-50 via-sky-50/40 to-white border-sky-300',
      iconBg: 'bg-sky-600 text-white shadow-xs',
      valColor: 'text-sky-950',
      tagBg: 'bg-sky-100/80 text-sky-900 border-sky-300',
      tag: 'Avg Recovery'
    },
    {
      label: 'Active Operators',
      value: summary.activeAgents.toLocaleString('en-IN'),
      sub: 'FOS & Callers',
      icon: UserCheck,
      cardBg: 'bg-gradient-to-br from-teal-50 via-teal-50/40 to-white border-teal-300',
      iconBg: 'bg-teal-600 text-white shadow-xs',
      valColor: 'text-teal-950',
      tagBg: 'bg-teal-100/80 text-teal-900 border-teal-300',
      tag: 'Floor Active'
    },
    {
      label: 'Top Portfolio',
      value: summary.topClient || '—',
      sub: 'Highest Volume',
      icon: Building2,
      cardBg: 'bg-gradient-to-br from-purple-50 via-purple-50/40 to-white border-purple-300',
      iconBg: 'bg-purple-600 text-white shadow-xs',
      valColor: 'text-purple-950',
      tagBg: 'bg-purple-100/80 text-purple-900 border-purple-300',
      tag: 'Top Client'
    },
    {
      label: 'Duplicate Flags',
      value: (summary.duplicateCount || 0).toLocaleString('en-IN'),
      sub: 'Needs Review',
      icon: AlertTriangle,
      cardBg: summary.duplicateCount ? 'bg-gradient-to-br from-amber-50 via-amber-50/40 to-white border-amber-300' : 'bg-slate-50 border-slate-200',
      iconBg: summary.duplicateCount ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500',
      valColor: summary.duplicateCount ? 'text-amber-950' : 'text-slate-500',
      tagBg: summary.duplicateCount ? 'bg-amber-100/80 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200',
      tag: 'Audit Review'
    },
    {
      label: 'Compliance Alert',
      value: (summary.fraudCount || 0).toLocaleString('en-IN'),
      sub: 'Fraud Triggers',
      icon: ShieldAlert,
      cardBg: summary.fraudCount ? 'bg-gradient-to-br from-rose-50 via-rose-50/40 to-white border-rose-300' : 'bg-slate-50 border-slate-200',
      iconBg: summary.fraudCount ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500',
      valColor: summary.fraudCount ? 'text-rose-950' : 'text-slate-500',
      tagBg: summary.fraudCount ? 'bg-rose-100/80 text-rose-900 border-rose-300' : 'bg-slate-100 text-slate-600 border-slate-200',
      tag: 'Strict Audit'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-3.5 border shadow-2xs flex flex-col justify-between rounded-none hover:shadow-md transition-all group ${c.cardBg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider truncate">
                {c.label}
              </span>
              <div className={`p-1.5 ${c.iconBg} shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={14} strokeWidth={2.4} />
              </div>
            </div>
            <div>
              <div className={`text-base font-black tracking-tight truncate ${c.valColor}`}>
                {c.value}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-slate-500 font-mono truncate">{c.sub}</span>
                <span className={`text-[8px] font-mono font-bold px-1 py-0.2 border ${c.tagBg}`}>
                  {c.tag}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
