"use client";
import React from 'react';

interface AddProcessCardProps {
  show: boolean;
  clientId: string;
  setClientId: (c: string) => void;
  locationId: string;
  setLocationId: (l: string) => void;
  name: string;
  setName: (n: string) => void;
  processHeadName: string;
  setProcessHeadName: (p: string) => void;
  clients: any[];
  locations: any[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function AddProcessCard({
  show,
  clientId,
  setClientId,
  locationId,
  setLocationId,
  name,
  setName,
  processHeadName,
  setProcessHeadName,
  clients,
  locations,
  saving,
  onSave,
  onCancel
}: AddProcessCardProps) {
  if (!show) return null;

  return (
    <div className="bg-blue-50/70 border border-blue-300 p-4 shadow-2xs animate-in fade-in duration-150 rounded-none">
      <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5">Add New Process</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <select
          className="px-3 py-1.5 text-xs border border-blue-200 bg-white outline-none focus:border-blue-600 rounded-none font-semibold text-slate-800"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">Select Client *</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.product_type || 'General'})</option>
          ))}
        </select>

        <select
          className="px-3 py-1.5 text-xs border border-blue-200 bg-white outline-none focus:border-blue-600 rounded-none font-semibold text-slate-800"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        >
          <option value="">Select Location *</option>
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Process Name (e.g. Tele-Calling) *"
          className="px-3 py-1.5 text-xs border border-blue-200 bg-white outline-none focus:border-blue-600 rounded-none font-semibold text-slate-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Process Head Name (Optional)"
          className="px-3 py-1.5 text-xs border border-blue-200 bg-white outline-none focus:border-blue-600 rounded-none text-slate-800"
          value={processHeadName}
          onChange={(e) => setProcessHeadName(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 text-xs font-medium rounded-none transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          disabled={saving || !name.trim() || !clientId || !locationId}
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-bold rounded-none disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Process'}
        </button>
      </div>
    </div>
  );
}
