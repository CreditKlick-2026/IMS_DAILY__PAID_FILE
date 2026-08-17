"use client";
import React from 'react';
import { X, Database, CheckCircle2, Layers } from 'lucide-react';
import { ColumnMappings } from '../types';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnMappings?: ColumnMappings;
}

export function ColumnMappingModal({ isOpen, onClose, columnMappings }: ColumnMappingModalProps) {
  if (!isOpen) return null;

  const dpfFields = [
    { label: 'Collection Amount', dbCol: columnMappings?.collection || 'total_money_collected', type: 'NUMERIC (₹)' },
    { label: 'Employee Code', dbCol: columnMappings?.employee_code || 'employee_code', type: 'VARCHAR' },
    { label: 'Employee Name', dbCol: columnMappings?.employee_name || 'employee_name', type: 'VARCHAR' },
    { label: 'Team Leader (TL)', dbCol: columnMappings?.tl_name || 'tl_name', type: 'VARCHAR' },
    { label: 'Assistant Manager (AM)', dbCol: columnMappings?.am_name || 'am_name', type: 'VARCHAR' },
  ];

  const kekaFields = [
    { label: 'Salary / CTC', dbCol: columnMappings?.salary || 'ctc', type: 'NUMERIC (₹)' },
    { label: 'Date of Joining (DOJ)', dbCol: columnMappings?.doj || 'date_of_joining', type: 'DATE / TIMESTAMP' },
    { label: 'Designation / Role', dbCol: columnMappings?.designation || 'job_title', type: 'VARCHAR' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Database Ingestion & Schema Links</h3>
              <p className="text-xs text-slate-500">Auto-mapped operational fields from Daily Paid Files (DPF) and Keka HR Master.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* DPF Schema */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                1. Daily Paid Files (DPF) Ingestion Schema
              </h4>
            </div>
            <div className="border rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-3.5 py-2 font-semibold">Engine Field</th>
                    <th className="px-3.5 py-2 font-semibold">Mapped DB Column</th>
                    <th className="px-3.5 py-2 font-semibold">Data Type</th>
                    <th className="px-3.5 py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dpfFields.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="px-3.5 py-2 font-medium text-slate-800">{f.label}</td>
                      <td className="px-3.5 py-2 font-mono text-emerald-700 bg-emerald-50/40">{f.dbCol}</td>
                      <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">{f.type}</td>
                      <td className="px-3.5 py-2 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Auto-Linked
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keka Schema */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                2. Keka HR Master Ingestion Schema
              </h4>
            </div>
            <div className="border rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-3.5 py-2 font-semibold">Engine Field</th>
                    <th className="px-3.5 py-2 font-semibold">Mapped DB Column</th>
                    <th className="px-3.5 py-2 font-semibold">Data Type</th>
                    <th className="px-3.5 py-2 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {kekaFields.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="px-3.5 py-2 font-medium text-slate-800">{f.label}</td>
                      <td className="px-3.5 py-2 font-mono text-blue-700 bg-blue-50/40">{f.dbCol}</td>
                      <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">{f.type}</td>
                      <td className="px-3.5 py-2 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Auto-Linked
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-slate-400" /> Managed dynamically by Rules Engine runtime
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
