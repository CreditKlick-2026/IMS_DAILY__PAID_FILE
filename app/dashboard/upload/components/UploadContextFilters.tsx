"use client";
import React from 'react';

interface UploadContextFiltersProps {
  userRole?: string;
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;
  locationsList: any[];
  selectedClientName: string;
  setSelectedClientName: (c: string) => void;
  clientsList: any[];
  selectedProductType: string;
  setSelectedProductType: (p: string) => void;
  targetEmployeeId: string;
  setTargetEmployeeId: (t: string) => void;
  usersList: any[];
}

export function UploadContextFilters({
  userRole,
  selectedLocation,
  setSelectedLocation,
  locationsList,
  selectedClientName,
  setSelectedClientName,
  clientsList,
  selectedProductType,
  setSelectedProductType,
  targetEmployeeId,
  setTargetEmployeeId,
  usersList
}: UploadContextFiltersProps) {
  return (
    <div className="bg-white p-3 border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-3 rounded-none">
      {userRole === 'admin' && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location:</span>
          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 min-w-[140px] rounded-none"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locationsList.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client:</span>
        <select
          className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 min-w-[140px] rounded-none"
          value={selectedClientName}
          onChange={e => {
            setSelectedClientName(e.target.value);
            setSelectedProductType('');
          }}
        >
          <option value="">Select Client</option>
          {Array.from(new Set(clientsList.map(p => p.name))).sort().map(name => (
            <option key={name as string} value={name as string}>{name as string}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product:</span>
        <select
          disabled={!selectedClientName}
          className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700 min-w-[140px] rounded-none disabled:opacity-40"
          value={selectedProductType}
          onChange={e => setSelectedProductType(e.target.value)}
        >
          <option value="">Select Product</option>
          {clientsList.filter(c => c.name === selectedClientName).map(p => (
            <option key={p.product_type} value={p.product_type}>{p.product_type}</option>
          ))}
        </select>
      </div>

      {userRole === 'admin' && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Admin Proxy:</span>
          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-teal-300 bg-teal-50/50 text-teal-900 outline-none focus:border-teal-600 cursor-pointer min-w-[160px] rounded-none"
            value={targetEmployeeId}
            onChange={e => setTargetEmployeeId(e.target.value)}
          >
            <option value="">Self (Admin)</option>
            {usersList.map(u => (
              <option key={u.employee_id} value={u.employee_id}>{u.name} ({u.employee_id})</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
