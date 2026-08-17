"use client";
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface RidersTableProps {
  riders: any[];
  onAddRider: () => void;
  onUpdateRider: (idx: number, field: string, val: string) => void;
  onRemoveRider: (idx: number) => void;
}

export function RidersTable({
  riders,
  onAddRider,
  onUpdateRider,
  onRemoveRider
}: RidersTableProps) {
  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Riders & Docking Rules Matrix</h3>
        <button
          onClick={onAddRider}
          className="h-7 bg-blue-600 hover:bg-blue-700 text-white px-3 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1 rounded-none cursor-pointer"
        >
          <Plus size={13} /> Add Rider
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 font-semibold w-48">Role / Rule Name</th>
              <th className="px-3 py-2 font-semibold">Docking / Eligibility Condition</th>
              <th className="px-3 py-2 font-semibold">Payout Multiplier / Extra Bonus</th>
              <th className="px-3 py-2 font-semibold w-12 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {riders.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No riders configured. Click "Add Rider" to configure docking or booster rules.
                </td>
              </tr>
            ) : (
              riders.map((rider, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-2.5 py-1.5">
                    <input
                      value={rider.role || ''}
                      onChange={(e) => onUpdateRider(idx, 'role', e.target.value)}
                      placeholder="e.g. Caller - Rider 1"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      value={rider.docking || ''}
                      onChange={(e) => onUpdateRider(idx, 'docking', e.target.value)}
                      placeholder="e.g. >=85% PCP"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5">
                    <input
                      value={rider.payout || ''}
                      onChange={(e) => onUpdateRider(idx, 'payout', e.target.value)}
                      placeholder="e.g. 1.25x or +₹2,500"
                      className="w-full px-2 py-1 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none font-mono"
                    />
                  </td>
                  <td className="px-2.5 py-1.5 text-right">
                    <button
                      onClick={() => onRemoveRider(idx)}
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
