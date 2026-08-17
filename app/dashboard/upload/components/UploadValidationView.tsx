"use client";
import React from 'react';
import { ValidationTable } from '@/components/ValidationTable';
import { CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

interface UploadValidationViewProps {
  validatedData: { valid: any[]; invalid: any[] };
  validationView: 'summary' | 'valid' | 'invalid';
  setValidationView: (v: 'summary' | 'valid' | 'invalid') => void;
}

export function UploadValidationView({
  validatedData,
  validationView,
  setValidationView
}: UploadValidationViewProps) {
  if (validationView === 'valid') {
    return (
      <ValidationTable
        data={validatedData.valid}
        type="valid"
        onClose={() => setValidationView('summary')}
      />
    );
  }

  if (validationView === 'invalid') {
    return (
      <ValidationTable
        data={validatedData.invalid}
        type="invalid"
        onClose={() => setValidationView('summary')}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 p-4 shadow-2xs space-y-3 rounded-none">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
        Row-Level Pre-Ingestion Analysis
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-none flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Valid Rows</span>
            <div className="text-lg font-black font-mono text-emerald-700">
              {validatedData.valid.length.toLocaleString('en-IN')}
            </div>
          </div>
          {validatedData.valid.length > 0 && (
            <button
              onClick={() => setValidationView('valid')}
              className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-none shadow-2xs hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
            >
              <Eye size={12} /> Inspect
            </button>
          )}
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-none flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-800 tracking-wider">Invalid Rows</span>
            <div className="text-lg font-black font-mono text-red-700">
              {validatedData.invalid.length.toLocaleString('en-IN')}
            </div>
          </div>
          {validatedData.invalid.length > 0 && (
            <button
              onClick={() => setValidationView('invalid')}
              className="px-2.5 py-1 bg-white border border-red-300 text-red-800 text-xs font-bold rounded-none shadow-2xs hover:bg-red-100 flex items-center gap-1 cursor-pointer"
            >
              <Eye size={12} /> Inspect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
