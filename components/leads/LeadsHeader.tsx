"use client";
import React from 'react';
import { Inbox, CheckCircle2 } from 'lucide-react';

interface LeadsHeaderProps {
  duplicateOnly?: boolean;
  userRole?: string;
  filterLocation: string;
  setFilterLocation: (l: string) => void;
  filterClient: string;
  setFilterClient: (c: string) => void;
  filterProduct: string;
  setFilterProduct: (p: string) => void;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  filterYear: string;
  setFilterYear: (y: string) => void;
  masterLocationsList: any[];
  masterClientsList: any[];
  onApproveDuplicates: () => Promise<void>;
}

export function LeadsHeader({
  duplicateOnly,
  userRole,
  filterLocation,
  setFilterLocation,
  filterClient,
  setFilterClient,
  filterProduct,
  setFilterProduct,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  masterLocationsList,
  masterClientsList,
  onApproveDuplicates
}: LeadsHeaderProps) {
  return (
    <div className="bg-white border border-slate-200/90 p-4 shadow-2xs">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#024e4d] text-white shrink-0 shadow-2xs rounded-none">
            <Inbox size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {duplicateOnly ? 'Duplicate Records' : 'Live DPF Collection Records'}
              </h1>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200 rounded-none">
                {duplicateOnly ? 'Review Queue' : 'DPF Master Leads'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {duplicateOnly ? 'View and manage duplicate file uploads for reconciliation' : 'Real-time ingested Daily Paid Files (DPF) collection accounts and agent logs'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {duplicateOnly && userRole === 'admin' && (
            <button
              onClick={onApproveDuplicates}
              className="px-3.5 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs rounded-none"
            >
              <CheckCircle2 size={13} />
              Approve All
            </button>
          )}

          {userRole === 'admin' && (
            <select
              className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 max-w-[150px] rounded-none"
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setFilterClient(''); setFilterProduct(''); }}
            >
              <option value="">All Locations</option>
              {masterLocationsList.map((l: any) => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          )}

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 max-w-[150px] rounded-none"
            value={filterClient}
            onChange={e => { setFilterClient(e.target.value); setFilterProduct(''); }}
          >
            <option value="">All Clients</option>
            {Array.from(new Set(
              masterClientsList
                .filter((c: any) => !filterLocation || c.location_name === filterLocation)
                .map((c: any) => c.name)
            )).sort().map((name: any) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 max-w-[150px] rounded-none"
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
          >
            <option value="">All Products</option>
            {Array.from(new Set(
              masterClientsList
                .filter((c: any) => (!filterLocation || c.location_name === filterLocation) && (!filterClient || c.name === filterClient))
                .map((c: any) => c.product_type)
            )).filter(Boolean).sort().map((prod: any) => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 px-2 py-1">
            <select
              className="text-xs font-semibold bg-transparent outline-none cursor-pointer text-slate-700"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
            >
              <option value="0">All Months</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'short' })}
                </option>
              ))}
            </select>
          </div>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 rounded-none"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="0">All Years</option>
            {['2024', '2025', '2026', '2027'].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
