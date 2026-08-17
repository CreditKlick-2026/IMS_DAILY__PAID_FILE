"use client";
import React from 'react';
import TraceEngine from '@/components/TraceEngine';
import { IncentiveHeader } from './IncentiveHeader';
import { IncentiveKpis } from './IncentiveKpis';
import { IncentiveFilters } from './IncentiveFilters';
import { IncentiveTable } from './IncentiveTable';
import { useIncentiveLocationData } from './useIncentiveLocationData';

interface LocationIncentiveViewProps {
  defaultLocation: string;
}

export function LocationIncentiveView({ defaultLocation }: LocationIncentiveViewProps) {
  const d = useIncentiveLocationData(defaultLocation);
  const isContextReady = !!(d.filterClient && d.filterProduct);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-slate-50/40 select-none">
      {/* Top Trace Engine Viewer */}
      {d.selectedRecord && (
        <div className="m-4 border border-slate-300 shadow-xl rounded-none overflow-hidden animate-in fade-in duration-150">
          <TraceEngine
            record={d.selectedRecord}
            onClose={() => d.setSelectedRecord(null)}
          />
        </div>
      )}

      {/* Cockpit Header */}
      <IncentiveHeader
        locationTitle={defaultLocation}
        filterClient={d.filterClient}
        setFilterClient={d.setFilterClient}
        filterProduct={d.filterProduct}
        setFilterProduct={d.setFilterProduct}
        filterMonth={d.filterMonth}
        setFilterMonth={d.setFilterMonth}
        filterYear={d.filterYear}
        setFilterYear={d.setFilterYear}
        clientOptions={d.clientOptions}
        productOptions={d.productOptions}
        onDownloadExcel={d.downloadExcel}
      />

      {!isContextReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
          <p className="font-bold text-slate-800 text-sm mb-1">Select Client & Product</p>
          <p className="text-xs text-slate-500">Choose a client and product type from the header dropdowns to load {defaultLocation} incentives.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <IncentiveKpis
            totalCount={d.totalCount}
            activeCount={d.filteredData.filter(x => x.final_incentive > 0).length}
            totalCollection={d.totalColl}
            totalPayout={d.totalIncentives}
            enabled={isContextReady}
          />

          <IncentiveFilters
            search={d.search}
            setSearch={d.setSearch}
            uiConfig={d.uiConfig}
            activeFilters={d.activeFilters}
            setActiveFilters={d.setActiveFilters}
            uniqueFilterValues={d.uniqueFilterValues}
            totalCount={d.totalCount}
            setPage={d.setPage}
          />

          <IncentiveTable
            loading={d.loading}
            paginatedData={d.paginatedData}
            uiConfig={d.uiConfig}
            selectedRecord={d.selectedRecord}
            setSelectedRecord={d.setSelectedRecord}
            page={d.page}
            pageSize={d.PAGE_SIZE}
          />

          {/* Simple Pager Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs">
            <span className="font-mono text-[11px] text-slate-500">
              Page {d.page} of {Math.max(1, Math.ceil(d.totalCount / d.PAGE_SIZE))} • {d.totalCount} records
            </span>
            <div className="flex gap-1">
              <button
                disabled={d.page <= 1}
                onClick={() => d.setPage(d.page - 1)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-none disabled:opacity-40 font-semibold"
              >
                ‹ Prev
              </button>
              <button
                disabled={d.page >= Math.ceil(d.totalCount / d.PAGE_SIZE)}
                onClick={() => d.setPage(d.page + 1)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-none disabled:opacity-40 font-semibold"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
