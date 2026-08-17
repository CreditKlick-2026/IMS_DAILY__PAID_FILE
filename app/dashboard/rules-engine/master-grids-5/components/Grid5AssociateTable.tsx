"use client";
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface AssociateSlab {
  vintage: string;
  upgrade_pct: string;
  recovery_pct: string;
}

interface Grid5AssociateTableProps {
  slabs: AssociateSlab[];
  onAdd: () => void;
  onUpdate: (idx: number, field: keyof AssociateSlab, val: string) => void;
  onRemove: (idx: number) => void;
}

export function Grid5AssociateTable({
  slabs,
  onAdd,
  onUpdate,
  onRemove
}: Grid5AssociateTableProps) {
  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Associate Upgrade & Recovery Slabs</h3>
          <p className="text-[11px] text-slate-500">Configure separate percentage payouts for account upgrades and recoveries.</p>
        </div>
        <button
          onClick={onAdd}
          className="h-7 bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 rounded-none cursor-pointer"
        >
          <Plus size={13} /> Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2 font-semibold">Vintage Bracket</th>
              <th className="px-3.5 py-2 font-semibold">Upgrade Payout Rate (%)</th>
              <th className="px-3.5 py-2 font-semibold">Recovery Payout Rate (%)</th>
              <th className="px-3.5 py-2 font-semibold w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slabs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No associate slabs configured. Click "Add Row" to create one.
                </td>
              </tr>
            ) : (
              slabs.map((slab, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3 py-2">
                    <input
                      value={slab.vintage || ''}
                      onChange={(e) => onUpdate(idx, 'vintage', e.target.value)}
                      placeholder="e.g. 0-3M, >3M"
                      className="w-full px-2.5 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={slab.upgrade_pct || ''}
                      onChange={(e) => onUpdate(idx, 'upgrade_pct', e.target.value)}
                      placeholder="Upgrade %"
                      className="w-full px-2.5 py-1 border border-blue-300 bg-blue-50/40 text-blue-900 font-bold outline-none focus:border-blue-600 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={slab.recovery_pct || ''}
                      onChange={(e) => onUpdate(idx, 'recovery_pct', e.target.value)}
                      placeholder="Recovery %"
                      className="w-full px-2.5 py-1 border border-emerald-300 bg-emerald-50/40 text-emerald-900 font-bold outline-none focus:border-emerald-600 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => onRemove(idx)}
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
