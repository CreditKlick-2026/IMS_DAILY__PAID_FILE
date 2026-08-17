"use client";
import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { PremiumSelect } from '@/components/PremiumSelect';

interface KekaMasterFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedDesig: string;
  setSelectedDesig: (d: string) => void;
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;
  selectedClient: string;
  setSelectedClient: (c: string) => void;
  uniqueDesigs: string[];
  uniqueLocations: string[];
  uniqueClients: string[];
}

export function KekaMasterFilters({
  search,
  setSearch,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedDesig,
  setSelectedDesig,
  selectedLocation,
  setSelectedLocation,
  selectedClient,
  setSelectedClient,
  uniqueDesigs,
  uniqueLocations,
  uniqueClients
}: KekaMasterFiltersProps) {
  const months = [
    { v: 'All', l: 'All Months' },
    { v: '1', l: 'January' }, { v: '2', l: 'February' }, { v: '3', l: 'March' },
    { v: '4', l: 'April' }, { v: '5', l: 'May' }, { v: '6', l: 'June' },
    { v: '7', l: 'July' }, { v: '8', l: 'August' }, { v: '9', l: 'September' },
    { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
  ];
  const years = ['All', '2024', '2025', '2026', '2027'];

  return (
    <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-3 rounded-none">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search size={13} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          className="w-full bg-slate-50 border border-slate-300 rounded-none pl-9 pr-3.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 shadow-2xs placeholder:text-slate-400"
          placeholder="Search Emp ID, Name, Agent OHR, TL, AM..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-none">
        <Calendar size={13} className="text-slate-400" />
        <select
          className="text-xs font-semibold bg-transparent outline-none cursor-pointer text-slate-700"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((m) => (
            <option key={m.v} value={m.v}>{m.l}</option>
          ))}
        </select>
      </div>

      {/* Year Selector */}
      <select
        className="px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 rounded-none"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
        ))}
      </select>

      {/* Designation Select */}
      <div className="min-w-[150px]">
        <PremiumSelect
          placeholder="All Designations"
          value={selectedDesig}
          onChange={(val) => setSelectedDesig(val)}
          options={uniqueDesigs.map((x) => ({ label: x, value: x }))}
        />
      </div>

      {/* Location Select */}
      <div className="min-w-[140px]">
        <PremiumSelect
          placeholder="All Locations"
          value={selectedLocation}
          onChange={(val) => setSelectedLocation(val)}
          options={uniqueLocations.map((loc) => ({ label: loc, value: loc }))}
        />
      </div>

      {/* Client Select */}
      <div className="min-w-[140px]">
        <PremiumSelect
          placeholder="All Clients"
          value={selectedClient}
          onChange={(val) => setSelectedClient(val)}
          options={uniqueClients.map((c) => ({ label: c, value: c }))}
        />
      </div>
    </div>
  );
}
