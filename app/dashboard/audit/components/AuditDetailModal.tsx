"use client";
import React, { useState } from 'react';
import { X, Copy, Check, Trash2, ShieldCheck, Activity } from 'lucide-react';

interface AuditDetailModalProps {
  log: any | null;
  onClose: () => void;
  onDeleteSingle: (id: number) => void;
}

export function AuditDetailModal({ log, onClose, onDeleteSingle }: AuditDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detailsObj = typeof log.details === 'string' ? (() => {
    try { return JSON.parse(log.details); } catch { return log.details; }
  })() : log.details;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 rounded-none flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#024e4d] text-white">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Audit Log Details</h2>
                <span className="bg-slate-200 text-slate-700 font-mono text-[10px] font-bold px-1.5 py-0.5">
                  #{log.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 border border-slate-200">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Action</p>
              <p className="font-mono font-bold text-teal-900 mt-0.5">{log.action}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Entity Type</p>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{log.entity_type || log.entity || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Changed By</p>
              <p className="font-bold text-slate-800 mt-0.5">{log.changed_by || 'System'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Target ID</p>
              <p className="font-mono text-slate-600 mt-0.5 truncate">{log.entity_id || '—'}</p>
            </div>
          </div>

          {/* Detailed Payload Inspector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity size={13} className="text-teal-700" />
                Raw Payload Inspection
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-teal-800 px-2 py-1 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} className="text-teal-700" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-64 leading-relaxed">
              {JSON.stringify(detailsObj, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Permanently delete audit log #${log.id}?`)) {
                onDeleteSingle(log.id);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 size={13} />
            <span>Delete This Record</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
