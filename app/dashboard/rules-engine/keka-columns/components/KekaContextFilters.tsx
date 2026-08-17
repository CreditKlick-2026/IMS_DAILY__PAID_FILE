"use client";
import React from 'react';
import { MapPin, Briefcase, Layers } from 'lucide-react';

interface KekaContextFiltersProps {
  locationOptions: { id: number; name: string }[];
  clientOptions: any[];
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  selectedProduct: string;
  setSelectedProduct: (prod: string) => void;
}

export function KekaContextFilters({
  locationOptions,
  clientOptions,
  selectedLocation,
  setSelectedLocation,
  selectedClient,
  setSelectedClient,
  selectedProduct,
  setSelectedProduct
}: KekaContextFiltersProps) {
  return (
    <div className="bg-white p-3.5 border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-3 rounded-none">
      {/* Location Filter */}
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          <MapPin size={13} className="text-blue-600" /> Operating Location
        </label>
        <select 
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setSelectedClient('');
            setSelectedProduct('');
          }}
          className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 rounded-none cursor-pointer"
        >
          <option value="">Select Location...</option>
          {locationOptions.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Client Filter */}
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          <Briefcase size={13} className="text-blue-600" /> Client Portfolio
        </label>
        <select 
          value={selectedClient}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedClient(val);
            const matchingClients = clientOptions.filter(c => c.name === val);
            if (matchingClients.length === 1 && matchingClients[0].product_type) {
              setSelectedProduct(matchingClients[0].product_type);
            } else {
              setSelectedProduct('');
            }
          }}
          disabled={!selectedLocation}
          className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 rounded-none cursor-pointer disabled:opacity-50"
        >
          <option value="">Select Client...</option>
          {Array.from(new Set(clientOptions.map((c: any) => c.name))).sort().map(name => (
            <option key={name as string} value={name as string}>{name as string}</option>
          ))}
        </select>
      </div>

      {/* Product Filter */}
      <div>
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          <Layers size={13} className="text-blue-600" /> Product Type
        </label>
        <select 
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          disabled={!selectedClient}
          className="w-full bg-slate-50 border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 rounded-none cursor-pointer disabled:opacity-50"
        >
          <option value="">Select Product...</option>
          {clientOptions.filter(c => c.name === selectedClient).map(p => (
            <option key={p.id} value={p.product_type}>{p.product_type}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
