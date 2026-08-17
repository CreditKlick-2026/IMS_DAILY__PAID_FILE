"use client";
import React from 'react';
import { Loader2, FileSpreadsheet, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface AdminKekaValidationChecklistProps {
  kekaColumns: any[];
  isValidatingKeka: boolean;
  kekaValidationResult: any;
}

export function AdminKekaValidationChecklist({
  kekaColumns,
  isValidatingKeka,
  kekaValidationResult
}: AdminKekaValidationChecklistProps) {
  return (
    <div className="w-full flex-shrink-0 border border-slate-200/90 bg-white shadow-2xs p-4 rounded-none space-y-3">
      {/* Title with clear, non-confusing explanation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={15} className="text-[#024e4d]" />
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Required Excel Headers</h4>
            <p className="text-[10px] text-slate-500">Columns checked during upload</p>
          </div>
        </div>
        <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
          {kekaColumns.length} Columns
        </span>
      </div>

      {isValidatingKeka ? (
        <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <Loader2 size={18} className="animate-spin text-[#024e4d]" />
          <span className="font-semibold">Checking Excel Column Headers...</span>
        </div>
      ) : !kekaValidationResult ? (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          <p className="text-[11px] text-slate-500 font-medium mb-2">
            Your uploaded spreadsheet should contain these headers (or their recognized aliases):
          </p>
          {kekaColumns.map(col => (
            <div key={col.key} className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <span className="font-semibold text-slate-800">{col.display}</span>
              <span className="text-[9px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 border border-teal-200">
                Expected
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className={`p-2.5 border text-xs font-bold flex items-center gap-2 ${
            kekaValidationResult.isValid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {kekaValidationResult.isValid ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>All Required Column Headers Found!</span>
              </>
            ) : (
              <>
                <AlertCircle size={15} className="text-red-600 shrink-0" />
                <span>Missing Expected Column Headers</span>
              </>
            )}
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {kekaColumns.map(col => {
              const found = kekaValidationResult.foundHeaders?.includes(col.display);
              return (
                <div key={col.key} className={`px-2.5 py-1.5 border text-xs flex items-center justify-between ${
                  found ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' : 'bg-red-50/50 border-red-200 text-red-700'
                }`}>
                  <span className={found ? 'font-semibold text-slate-900' : 'font-semibold text-red-800'}>
                    {col.display}
                  </span>
                  {found ? (
                    <span className="text-emerald-700 text-[10px] font-bold uppercase bg-emerald-100 px-1.5 py-0.5">Found ✓</span>
                  ) : (
                    <span className="text-red-700 text-[10px] font-bold uppercase bg-red-100 px-1.5 py-0.5">Missing ✗</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
