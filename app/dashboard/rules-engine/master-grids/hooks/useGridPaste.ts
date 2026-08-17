"use client";
import { useState } from 'react';
import { MasterGridData } from '../types';

export function useGridPaste(
  masterGrids: MasterGridData,
  setMasterGrids: React.Dispatch<React.SetStateAction<MasterGridData>>
) {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const handleGridPaste = (
    e: React.ClipboardEvent,
    startIdx: number,
    targetGrid: 'associateTenured' | 'associateVintage' | 'leadership' | 'specialExceptions'
  ) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (!text) return;
    const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim() !== '');
    if (!lines.length) return;

    const newGrid = [...(masterGrids[targetGrid] || [])];
    lines.forEach((line, lineOffset) => {
      const cells = line.split('\t').map(c => c.trim().replace(/,/g, '').replace(/%/g, ''));
      const targetRowIdx = startIdx + lineOffset;

      if (targetGrid === 'associateTenured') {
        const salaryCols = masterGrids.tenured_salary_ranges || [
          { key: 'under_16k' }, { key: 'between_16_18k' }, { key: 'between_18_24k' }
        ];
        const newRow = newGrid[targetRowIdx] || { target_collection: '' };
        if (cells[0] !== undefined) newRow.target_collection = cells[0];
        salaryCols.forEach((sc, cIdx) => {
          if (cells[cIdx + 1] !== undefined) newRow[sc.key] = cells[cIdx + 1];
        });
        newGrid[targetRowIdx] = newRow;
      } else if (targetGrid === 'associateVintage') {
        const newRow = newGrid[targetRowIdx] || { target_collection: '', m0: '', m1: '', m2: '', m3: '' };
        if (cells[0] !== undefined) newRow.target_collection = cells[0];
        if (cells[1] !== undefined) newRow.m0 = cells[1];
        if (cells[2] !== undefined) newRow.m1 = cells[2];
        if (cells[3] !== undefined) newRow.m2 = cells[3];
        if (cells[4] !== undefined) newRow.m3 = cells[4];
        newGrid[targetRowIdx] = newRow;
      } else if (targetGrid === 'leadership') {
        const newRow = newGrid[targetRowIdx] || { role: 'TL', target_collection: '', incentive_percentage: '' };
        if (cells[0] && ['TL', 'ATL', 'AM'].includes(cells[0].toUpperCase())) {
          newRow.role = cells[0].toUpperCase();
          if (cells[1] !== undefined) newRow.target_collection = cells[1];
          if (cells[2] !== undefined) newRow.incentive_percentage = cells[2];
        } else {
          if (cells[0] !== undefined) newRow.target_collection = cells[0];
          if (cells[1] !== undefined) newRow.incentive_percentage = cells[1];
        }
        newGrid[targetRowIdx] = newRow;
      } else if (targetGrid === 'specialExceptions') {
        const newRow = newGrid[targetRowIdx] || { target_collection: '', incentive_percentage: '' };
        if (cells[0] !== undefined) newRow.target_collection = cells[0];
        if (cells[1] !== undefined) newRow.incentive_percentage = cells[1];
        newGrid[targetRowIdx] = newRow;
      }
    });

    setMasterGrids(prev => ({ ...prev, [targetGrid]: newGrid }));
    setCopiedNotification(`Pasted ${lines.length} rows from Excel!`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return { copiedNotification, handleGridPaste };
}
