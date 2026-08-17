"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (s: string[]) => void;
}

function MultiSelectDropdown({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = (options || []).filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const toggle = (val: string) => onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`px-2.5 py-1.5 text-xs font-semibold border flex items-center gap-2 rounded-none transition-colors cursor-pointer ${
          selected.length > 0
            ? 'bg-blue-50 border-blue-300 text-blue-800'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <span>{selected.length === 0 ? label : `${label} (${selected.length})`}</span>
        <ChevronDown size={12} className="opacity-60" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-300 shadow-xl min-w-[190px] max-h-60 overflow-y-auto rounded-none">
          <div className="p-2 sticky top-0 bg-white border-b border-slate-200 z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200">
              <Search size={11} className="text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${label}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-xs bg-transparent outline-none text-slate-800"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="p-1 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">No options found</div>
            ) : (
              filtered.map(opt => {
                const isSelected = selected.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggle(opt)}
                    className={`px-2.5 py-1.5 text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={isSelected}
                      className="cursor-pointer accent-blue-600 rounded-none"
                    />
                    <span className="truncate">{opt}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface DashboardFilterBarProps {
  filterDefs: { key: string; optKey: string; label: string }[];
  filterOptions: any;
  filters: { [k: string]: string[] };
  setFilter: (key: string, vals: string[]) => void;
  clearFilters: () => void;
  activeCount: number;
}

export function DashboardFilterBar({
  filterDefs,
  filterOptions,
  filters,
  setFilter,
  clearFilters,
  activeCount
}: DashboardFilterBarProps) {
  return (
    <div className="bg-white p-3 border border-slate-200 shadow-2xs flex items-center gap-2 flex-wrap rounded-none">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">Filters:</span>
      {filterDefs.map(f => (
        <MultiSelectDropdown
          key={f.key}
          label={f.label}
          options={filterOptions[f.optKey] || []}
          selected={filters[f.key]}
          onChange={vals => setFilter(f.key, vals)}
        />
      ))}

      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 flex items-center gap-1 rounded-none cursor-pointer"
        >
          <X size={12} /> Clear Filters ({activeCount})
        </button>
      )}
    </div>
  );
}
