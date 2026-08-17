"use client";
import React from 'react';
import { Database, Upload, Loader2, ArrowRight, CheckCircle2, Calendar, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdminKekaValidationChecklist } from './AdminKekaValidationChecklist';

interface AdminKekaUploadProps {
  kekaMonth: string;
  setKekaMonth: (m: string) => void;
  kekaYear: string;
  setKekaYear: (y: string) => void;
  kekaColumns: any[];
  kekaFile: File | null;
  setKekaFile: (f: File | null) => void;
  isValidatingKeka: boolean;
  kekaValidationResult: any;
  uploadingKeka: boolean;
  kekaMessage: string;
  activeKekaJob: any;
  kekaProgressPercent: number;
  onValidateKekaFile: () => void;
  onKekaUpload: () => void;
  onNavigateToColumns?: () => void;
}

export function AdminKekaUpload({
  kekaMonth,
  setKekaMonth,
  kekaYear,
  setKekaYear,
  kekaColumns,
  kekaFile,
  setKekaFile,
  isValidatingKeka,
  kekaValidationResult,
  uploadingKeka,
  kekaMessage,
  activeKekaJob,
  kekaProgressPercent,
  onValidateKekaFile,
  onKekaUpload,
  onNavigateToColumns
}: AdminKekaUploadProps) {
  const router = useRouter();
  const months = [
    { v: '1', l: 'January' }, { v: '2', l: 'February' }, { v: '3', l: 'March' },
    { v: '4', l: 'April' }, { v: '5', l: 'May' }, { v: '6', l: 'June' },
    { v: '7', l: 'July' }, { v: '8', l: 'August' }, { v: '9', l: 'September' },
    { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
  ];
  const years = ['2024', '2025', '2026', '2027'];

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#024e4d] text-white shrink-0 rounded-none shadow-2xs">
            <Database size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Unified Keka Master Ingestion</h1>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
                Company-Wide Master
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload single unified company-wide headcount spreadsheet with automatic row-level location & client mapping.
            </p>
          </div>
        </div>

        {/* Timeline & Schema Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2 py-1 rounded-none">
            <Calendar size={12} className="text-slate-400" />
            <select
              className="text-xs font-semibold bg-transparent outline-none cursor-pointer text-slate-700"
              value={kekaMonth}
              onChange={(e) => setKekaMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m.v} value={m.v}>{m.l}</option>
              ))}
            </select>
          </div>

          <select
            className="px-2 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={kekaYear}
            onChange={(e) => setKekaYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={onNavigateToColumns}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 rounded-none cursor-pointer transition-colors"
          >
            <SlidersHorizontal size={13} className="text-[#024e4d]" />
            <span>Configure Columns</span>
          </button>

          <button
            onClick={() => router.push('/dashboard/keka-master')}
            className="px-3 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 rounded-none cursor-pointer transition-colors"
          >
            <span>View Keka Master</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Unified Master Upload Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/90 p-5 shadow-2xs">
            <div
              className="border-2 border-dashed border-slate-300 hover:border-teal-600 p-10 flex flex-col items-center justify-center transition-colors cursor-pointer bg-slate-50/50"
              onClick={() => document.getElementById('keka-master-file-input')?.click()}
            >
              <input
                id="keka-master-file-input"
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setKekaFile(e.target.files[0]);
                  }
                }}
              />
              <Upload size={36} className="text-[#024e4d] mb-2" />
              <p className="text-sm font-bold text-slate-900">
                {kekaFile ? kekaFile.name : 'Select or Drop Unified Keka Master Spreadsheet'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Ingests all locations, clients, products, designations, and salaries across the company.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Accepts .xlsx, .xls, .csv</p>
            </div>

            {kekaFile && (
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs font-mono font-semibold text-slate-700">
                  {(kekaFile.size / 1024).toFixed(1)} KB • Target: {months.find(m => m.v === kekaMonth)?.l} {kekaYear}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onValidateKekaFile}
                    disabled={isValidatingKeka}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer rounded-none disabled:opacity-50"
                  >
                    {isValidatingKeka ? 'Checking...' : 'Verify File Headers'}
                  </button>
                  <button
                    onClick={onKekaUpload}
                    disabled={uploadingKeka}
                    className="px-4 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer rounded-none disabled:opacity-50"
                  >
                    {uploadingKeka ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    <span>Upload Company Master</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Job Ingestion Progress Card */}
          {activeKekaJob && (
            <div className="bg-white border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#024e4d]" />
                  <span>Master Ingestion Job: {activeKekaJob.id}</span>
                </div>
                <span className="bg-teal-50 text-teal-800 font-mono text-[10px] px-2 py-0.5 border border-teal-200">
                  {activeKekaJob.status}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 mt-3 overflow-hidden">
                <div
                  className="bg-[#024e4d] h-full transition-all duration-300"
                  style={{ width: `${kekaProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                <span>Processed: {activeKekaJob.processed_rows || 0} / {activeKekaJob.total_rows || 0} employees</span>
                <span>{kekaProgressPercent}% Complete</span>
              </div>
            </div>
          )}

          {kekaMessage && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-xs font-semibold text-[#024e4d]">
              {kekaMessage}
            </div>
          )}
        </div>

        {/* 3. Required Headers Checklist Sidebar */}
        <div className="space-y-4">
          <AdminKekaValidationChecklist
            kekaColumns={kekaColumns}
            isValidatingKeka={isValidatingKeka}
            kekaValidationResult={kekaValidationResult}
          />
        </div>
      </div>
    </div>
  );
}
