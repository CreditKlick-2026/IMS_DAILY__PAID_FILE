"use client";
import React from 'react';
import { MasterGridData, SalaryRange } from '../types';
import { SalaryRangeEditor } from './SalaryRangeEditor';
import { MatrixTenuredRows } from './MatrixTenuredRows';
import { MatrixVintageRows } from './MatrixVintageRows';
import { MatrixLeadershipRows } from './MatrixLeadershipRows';
import { Plus } from 'lucide-react';

interface MatrixTableProps {
  activeTab: 'associateTenured' | 'associateVintage' | 'leadership' | 'specialExceptions';
  masterGrids: MasterGridData;
  setMasterGrids: React.Dispatch<React.SetStateAction<MasterGridData>>;
  masterGridsLoading: boolean;
  isSaving: boolean;
  showRangeEditor: boolean;
  setShowRangeEditor: (show: boolean) => void;
  onSaveGrid: (tab: string) => Promise<void>;
  onGridPaste: (e: React.ClipboardEvent, startIdx: number, tab: any) => void;
  onUpdateRange: (idx: number, field: string, value: any) => void;
  onSaveRanges: () => Promise<void>;
}

export function MatrixTable({
  activeTab,
  masterGrids,
  setMasterGrids,
  masterGridsLoading,
  isSaving,
  showRangeEditor,
  setShowRangeEditor,
  onSaveGrid,
  onGridPaste,
  onUpdateRange,
  onSaveRanges
}: MatrixTableProps) {
  const currentRows = (masterGrids[activeTab] || []) as any[];

  const handleAddRule = () => {
    const newGrids = { ...masterGrids };
    if (activeTab === 'associateTenured') {
      newGrids.associateTenured.push({ target_collection: '', under_16k: '', between_16_18k: '', between_18_24k: '', over_24k: '' });
    } else if (activeTab === 'associateVintage') {
      newGrids.associateVintage.push({ target_collection: '', m0: '', m1: '', m2: '', m3: '' });
    } else if (activeTab === 'leadership') {
      newGrids.leadership.push({ role: 'TL', target_collection: '', incentive_percentage: '' });
    } else if (activeTab === 'specialExceptions') {
      newGrids.specialExceptions.push({ target_collection: '', incentive_percentage: '' });
    }
    setMasterGrids(newGrids);
  };

  const handleRemoveRule = (idx: number) => {
    const newGrids = { ...masterGrids };
    (newGrids as any)[activeTab] = ((newGrids as any)[activeTab] as any[]).filter((_, i) => i !== idx);
    setMasterGrids(newGrids);
  };

  const handleUpdateCell = (rowIdx: number, field: string, value: any) => {
    const newGrids = { ...masterGrids };
    (newGrids as any)[activeTab][rowIdx][field] = value;
    setMasterGrids(newGrids);
  };

  const tenuredCols: SalaryRange[] = masterGrids.tenured_salary_ranges || [
    { key: 'under_16k', min: 0, max: 15999, label: '<16k (%)' },
    { key: 'between_16_18k', min: 16000, max: 18000, label: '16k-18k (%)' },
    { key: 'between_18_24k', min: 18001, max: 9999999, label: '>18k (%)' }
  ];

  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="bg-blue-50/80 px-4 py-2 border-b border-blue-200 text-[11px] text-blue-800 flex items-center justify-between">
        <span>💡 <strong>Excel Bulk Paste:</strong> Copy columns directly from Microsoft Excel and press <kbd className="bg-white px-1.5 py-0.5 border border-slate-300 font-mono">Ctrl + V</kbd> on any row!</span>
        <span className="text-blue-600 font-semibold text-[10px]">Auto-creates missing rows</span>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
          {activeTab === 'associateTenured' ? 'Tenured Logic Matrix' : 
           activeTab === 'associateVintage' ? 'Vintage Fixed Matrix' : 
           activeTab === 'specialExceptions' ? 'Special Exceptions Matrix' : 'Leadership Matrix'}
        </h3>
        <div className="flex gap-2">
          {activeTab === 'associateTenured' && (
            <button
              onClick={() => setShowRangeEditor(!showRangeEditor)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-none text-xs font-bold transition-colors cursor-pointer"
            >
              {showRangeEditor ? 'Close Config' : 'Configure Ranges'}
            </button>
          )}
          <button
            disabled={isSaving}
            onClick={() => onSaveGrid(activeTab)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-none text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Matrix'}
          </button>
        </div>
      </div>

      {activeTab === 'associateTenured' && showRangeEditor && (
        <SalaryRangeEditor
          ranges={tenuredCols}
          isSaving={isSaving}
          onUpdateRange={onUpdateRange}
          onSaveRanges={onSaveRanges}
        />
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
            <tr>
              <th className="px-4 py-2 w-12">#</th>
              {activeTab === 'leadership' && <th className="px-4 py-2 w-48">Role</th>}
              <th className="px-4 py-2">Collection Target (₹)</th>
              {activeTab === 'associateTenured' && tenuredCols.map(c => (
                <th key={c.key} className="px-4 py-2">{c.label}</th>
              ))}
              {activeTab === 'associateVintage' && ['M0', 'M1', 'M2', 'M3'].map(m => (
                <th key={m} className="px-4 py-2">{m} (₹ Fixed)</th>
              ))}
              {(activeTab === 'leadership' || activeTab === 'specialExceptions') && (
                <th className="px-4 py-2">Incentive %</th>
              )}
              <th className="px-4 py-2 text-right w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeTab === 'associateTenured' && (
              <MatrixTenuredRows
                rows={currentRows}
                tenuredCols={tenuredCols}
                onGridPaste={onGridPaste}
                onUpdateCell={handleUpdateCell}
                onRemoveRule={handleRemoveRule}
              />
            )}
            {activeTab === 'associateVintage' && (
              <MatrixVintageRows
                rows={currentRows}
                onGridPaste={onGridPaste}
                onUpdateCell={handleUpdateCell}
                onRemoveRule={handleRemoveRule}
              />
            )}
            {(activeTab === 'leadership' || activeTab === 'specialExceptions') && (
              <MatrixLeadershipRows
                rows={currentRows}
                isSpecial={activeTab === 'specialExceptions'}
                onGridPaste={onGridPaste}
                onUpdateCell={handleUpdateCell}
                onRemoveRule={handleRemoveRule}
              />
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
        <button
          onClick={handleAddRule}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-none shadow-2xs cursor-pointer"
        >
          <Plus size={14} /> Add Slab Row
        </button>
        <span className="text-[10px] text-slate-400 font-mono">
          {currentRows.length} Slabs Configured
        </span>
      </div>
    </div>
  );
}
