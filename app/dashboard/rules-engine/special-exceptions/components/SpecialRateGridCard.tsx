"use client";
import React from 'react';
import { Plus, Trash2, Save, Sparkles } from 'lucide-react';

interface SpecialRateGridCardProps {
  specialGrid: any[];
  setSpecialGrid: React.Dispatch<React.SetStateAction<any[]>>;
  isSavingGrid: boolean;
  onSaveGrid: () => void;
}

export function SpecialRateGridCard({
  specialGrid,
  setSpecialGrid,
  isSavingGrid,
  onSaveGrid
}: SpecialRateGridCardProps) {
  const addRow = () => {
    setSpecialGrid([...specialGrid, { min: '', max: '', payout_pct: '0.00' }]);
  };

  const updateRow = (idx: number, field: string, val: string) => {
    const updated = [...specialGrid];
    updated[idx] = { ...updated[idx], [field]: val };
    setSpecialGrid(updated);
  };

  const removeRow = (idx: number) => {
    setSpecialGrid(specialGrid.filter((_, i) => i !== idx));
  };

  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">High Collection Special Slabs</h3>
          <p className="text-[11px] text-slate-500">Threshold based percentage overrides applied regardless of associate tenure.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addRow}
            className="h-7 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2.5 text-xs font-bold shadow-2xs flex items-center gap-1 rounded-none cursor-pointer"
          >
            <Plus size={13} /> Add Tier
          </button>
          <button
            onClick={onSaveGrid}
            disabled={isSavingGrid}
            className="h-7 bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-bold shadow-2xs flex items-center gap-1 rounded-none disabled:opacity-50 cursor-pointer"
          >
            <Save size={13} /> {isSavingGrid ? 'Saving...' : 'Save Slabs'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2 font-semibold">Min Collection (₹)</th>
              <th className="px-3.5 py-2 font-semibold">Max Collection (₹)</th>
              <th className="px-3.5 py-2 font-semibold">Override Incentive Rate (%)</th>
              <th className="px-3.5 py-2 font-semibold w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {specialGrid.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No special tiers defined. Click "Add Tier" to create threshold overrides.
                </td>
              </tr>
            ) : (
              specialGrid.map((slab, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2">
                    <input
                      value={slab.min || ''}
                      onChange={(e) => updateRow(idx, 'min', e.target.value)}
                      placeholder="e.g. 350000"
                      className="w-full px-2.5 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={slab.max || ''}
                      onChange={(e) => updateRow(idx, 'max', e.target.value)}
                      placeholder="e.g. 500000"
                      className="w-full px-2.5 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={slab.payout_pct || ''}
                      onChange={(e) => updateRow(idx, 'payout_pct', e.target.value)}
                      placeholder="%"
                      className="w-full px-2.5 py-1 border border-red-300 bg-red-50/40 text-red-900 font-bold outline-none focus:border-red-600 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeRow(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
