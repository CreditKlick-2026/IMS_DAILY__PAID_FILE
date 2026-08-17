"use client";
import React from 'react';
import { Plus, X, Sparkles, HelpCircle, Check } from 'lucide-react';

interface AddKekaColumnCardProps {
  newKey: string;
  setNewKey: (key: string) => void;
  newDisplay: string;
  setNewDisplay: (display: string) => void;
  newLabels: string;
  setNewLabels: (labels: string) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function AddKekaColumnCard({
  newKey,
  setNewKey,
  newDisplay,
  setNewDisplay,
  newLabels,
  setNewLabels,
  saving,
  onSave,
  onCancel
}: AddKekaColumnCardProps) {
  const PRESET_TEMPLATES = [
    { label: 'PAN Card', key: 'pan_number', display: 'PAN Number', aliases: 'PAN, PAN No, PAN Number, PAN_CARD, pan_no, pannumber' },
    { label: 'Aadhar Card', key: 'aadhar_number', display: 'Aadhar Number', aliases: 'Aadhar, Aadhar No, Aadhar Number, AADHAR, aadhar_no, UID' },
    { label: 'Bank Account', key: 'bank_account', display: 'Bank Account No', aliases: 'Bank Account, Account No, Account Number, Bank A/C, bank_account_no' },
    { label: 'Emergency Contact', key: 'emergency_contact', display: 'Emergency Contact', aliases: 'Emergency Contact, Emergency Phone, Alternate Contact, emergency_number' },
    { label: 'Department', key: 'department', display: 'Department', aliases: 'Department, Dept, DEPT, Department Name, dept_name' }
  ];

  const handleDisplayChange = (text: string) => {
    setNewDisplay(text);
    if (!newKey || newKey === newDisplay.toLowerCase().replace(/[^a-z0-9]/g, '_')) {
      const slug = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      setNewKey(slug);
    }
    if (!newLabels) {
      const clean = text.trim();
      const noSpace = clean.replace(/\s+/g, '');
      const snake = clean.toLowerCase().replace(/\s+/g, '_');
      const upper = clean.toUpperCase();
      setNewLabels(`${clean}, ${noSpace}, ${upper}, ${snake}`);
    }
  };

  const applyTemplate = (t: typeof PRESET_TEMPLATES[0]) => {
    setNewKey(t.key);
    setNewDisplay(t.display);
    setNewLabels(t.aliases);
  };

  return (
    <div className="bg-white border-2 border-[#024e4d] p-5 shadow-sm rounded-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#024e4d] text-white">
            <Plus size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add New Keka HR Column</h3>
            <p className="text-[11px] text-slate-500">Define a new employee data field and its recognized Excel header aliases.</p>
          </div>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* 1-Click Quick Templates */}
      <div className="mb-4 bg-slate-50 p-2.5 border border-slate-200">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1.5">
          <Sparkles size={13} className="text-[#024e4d]" />
          <span>Quick 1-Click Common Column Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-2.5 py-1 text-xs bg-white hover:bg-teal-50 border border-slate-300 hover:border-teal-600 text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              + {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Step Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs">
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            1. Display Label (UI Title) *
          </label>
          <input
            type="text"
            placeholder="e.g. PAN Number"
            className="w-full px-3 py-2 border border-slate-300 bg-white outline-none focus:border-[#024e4d] rounded-none text-xs font-semibold text-slate-900"
            value={newDisplay}
            onChange={(e) => handleDisplayChange(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1">What users will see on tables and reports.</p>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">
            2. Database Key (Auto-Generated) *
          </label>
          <input
            type="text"
            placeholder="e.g. pan_number"
            className="w-full px-3 py-2 border border-slate-300 bg-slate-50 outline-none focus:border-[#024e4d] rounded-none font-mono text-xs text-slate-800"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1">Internal unique key for PostgreSQL storage.</p>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">
            3. Excel Header Aliases (Comma Separated)
          </label>
          <input
            type="text"
            placeholder="e.g. PAN, PAN No, PAN_CARD, pan_no"
            className="w-full px-3 py-2 border border-slate-300 bg-white outline-none focus:border-[#024e4d] rounded-none text-xs font-mono text-slate-800"
            value={newLabels}
            onChange={(e) => setNewLabels(e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1">Recognizes uppercase, lowercase, and spacing variations.</p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <HelpCircle size={12} className="text-teal-700" />
          <span>New columns are automatically available across Master uploads and Keka Directory.</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={saving || !newKey.trim() || !newDisplay.trim()}
            onClick={onSave}
            className="px-4 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold rounded-none shadow-2xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={13} />
            <span>{saving ? 'Saving Column...' : 'Save & Enable Column'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
