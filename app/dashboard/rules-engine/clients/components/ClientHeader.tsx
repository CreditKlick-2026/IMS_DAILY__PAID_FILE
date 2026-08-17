"use client";
import React from 'react';
import { Briefcase, Plus, Search, Layers } from 'lucide-react';

interface ClientHeaderProps {
  clientCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddClient: () => void;
  onOpenAddProduct: () => void;
}

export function ClientHeader({
  clientCount,
  searchQuery,
  setSearchQuery,
  onOpenAddClient,
  onOpenAddProduct
}: ClientHeaderProps) {
  return (
    <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-600 text-white shrink-0 rounded-none shadow-2xs">
          <Briefcase size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Clients Management</h1>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-blue-200 rounded-none">
              {clientCount} Clients Configured
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Add clients and distribute them by assigning operating locations, required DPF columns, and calculation grids.
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 w-48 outline-none focus:border-blue-500 focus:bg-white rounded-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={onOpenAddProduct}
          className="h-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
        >
          <Layers size={14} className="text-slate-600" /> Product Types
        </button>

        <button
          onClick={onOpenAddClient}
          className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-3.5 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
        >
          <Plus size={15} /> Add Client
        </button>
      </div>
    </div>
  );
}
