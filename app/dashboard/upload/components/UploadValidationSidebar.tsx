"use client";
import React from 'react';
import { CheckCircle2, XCircle, FileSpreadsheet, Loader2, Info } from 'lucide-react';

interface UploadValidationSidebarProps {
  selectedClient: string;
  activeHeaders: any[];
  isValidating: boolean;
  validationResult: {
    isValid: boolean;
    missingHeaders: string[];
    foundHeaders: string[];
    rowCount: number;
    sheetName?: string;
  } | null;
}

export function UploadValidationSidebar({
  selectedClient,
  activeHeaders,
  isValidating,
  validationResult
}: UploadValidationSidebarProps) {
  return (
    <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
      <div className="border border-slate-200/90 bg-white shadow-2xs overflow-hidden rounded-none">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#024e4d]" />
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Column Validation</h3>
          </div>
          <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.5 border border-teal-200 font-bold">
            {activeHeaders.length} Schema Rules
          </span>
        </div>

        <div className="p-4 space-y-3">
          {isValidating ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#024e4d]" />
              <p className="text-xs font-semibold">Validating Excel schema...</p>
            </div>
          ) : !validationResult ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 flex items-center gap-3 rounded-none">
                <FileSpreadsheet className="h-6 w-6 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Required Columns</p>
                  <p className="text-[10px] text-slate-500">
                    {selectedClient ? 'All required columns must match' : 'Select client to load schema'}
                  </p>
                </div>
              </div>

              {selectedClient && (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {activeHeaders.map((req) => (
                    <div key={req.key} className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700">{req.display}</span>
                      <span className="text-[9px] font-bold uppercase text-slate-400">Required</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className={`p-3 border flex items-center gap-3 rounded-none ${
                validationResult.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {validationResult.isValid ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
                <div>
                  <p className="text-xs font-bold">{validationResult.isValid ? 'Structure Verified ✓' : 'Schema Errors Found'}</p>
                  <p className="text-[10px]">{validationResult.foundHeaders.length}/{activeHeaders.length} headers verified</p>
                </div>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {activeHeaders.map((req) => {
                  const found = validationResult.foundHeaders.includes(req.display);
                  return (
                    <div key={req.key} className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs">
                      <span className={`font-semibold ${found ? 'text-slate-800' : 'text-slate-400'}`}>{req.display}</span>
                      {found ? (
                        <span className="text-emerald-600 font-bold text-[11px]">✓</span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[9px] font-bold uppercase border border-red-200">Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {!validationResult.isValid && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2 rounded-none">
                  <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px]">
                    <strong>Action Required:</strong> Rename missing header columns in your file to match the expected names.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
