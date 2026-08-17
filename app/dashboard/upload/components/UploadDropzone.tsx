"use client";
import React from 'react';
import { UploadCloud, FileSpreadsheet, Lock, Trash2, KeyRound } from 'lucide-react';

interface UploadDropzoneProps {
  file: File | null;
  setFile: (f: File | null) => void;
  isDragOver: boolean;
  setIsDragOver: (b: boolean) => void;
  needsPassword: boolean;
  filePassword: string;
  setFilePassword: (p: string) => void;
  onValidatePassword: (p: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onReset: () => void;
}

export function UploadDropzone({
  file,
  setFile,
  isDragOver,
  setIsDragOver,
  needsPassword,
  filePassword,
  setFilePassword,
  onValidatePassword,
  fileInputRef,
  onReset
}: UploadDropzoneProps) {
  return (
    <div className="border border-slate-200/90 bg-white p-5 shadow-2xs rounded-none space-y-4">
      <label
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-none cursor-pointer transition-colors ${
          isDragOver
            ? 'border-teal-600 bg-teal-50/50'
            : file
            ? 'border-emerald-500 bg-emerald-50/30'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            onReset();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
              onReset();
            }
          }}
        />

        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-[#024e4d] text-white rounded-none shadow-2xs">
            {file ? <FileSpreadsheet size={24} /> : <UploadCloud size={24} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {file ? file.name : 'Click to browse or drop collection file here'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {file ? `${(file.size / 1024).toFixed(1)} KB • Ready for validation` : 'Supported formats: .xlsx, .xls, .csv'}
            </p>
          </div>
        </div>
      </label>

      {/* Password Protection Dialog if detected */}
      {needsPassword && (
        <div className="bg-amber-50 border border-amber-300 p-3.5 flex flex-col sm:flex-row items-center gap-3 rounded-none">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold shrink-0">
            <Lock size={16} />
            <span>Password Protected Sheet:</span>
          </div>
          <div className="flex flex-1 items-center gap-2 w-full">
            <input
              type="password"
              placeholder="Enter file password to decrypt..."
              className="flex-1 px-3 py-1 text-xs border border-amber-300 bg-white outline-none focus:border-amber-600 rounded-none"
              value={filePassword}
              onChange={(e) => setFilePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onValidatePassword(filePassword)}
            />
            <button
              onClick={() => onValidatePassword(filePassword)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-none cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <KeyRound size={12} /> Unlock
            </button>
          </div>
        </div>
      )}

      {/* Clear File Action */}
      {file && (
        <div className="flex justify-end">
          <button
            onClick={() => { setFile(null); onReset(); }}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={13} /> Remove File
          </button>
        </div>
      )}
    </div>
  );
}
