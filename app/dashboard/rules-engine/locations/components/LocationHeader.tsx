"use client";
import React from 'react';
import { MapPin, Plus, Search } from 'lucide-react';

interface LocationHeaderProps {
  totalCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAdd: () => void;
}

export function LocationHeader({
  totalCount,
  searchQuery,
  setSearchQuery,
  onOpenAdd
}: LocationHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 text-white shrink-0 rounded-none shadow-2xs">
          <MapPin size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Locations Management</h1>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-blue-200 rounded-none">
              {totalCount} Sites Configured
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, or remove operating geographical locations used across the incentive rules engine.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search locations..."
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 w-52 outline-none focus:border-blue-500 focus:bg-white rounded-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={onOpenAdd}
          className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-3.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
        >
          <Plus size={15} /> Add Location
        </button>
      </div>
    </div>
  );
}
