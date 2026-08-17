"use client";
import React from 'react';
import { Trash2 } from 'lucide-react';
import { SalaryRange } from '../types';

interface MatrixTenuredRowsProps {
  rows: any[];
  tenuredCols: SalaryRange[];
  onGridPaste: (e: React.ClipboardEvent, startIdx: number, tab: string) => void;
  onUpdateCell: (rowIdx: number, field: string, value: any) => void;
  onRemoveRule: (idx: number) => void;
}

export function MatrixTenuredRows({
  rows,
  tenuredCols,
  onGridPaste,
  onUpdateCell,
  onRemoveRule
}: MatrixTenuredRowsProps) {
  return (
    <>
      {rows.map((row, idx) => (
        <tr
          key={idx}
          className="hover:bg-slate-50 transition-colors"
          onPaste={(e) => onGridPaste(e, idx, 'associateTenured')}
        >
          <td className="px-4 py-2 text-slate-400 font-mono text-xs">{idx + 1}</td>
          <td className="px-4 py-2">
            <input
              type="text"
              placeholder="e.g. 50000 or >50000"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none text-xs focus:border-blue-500 outline-none font-semibold font-mono"
              value={row.target_collection || ''}
              onChange={(e) => onUpdateCell(idx, 'target_collection', e.target.value)}
            />
          </td>
          {tenuredCols.map((col) => (
            <td key={col.key} className="px-4 py-2">
              <input
                type="text"
                placeholder="%"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none text-xs focus:border-blue-500 outline-none font-mono"
                value={row[col.key] || ''}
                onChange={(e) => onUpdateCell(idx, col.key, e.target.value)}
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
