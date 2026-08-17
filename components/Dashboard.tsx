"use client";
import React from 'react';
import { useDashboardData } from './dashboard/useDashboardData';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardFilterBar } from './dashboard/DashboardFilterBar';
import { DashboardKpiCards } from './dashboard/DashboardKpiCards';
import { DashboardDailyTrendChart } from './dashboard/DashboardDailyTrendChart';
import { DashboardPortfolioCharts } from './dashboard/DashboardPortfolioCharts';
import { DashboardProductLocationCharts } from './dashboard/DashboardProductLocationCharts';
import { DashboardAgentPerformanceTable } from './dashboard/DashboardAgentPerformanceTable';
import { DashboardAphPhCharts } from './dashboard/DashboardAphPhCharts';

export default function Dashboard() {
  const d = useDashboardData();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90 select-none p-4 md:p-6 gap-4 min-h-full">
      {/* 1. Cohesive Header & Live Timers */}
      <DashboardHeader
        user={d.user}
        currentTime={d.currentTime}
        lastUpdated={d.lastUpdated}
        month={d.month}
        setMonth={d.setMonth}
        year={d.year}
        setYear={d.setYear}
        months={d.months}
      />

      {/* 2. Global Searchable Filter Bar */}
      <DashboardFilterBar
        filterDefs={d.filterDefs}
        filterOptions={d.filterOptions}
        filters={d.filters}
        setFilter={d.setFilter}
        clearFilters={d.clearFilters}
        activeCount={d.activeCount}
      />

      {d.loading || !d.data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse bg-white border border-slate-200 h-24 p-3 flex flex-col justify-between">
                <div className="h-3 bg-slate-200 w-2/3" />
                <div className="h-5 bg-slate-300 w-1/2" />
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 h-64 animate-pulse" />
        </div>
      ) : (
        <>
          {/* 3. 8-Stat Cohesive Metric Cards */}
          <DashboardKpiCards
            summary={d.data.summary}
            monthLabel={d.monthLabel}
            fmt={d.fmt}
          />

          {/* 4. Daily Recovery Velocity Area Chart */}
          <DashboardDailyTrendChart
            dailyTrend={d.data.dailyTrend}
            monthLabel={d.monthLabel}
            year={d.year}
            fmt={d.fmt}
          />

          {/* 5. Portfolio, Recovery Stages, & TL Rankings */}
          <DashboardPortfolioCharts
            clients={d.data.clients}
            buckets={d.data.buckets}
            teamLeaders={d.data.teamLeaders}
            fmt={d.fmt}
          />

          {/* 6. Product Donut, Hub Locations, & Payment Channels */}
          <DashboardProductLocationCharts
            products={d.data.products}
            locations={d.data.locations}
            paymentModes={d.data.paymentModes}
            fmt={d.fmt}
          />

          {/* 7. Operator Performance Leaderboard */}
          <DashboardAgentPerformanceTable
            agents={d.data.agents}
            fmt={d.fmt}
          />

          {/* 8. APH & PH Breakdowns */}
          <DashboardAphPhCharts
            aphBreakdown={d.data.aphBreakdown}
            phBreakdown={d.data.phBreakdown}
            fmt={d.fmt}
          />
        </>
      )}
    </div>
  );
}
