"use client";
import React from 'react';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import { PremiumSelect } from '@/components/PremiumSelect';

interface IncentiveDashboardHeaderProps {
  user: any;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  filterYear: string;
  setFilterYear: (y: string) => void;
  filterLocation: string;
  setFilterLocation: (l: string) => void;
  filterClient: string;
  setFilterClient: (c: string) => void;
  locationOptions: any[];
  clientOptions: any[];
  dataLength: number;
  onClearFilters: () => void;
  onDownloadExcel: () => void;
}

export function IncentiveDashboardHeader({
  user,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterLocation,
  setFilterLocation,
  filterClient,
  setFilterClient,
  locationOptions,
  clientOptions,
  dataLength,
  onClearFilters,
  onDownloadExcel
}: IncentiveDashboardHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#024e4d] text-white shrink-0 shadow-2xs rounded-none">
          <BarChart3 size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Incentive Analytics Cockpit</h1>
            <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
              Payout Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep dive into commission payouts, location distributions, and top performer achievements.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
        {user?.role === 'admin' && (
          <div className="min-w-[140px]">
            <PremiumSelect
              placeholder="All Locations"
              value={filterLocation}
              onChange={(val) => { setFilterLocation(val); setFilterClient(''); }}
              options={locationOptions.map((loc) => ({ label: loc.name, value: loc.name }))}
            />
          </div>
        )}

        <div className="min-w-[150px]">
          <PremiumSelect
            placeholder="Select Process"
            value={filterClient}
            onChange={(val) => setFilterClient(val)}
            options={Array.from(new Map(clientOptions.map((p) => [p.name, p])).values()).map((p: any) => ({ label: p.name, value: String(p.id) }))}
          />
        </div>

        <div className="min-w-[130px]">
          <PremiumSelect
            placeholder="All Months"
            value={filterMonth}
            onChange={(val) => setFilterMonth(val)}
            options={Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
              label: new Date(2000, m - 1).toLocaleString('default', { month: 'long' }),
              value: m.toString()
            }))}
          />
        </div>

        <div className="min-w-[110px]">
          <PremiumSelect
            placeholder="All Years"
            value={filterYear}
            onChange={(val) => setFilterYear(val)}
            options={[2024, 2025, 2026, 2027, 2028].map((y) => ({ label: y.toString(), value: y.toString() }))}
          />
        </div>

        <button
          onClick={onClearFilters}
          className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          title="Clear Filters"
        >
          <RefreshCw size={13} />
        </button>

        <button
          onClick={onDownloadExcel}
          disabled={dataLength === 0}
          className="px-3.5 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs rounded-none disabled:opacity-50"
        >
          <Download size={13} />
          <span>Export Excel</span>
        </button>
      </div>
    </div>
  );
}
