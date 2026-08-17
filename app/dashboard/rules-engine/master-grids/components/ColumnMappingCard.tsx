"use client";
import React from 'react';
import { ColumnMappings } from '../types';

interface ColumnMappingCardProps {
  columnMappings?: ColumnMappings;
}

export function ColumnMappingCard({ columnMappings }: ColumnMappingCardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-visible flex flex-col p-5 shrink-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-slate-800">Grid Ingestion & Column Mapping</h3>
          <p className="text-xs text-slate-500">Auto-mapped fields from Keka Master and Daily Paid Files (DPF).</p>
        </div>
      </div>

      <h4 className="text-sm font-bold text-slate-700 mb-3 border-b pb-1 flex items-center gap-2">
        Calculation Column Mappings
        <span className="text-xs font-normal text-slate-400">(Auto-linked to database ingestion tables)</span>
      </h4>

      {/* DPF Columns */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          From Daily Paid File (DPF)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Collection Col</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.collection || 'total_money_collected'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Employee Code Col</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.employee_code || 'employee_code'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Employee Name Col</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.employee_name || 'employee_name'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">TL Name Col</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.tl_name || 'tl_name'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">AM Name Col</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.am_name || 'am_name'}
            />
          </div>
        </div>
      </div>

      {/* Keka Columns */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
          From Keka Master File
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Salary / CTC Col</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.salary || 'ctc'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">DOJ (Date of Joining)</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.doj || 'date_of_joining'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Designation Col</label>
            <input
              type="text"
              readOnly
              className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-600 font-mono"
              value={columnMappings?.designation || 'job_title'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
