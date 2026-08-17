"use client";
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface LeaderSlab {
  level: string;
  avg_min: string;
  avg_max: string;
  upgrade_pct: string;
  recovery_pct: string;
}

interface Grid5LeaderTableProps {
  title: string;
  slabs: LeaderSlab[];
  onAdd: () => void;
  onUpdate: (idx: number, field: keyof LeaderSlab, val: string) => void;
  onRemove: (idx: number) => void;
}

export function Grid5LeaderTable({
  title,
  slabs,
  onAdd,
  onUpdate,
  onRemove
}: Grid5LeaderTableProps) {
  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">{title}</h3>
        <button
          onClick={onAdd}
          className="h-7 bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 rounded-none cursor-pointer"
        >
          <Plus size={13} /> Add Slab
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2 font-semibold">Tier / Level</th>
              <th className="px-3.5 py-2 font-semibold">Average Min (₹)</th>
              <th className="px-3.5 py-2 font-semibold">Average Max (₹)</th>
              <th className="px-3.5 py-2 font-semibold">Upgrade Payout (%)</th>
              <th className="px-3.5 py-2 font-semibold">Recovery Payout (%)</th>
              <th className="px-3.5 py-2 font-semibold w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slabs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No leadership slabs configured. Click "Add Slab" to create one.
                </td>
              </tr>
            ) : (
              slabs.map((slab, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-2.5 py-1.5">
                    <input
                      value={slab.level || ''}
                      onChange={(e) => onUpdate(idx, 'level', e.target.value)}
                      placeholder="e.g. Tier 1"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      value={slab.avg_min || ''}
                      onChange={(e) => onUpdate(idx, 'avg_min', e.target.value)}
                      placeholder="Min"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      value={slab.avg_max || ''}
                      onChange={(e) => onUpdate(idx, 'avg_max', e.target.value)}
                      placeholder="Max"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      type="number"
                      step="0.01"
                      value={slab.upgrade_pct || ''}
                      onChange={(e) => onUpdate(idx, 'upgrade_pct', e.target.value)}
                      placeholder="%"
                      className="w-full px-2 py-1 border border-blue-300 bg-blue-50/40 text-blue-900 font-bold outline-none focus:border-blue-600 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      type="number"
                      step="0.01"
                      value={slab.recovery_pct || ''}
                      onChange={(e) => onUpdate(idx, 'recovery_pct', e.target.value)}
                      placeholder="%"
                      className="w-full px-2 py-1 border border-emerald-300 bg-emerald-50/40 text-emerald-900 font-bold outline-none focus:border-emerald-600 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5 text-right">
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
