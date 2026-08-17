"use client";
import React from 'react';
import { Search } from 'lucide-react';

interface IncentiveFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  uiConfig: { columns: string[]; filters: string[] };
  activeFilters: Record<string, string>;
  setActiveFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  uniqueFilterValues: Record<string, string[]>;
  totalCount: number;
  setPage: (p: number) => void;
}

export function IncentiveFilters({
  search,
  setSearch,
  uiConfig,
  activeFilters,
  setActiveFilters,
  uniqueFilterValues,
  totalCount,
  setPage
}: IncentiveFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 focus:bg-white outline-none focus:border-blue-500 rounded-none transition-colors"
          placeholder="Search employee, ID, location..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {uiConfig.filters && uiConfig.filters.map(filterKey => (
        <select
          key={filterKey}
          className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none cursor-pointer text-slate-700 capitalize max-w-[140px]"
          value={activeFilters[filterKey] || ""}
          onChange={e => {
            setActiveFilters(prev => ({ ...prev, [filterKey]: e.target.value }));
            setPage(1);
          }}
        >
          <option value="">{filterKey.replace(/_/g, ' ')}</option>
          {uniqueFilterValues[filterKey]?.map((x: string) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      ))}

      <div className="ml-auto text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200 rounded-none">
        {totalCount.toLocaleString('en-IN')} Employees Filtered
      </div>
    </div>
  );
}
