"use client";
import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface LiveRecordsFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  selectedClient: string;
  setSelectedClient: (c: string) => void;
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;
  selectedProduct: string;
  setSelectedProduct: (p: string) => void;
  clients: string[];
  locations: string[];
  products: string[];
  onReset: () => void;
}

export function LiveRecordsFilters({
  search,
  setSearch,
  selectedClient,
  setSelectedClient,
  selectedLocation,
  setSelectedLocation,
  selectedProduct,
  setSelectedProduct,
  clients,
  locations,
  products,
  onReset
}: LiveRecordsFiltersProps) {
  const hasActiveFilter = Boolean(search || selectedClient || selectedLocation || selectedProduct);

  return (
    <div className="bg-white p-3 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5 rounded-none">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search Account No, Employee Code, Name..."
          className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 focus:bg-white outline-none focus:border-blue-500 rounded-none transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Client Dropdown */}
      <select
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium text-slate-700 outline-none focus:border-blue-500 rounded-none cursor-pointer"
      >
        <option value="">All Clients</option>
        {clients.map((c, i) => (
          <option key={i} value={c}>{c}</option>
        ))}
      </select>

      {/* Location Dropdown */}
      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
        className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium text-slate-700 outline-none focus:border-blue-500 rounded-none cursor-pointer"
      >
        <option value="">All Locations</option>
        {locations.map((l, i) => (
          <option key={i} value={l}>{l}</option>
        ))}
      </select>

      {/* Product Dropdown */}
      <select
        value={selectedProduct}
        onChange={(e) => setSelectedProduct(e.target.value)}
        className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium text-slate-700 outline-none focus:border-blue-500 rounded-none cursor-pointer"
      >
        <option value="">All Products</option>
        {products.map((p, i) => (
          <option key={i} value={p}>{p}</option>
        ))}
      </select>

      {/* Reset Filter Button */}
      {hasActiveFilter && (
        <button
          onClick={onReset}
          className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-none flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset Filters"
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
