"use client";
import React from 'react';
import { X, MapPin } from 'lucide-react';

interface LocationMappingModalProps {
  client: any | null;
  onClose: () => void;
  locations: any[];
  selectedLocations: number[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<number[]>>;
  saving: boolean;
  onSave: () => Promise<void>;
}

export function LocationMappingModal({
  client,
  onClose,
  locations,
  selectedLocations,
  setSelectedLocations,
  saving,
  onSave
}: LocationMappingModalProps) {
  if (!client) return null;

  const toggleLocation = (locId: number) => {
    setSelectedLocations(prev => 
      prev.includes(locId) ? prev.filter(id => id !== locId) : [...prev, locId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden flex flex-col rounded-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Assign Locations: {client.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs">
          <p className="text-slate-500">Select operating branches where this client handles collections:</p>
          <div className="space-y-2 border border-slate-200 p-3 bg-slate-50/50 max-h-56 overflow-y-auto">
            {locations.map(loc => (
              <label key={loc.id} className="flex items-center gap-2.5 p-1.5 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(loc.id)}
                  onChange={() => toggleLocation(loc.id)}
                  className="rounded-none text-blue-600"
                />
                <span>{loc.name}</span>
              </label>
            ))}
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
            disabled={saving}
            onClick={onSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Locations'}
          </button>
        </div>
      </div>
    </div>
  );
}
