"use client";
import React, { useState } from 'react';
import { X, Columns, Plus, Trash2 } from 'lucide-react';

interface ColumnConfigModalProps {
  client: any | null;
  onClose: () => void;
  masterColumns: any[];
  selectedColumns: string[];
  setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>;
  onAddMasterColumn: (name: string) => Promise<void>;
  onDeleteMasterColumn: (key: string) => Promise<void>;
  saving: boolean;
  onSave: () => Promise<void>;
}

export function ColumnConfigModal({
  client,
  onClose,
  masterColumns,
  selectedColumns,
  setSelectedColumns,
  onAddMasterColumn,
  onDeleteMasterColumn,
  saving,
  onSave
}: ColumnConfigModalProps) {
  const [newCustomCol, setNewCustomCol] = useState('');

  if (!client) return null;

  const toggleColumn = (colKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(colKey) ? prev.filter(k => k !== colKey) : [...prev, colKey]
    );
  };

  const handleCreateCol = async () => {
    if (!newCustomCol.trim()) return;
    await onAddMasterColumn(newCustomCol.trim());
    setNewCustomCol('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col rounded-none max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Configure DPF Columns: {client.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto">
          <p className="text-slate-500">
            Select the required column headers that Daily Paid Files (DPF) for <strong>{client.name}</strong> must contain during ingestion:
          </p>

          {/* Add Custom Column Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom column (e.g. Penalty, Late_Fee)..."
              className="flex-1 px-3 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 text-xs rounded-none"
              value={newCustomCol}
              onChange={(e) => setNewCustomCol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCol()}
            />
            <button
              onClick={handleCreateCol}
              className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 text-xs font-bold rounded-none flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} /> Add Column
            </button>
          </div>

          {/* Columns Selector Grid */}
          <div className="grid grid-cols-2 gap-2 border border-slate-200 p-3 bg-slate-50/50 max-h-60 overflow-y-auto">
            {masterColumns.map((col) => {
              const isChecked = selectedColumns.includes(col.key);
              return (
                <div
                  key={col.key}
                  className={`flex items-center justify-between p-2 border transition-colors ${
                    isChecked ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded-none text-blue-600"
                    />
                    <span className="truncate font-mono text-[11px]">{col.display || col.key}</span>
                  </label>
                  <button
                    onClick={() => onDeleteMasterColumn(col.key)}
                    className="text-slate-300 hover:text-red-600 p-0.5 cursor-pointer"
                    title="Delete column globally"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedColumns.length} of {masterColumns.length} Columns Selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={onSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
