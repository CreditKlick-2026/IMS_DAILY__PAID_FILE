"use client";
import React from 'react';

interface AddLocationCardProps {
  show: boolean;
  newName: string;
  setNewName: (n: string) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function AddLocationCard({
  show,
  newName,
  setNewName,
  saving,
  onSave,
  onCancel
}: AddLocationCardProps) {
  if (!show) return null;

  return (
    <div className="bg-blue-50/70 border border-blue-300 p-4 shadow-2xs animate-in fade-in duration-150 rounded-none">
      <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">Create New Operational Site</h3>
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          placeholder="Enter location name (e.g. Gurugram, Pune, Mumbai)..."
          className="flex-1 px-3 py-1.5 text-xs border border-blue-200 bg-white outline-none focus:border-blue-600 rounded-none font-semibold text-slate-800"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />
        <button
          disabled={saving || !newName.trim()}
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-bold rounded-none disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Site'}
        </button>
        <button
          onClick={onCancel}
          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 text-xs font-medium rounded-none transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
