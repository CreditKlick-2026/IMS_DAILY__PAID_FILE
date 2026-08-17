"use client";
import React from 'react';
import { Download, Layers } from 'lucide-react';

interface IncentiveHeaderProps {
  locationTitle: string;
  filterClient: string;
  setFilterClient: (c: string) => void;
  filterProduct: string;
  setFilterProduct: (p: string) => void;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  filterYear: string;
  setFilterYear: (y: string) => void;
  clientOptions: any[];
  productOptions: any[];
  onDownloadExcel: () => void;
}

export function IncentiveHeader({
  locationTitle,
  filterClient,
  setFilterClient,
  filterProduct,
  setFilterProduct,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  clientOptions,
  productOptions,
  onDownloadExcel
}: IncentiveHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 p-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white shrink-0 shadow-2xs rounded-none">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                {locationTitle} Incentive Master
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-blue-200 rounded-none">
                {locationTitle} Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time calculation engine with rules matrix matching & dynamic payout calculation
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-blue-500 cursor-pointer text-slate-700 max-w-[150px] rounded-none"
            value={filterClient}
            onChange={e => {
              const val = e.target.value;
              setFilterClient(val);
              const matching = clientOptions.filter(c => c.name === val);
              if (matching.length === 1 && matching[0].product_type) {
                setFilterProduct(matching[0].product_type);
              } else {
                setFilterProduct('');
              }
            }}
          >
            <option value="">All Clients</option>
            {Array.from(new Set(clientOptions.map(c => c.name))).sort().map(name => (
              <option key={name as string} value={name as string}>{name as string}</option>
            ))}
          </select>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-blue-500 cursor-pointer text-slate-700 max-w-[150px] rounded-none"
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
          >
            <option value="">All Products</option>
            {productOptions
              .filter(p => !filterClient || clientOptions.some(c => c.name === filterClient && c.product_type === p.name))
              .map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-blue-500 cursor-pointer text-slate-700 max-w-[120px] rounded-none"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-blue-500 cursor-pointer text-slate-700 max-w-[100px] rounded-none"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={onDownloadExcel}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs rounded-none"
          >
            <Download size={13} />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
