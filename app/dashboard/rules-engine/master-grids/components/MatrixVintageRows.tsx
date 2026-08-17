"use client";
import React from 'react';
import { Trash2 } from 'lucide-react';

interface MatrixVintageRowsProps {
  rows: any[];
  onGridPaste: (e: React.ClipboardEvent, startIdx: number, tab: string) => void;
  onUpdateCell: (rowIdx: number, field: string, value: any) => void;
  onRemoveRule: (idx: number) => void;
}

export function MatrixVintageRows({
  rows,
  onGridPaste,
  onUpdateCell,
  onRemoveRule
}: MatrixVintageRowsProps) {
  const months = ['m0', 'm1', 'm2', 'm3'];

  return (
    <>
      {rows.map((row, idx) => (
        <tr
          key={idx}
          className="hover:bg-slate-50 transition-colors"
          onPaste={(e) => onGridPaste(e, idx, 'associateVintage')}
        >
          <td className="px-4 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
          <td className="px-4 py-2">
            <input
              type="text"
              placeholder="e.g. 50000"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none text-xs focus:border-blue-500 outline-none font-semibold font-mono"
              value={row.target_collection || ''}
              onChange={(e) => onUpdateCell(idx, 'target_collection', e.target.value)}
            />
          </td>
          {months.map((m) => (
            <td key={m} className="px-4 py-2">
              <input
                type="text"
                placeholder="₹ Fixed"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none text-xs focus:border-blue-500 outline-none font-mono"
                value={row[m] || ''}
                onChange={(e) => onUpdateCell(idx, m, e.target.value)}
              />
            </td>
          ))}
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
