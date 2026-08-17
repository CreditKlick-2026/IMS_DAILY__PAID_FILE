"use client";
import React from 'react';
import { Trash2 } from 'lucide-react';

interface MatrixLeadershipRowsProps {
  rows: any[];
  isSpecial?: boolean;
  onGridPaste: (e: React.ClipboardEvent, startIdx: number, tab: string) => void;
  onUpdateCell: (rowIdx: number, field: string, value: any) => void;
  onRemoveRule: (idx: number) => void;
}

export function MatrixLeadershipRows({
  rows,
  isSpecial,
  onGridPaste,
  onUpdateCell,
  onRemoveRule
}: MatrixLeadershipRowsProps) {
  const tabName = isSpecial ? 'specialExceptions' : 'leadership';

  return (
    <>
      {rows.map((row, idx) => (
        <tr
          key={idx}
          className="hover:bg-slate-50 transition-colors"
          onPaste={(e) => onGridPaste(e, idx, tabName)}
        >
          <td className="px-4 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
          {!isSpecial && (
            <td className="px-4 py-2">
              <select
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none text-xs focus:border-blue-500 outline-none font-semibold text-slate-800"
                value={row.role || 'TL'}
                onChange={(e) => onUpdateCell(idx, 'role', e.target.value)}
              >
                <option value="TL">Team Leader (TL)</option>
                <option value="AM">Area Manager (AM)</option>
                <option value="CM">City Manager (CM)</option>
              </select>
            </td>
          )}
          <td className="px-4 py-2">
            <input
              type="text"
              placeholder="e.g. 100000"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none text-xs focus:border-blue-500 outline-none font-semibold font-mono"
              value={row.target_collection || ''}
              onChange={(e) => onUpdateCell(idx, 'target_collection', e.target.value)}
            />
          </td>
          <td className="px-4 py-2">
            <input
              type="text"
              placeholder="%"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none text-xs focus:border-blue-500 outline-none font-mono font-bold text-blue-700"
              value={row.incentive_percentage || ''}
              onChange={(e) => onUpdateCell(idx, 'incentive_percentage', e.target.value)}
            />
          </td>
          <td className="px-4 py-2 text-right">
            <button
              onClick={() => onRemoveRule(idx)}
              className="text-slate-400 hover:text-red-600 p-1 rounded-none cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
