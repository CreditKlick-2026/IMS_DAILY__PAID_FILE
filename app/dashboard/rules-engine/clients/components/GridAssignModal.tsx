"use client";
import React from 'react';
import { X, Grid3X3, CheckCircle2 } from 'lucide-react';

interface GridAssignModalProps {
  client: any | null;
  onClose: () => void;
  selectedGrid: string;
  setSelectedGrid: (grid: string) => void;
  saving: boolean;
  onSave: () => Promise<void>;
  onUnassign: () => Promise<void>;
}

const GRIDS = [
  { id: 'grid_1', name: 'Master Grid 1', desc: 'Standard Associate (Vintage & Tenured), TL & AM Rules' },
  { id: 'grid_2', name: 'Master Grid 2', desc: 'Multi-Tier Slab Matrix' },
  { id: 'grid_3', name: 'Master Grid 3', desc: 'Custom Operations Matrix' },
  { id: 'grid_4', name: 'Master Grid 4', desc: 'Portfolio-Specific Matrix' },
  { id: 'grid_5', name: 'Master Grid 5', desc: 'Tenure & Target Matrix' },
  { id: 'grid_6', name: 'Master Grid 6', desc: 'Leadership Matrix' },
  { id: 'grid_7', name: 'Master Grid 7', desc: 'Specialized Collection Matrix' },
  { id: 'grid_8', name: 'Master Grid 8', desc: 'Enterprise Rule Matrix' },
];

export function GridAssignModal({
  client,
  onClose,
  selectedGrid,
  setSelectedGrid,
  saving,
  onSave,
  onUnassign
}: GridAssignModalProps) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col rounded-none max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Assign Calculation Grid: {client.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 text-xs overflow-y-auto">
          <p className="text-slate-500">Select the calculation rules engine matrix to evaluate payouts for this client:</p>
          <div className="space-y-2 border border-slate-200 p-2.5 bg-slate-50/50 max-h-60 overflow-y-auto">
            {GRIDS.map((grid) => {
              const isSelected = selectedGrid === grid.id;
              return (
                <div
                  key={grid.id}
                  onClick={() => setSelectedGrid(grid.id)}
                  className={`p-2.5 border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected ? 'bg-blue-50 border-blue-400 text-blue-950 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    ) : (
                      <div className="h-4 w-4 border border-slate-300 rounded-none bg-white"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs">{grid.name}</span>
                    <span className="text-[11px] text-slate-500 font-normal">{grid.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-slate-50 flex items-center justify-between">
          {client.assigned_grid ? (
            <button
              onClick={onUnassign}
              disabled={saving}
              className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
            >
              Unassign Grid
            </button>
          ) : <div></div>}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={saving || !selectedGrid}
              onClick={onSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Apply Grid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
