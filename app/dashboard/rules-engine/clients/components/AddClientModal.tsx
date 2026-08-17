"use client";
import React from 'react';
import { X, Building2 } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  newName: string;
  setNewName: (name: string) => void;
  newProductType: string;
  setNewProductType: (type: string) => void;
  newLocationIds: number[];
  setNewLocationIds: React.Dispatch<React.SetStateAction<number[]>>;
  products: any[];
  locations: any[];
  saving: boolean;
  onSave: () => Promise<void>;
}

export function AddClientModal({
  isOpen,
  onClose,
  newName,
  setNewName,
  newProductType,
  setNewProductType,
  newLocationIds,
  setNewLocationIds,
  products,
  locations,
  saving,
  onSave
}: AddClientModalProps) {
  if (!isOpen) return null;

  const toggleLocation = (locId: number) => {
    setNewLocationIds(prev => 
      prev.includes(locId) ? prev.filter(id => id !== locId) : [...prev, locId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col rounded-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Register New Client</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Client Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client / Bank Name *</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. HDFC Bank, SBI Cards, Kotak..."
              className="w-full px-3 py-2 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          {/* Product Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Type *</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs"
              value={newProductType}
              onChange={(e) => setNewProductType(e.target.value)}
            >
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Operating Locations */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Assign Operating Locations</label>
            <div className="grid grid-cols-2 gap-2 border border-slate-200 p-3 bg-slate-50/50 max-h-40 overflow-y-auto">
              {locations.map(loc => (
                <label key={loc.id} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={newLocationIds.includes(loc.id)}
                    onChange={() => toggleLocation(loc.id)}
                    className="rounded-none text-blue-600"
                  />
                  <span>{loc.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={saving || !newName.trim()}
            onClick={onSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </div>
    </div>
  );
}
