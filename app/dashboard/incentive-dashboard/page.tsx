"use client";
import React from 'react';
import { useIncentiveDashboardData } from './components/useIncentiveDashboardData';
import { IncentiveDashboardHeader } from './components/IncentiveDashboardHeader';
import { IncentiveDashboardKpis } from './components/IncentiveDashboardKpis';
import { IncentiveDashboardCharts } from './components/IncentiveDashboardCharts';
import { IncentiveTopEarnersTable } from './components/IncentiveTopEarnersTable';
import { CardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { Layers } from 'lucide-react';

export default function IncentiveDashboard() {
  const d = useIncentiveDashboardData();

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90 select-none p-4 md:p-6 space-y-4 min-h-full">
      {/* 1. Header Toolbar & Context Filters */}
      <IncentiveDashboardHeader
        user={d.user}
        filterMonth={d.filterMonth}
        setFilterMonth={d.setFilterMonth}
        filterYear={d.filterYear}
        setFilterYear={d.setFilterYear}
        filterLocation={d.filterLocation}
        setFilterLocation={d.setFilterLocation}
        filterClient={d.filterClient}
        setFilterClient={d.setFilterClient}
        locationOptions={d.locationOptions}
        clientOptions={d.clientOptions}
        dataLength={d.data.length}
        onClearFilters={d.handleClearFilters}
        onDownloadExcel={d.handleDownloadExcel}
      />

      {/* 2. Main Content Body */}
      {!d.filterClient ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white border border-slate-200 text-center shadow-2xs">
          <Layers size={36} className="text-slate-300 mb-3" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select a Process</h2>
          <p className="text-xs text-slate-500 mt-1">Please pick a client process from the filter bar above to view payout analytics.</p>
        </div>
      ) : d.loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/90 h-64 p-4 shadow-2xs">
              <Skeleton className="h-4 w-36 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="bg-white border border-slate-200/90 h-64 p-4 shadow-2xs">
              <Skeleton className="h-4 w-36 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
          <div className="bg-white border border-slate-200/90 h-64 p-4 shadow-2xs">
            <Skeleton className="h-4 w-44 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : d.data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white border border-slate-200 text-center shadow-2xs">
          <p className="text-sm font-bold text-slate-700">No Incentive Records Found</p>
          <p className="text-xs text-slate-400 mt-1">No collections or calculated payouts for the selected month/process.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <IncentiveDashboardKpis
            totalPayout={d.totalPayout}
            totalCollection={d.totalCollection}
            eligibleEmployees={d.eligibleEmployees}
            totalEmployees={d.totalEmployees}
            avgIncentive={d.avgIncentive}
          />
          <IncentiveDashboardCharts
            desigChartData={d.desigChartData}
            locChartData={d.locChartData}
          />
          <IncentiveTopEarnersTable topEarners={d.topEarners} />
        </div>
      )}
    </div>
  );
}
