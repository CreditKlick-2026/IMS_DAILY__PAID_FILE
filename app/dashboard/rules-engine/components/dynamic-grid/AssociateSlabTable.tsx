"use client";
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface AssociateSlabTableProps {
  slabs: any[];
  hasClientProduct: boolean;
  onAddSlab: () => void;
  onUpdateSlab: (idx: number, field: string, val: string) => void;
  onRemoveSlab: (idx: number) => void;
}

export function AssociateSlabTable({
  slabs,
  hasClientProduct,
  onAddSlab,
  onUpdateSlab,
  onRemoveSlab
}: AssociateSlabTableProps) {
  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Associate Tier Slabs Matrix</h3>
        <button
          onClick={onAddSlab}
          className="h-7 bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 rounded-none cursor-pointer"
        >
          <Plus size={13} /> Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              {hasClientProduct && <th className="px-3 py-2 font-semibold">Client</th>}
              {hasClientProduct && <th className="px-3 py-2 font-semibold">Product</th>}
              <th className="px-3 py-2 font-semibold">Vintage</th>
              {hasClientProduct && <th className="px-3 py-2 font-semibold">Level</th>}
              <th className="px-3 py-2 font-semibold">Target Min (₹)</th>
              <th className="px-3 py-2 font-semibold">Target Max (₹)</th>
              <th className="px-3 py-2 font-semibold">Payout Rate (%)</th>
              <th className="px-3 py-2 font-semibold w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slabs.length === 0 ? (
              <tr>
                <td colSpan={hasClientProduct ? 8 : 5} className="px-4 py-8 text-center text-slate-400">
                  No slabs configured. Click "Add Row" to add associate tier.
                </td>
              </tr>
            ) : (
              slabs.map((slab, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  {hasClientProduct && (
                    <td className="px-2.5 py-1.5">
                      <input
                        value={slab.client || ''}
                        onChange={(e) => onUpdateSlab(idx, 'client', e.target.value)}
                        placeholder="e.g. Axis"
                        className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none"
                      />
                    </td>
                  )}
                  {hasClientProduct && (
                    <td className="px-2.5 py-1.5">
                      <input
                        value={slab.product || ''}
                        onChange={(e) => onUpdateSlab(idx, 'product', e.target.value)}
                        placeholder="e.g. CC"
                        className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none"
                      />
                    </td>
                  )}
                  <td className="px-2.5 py-1.5">
                    <input
                      value={slab.vintage || ''}
                      onChange={(e) => onUpdateSlab(idx, 'vintage', e.target.value)}
                      placeholder="e.g. <90"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  {hasClientProduct && (
                    <td className="px-2.5 py-1.5">
                      <input
                        value={slab.level || ''}
                        onChange={(e) => onUpdateSlab(idx, 'level', e.target.value)}
                        placeholder="Level"
                        className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none"
                      />
                    </td>
                  )}
                  <td className="px-2.5 py-1.5">
                    <input
                      value={slab.min || ''}
                      onChange={(e) => onUpdateSlab(idx, 'min', e.target.value)}
                      placeholder="Min"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      value={slab.max || ''}
                      onChange={(e) => onUpdateSlab(idx, 'max', e.target.value)}
                      placeholder="Max"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      type="number"
                      step="0.01"
                      value={slab.payout_pct || ''}
                      onChange={(e) => onUpdateSlab(idx, 'payout_pct', e.target.value)}
                      placeholder="%"
                      className="w-full px-2 py-1 border border-blue-300 bg-blue-50/40 text-blue-900 font-bold outline-none focus:border-blue-600 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5 text-right">
                    <button
                      onClick={() => onRemoveSlab(idx)}
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
