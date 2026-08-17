"use client";
import React from 'react';
import { SalaryRange } from '../types';

interface SalaryRangeEditorProps {
  ranges: SalaryRange[];
  isSaving: boolean;
  onUpdateRange: (idx: number, field: string, value: any) => void;
  onSaveRanges: () => Promise<void>;
}

export function SalaryRangeEditor({
  ranges,
  isSaving,
  onUpdateRange,
  onSaveRanges
}: SalaryRangeEditorProps) {
  return (
    <div className="bg-blue-50 border-b p-4">
      <h4 className="font-bold text-blue-900 mb-3 text-sm">Configure Salary Ranges</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {ranges.map((range, idx) => (
          <div key={range.key} className="bg-white p-3 rounded border text-sm">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Column Label</label>
            <input
              type="text"
              value={range.label}
              onChange={e => onUpdateRange(idx, 'label', e.target.value)}
              className="w-full border rounded px-2 py-1 mb-2 outline-none focus:border-blue-500"
            />

            <label className="block text-xs font-semibold text-slate-500 mb-1">Min Salary (₹)</label>
            <input
              type="number"
              value={range.min}
              onChange={e => onUpdateRange(idx, 'min', e.target.value)}
              className="w-full border rounded px-2 py-1 mb-2 outline-none focus:border-blue-500"
            />

            <label className="block text-xs font-semibold text-slate-500 mb-1">Max Salary (₹)</label>
            <input
              type="number"
              value={range.max}
              onChange={e => onUpdateRange(idx, 'max', e.target.value)}
              className="w-full border rounded px-2 py-1 outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>
      <button
        onClick={onSaveRanges}
        disabled={isSaving}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-bold shadow-sm"
      >
        {isSaving ? 'Saving...' : 'Save Ranges'}
      </button>
    </div>
  );
}
