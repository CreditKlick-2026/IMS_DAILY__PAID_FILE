"use client";
import React, { useMemo } from 'react';
import ExcelViewer from '../../components/ExcelViewer';
import { MasterGridData } from '../types';
import { buildExcelSheets } from './excelSheetsBuilder';
import { Sheet } from '../../components/excel/types';

interface ExcelLiveViewProps {
  excelDbData: any;
  masterGrids: MasterGridData;
  onRefresh?: () => void;
}

export function ExcelLiveView({ excelDbData, masterGrids, onRefresh }: ExcelLiveViewProps) {
  const sheets = useMemo(() => {
    return buildExcelSheets(excelDbData, masterGrids);
  }, [excelDbData, masterGrids]);

  const handleSaveSpreadsheet = async (sheetsState: Sheet[]) => {
    const tenuredCols = masterGrids.tenured_salary_ranges || [
      { key: 'under_16k', label: '<16k (%)' },
      { key: 'between_16_18k', label: '16k-18k (%)' },
      { key: 'between_18_24k', label: '18k-24k (%)' },
      { key: 'over_24k', label: '>24k (%)' }
    ];

    for (const sheet of sheetsState) {
      if (!sheet.celldata) continue;

      // Group cells by row
      const rowsMap = new Map<number, Map<number, any>>();
      sheet.celldata.forEach(cell => {
        if (!rowsMap.has(cell.r)) rowsMap.set(cell.r, new Map());
        const val = typeof cell.v === 'object' && cell.v !== null ? cell.v.v : cell.v;
        rowsMap.get(cell.r)!.set(cell.c, val);
      });

      if (sheet.name === "Associate Tenured") {
        const rows: any[] = [];
        const sortedRowKeys = Array.from(rowsMap.keys()).sort((a, b) => a - b);
        
        // Skip header row 0
        sortedRowKeys.forEach(r => {
          if (r === 0) return;
          const colMap = rowsMap.get(r)!;
          const target = parseFloat(colMap.get(0) || 0);
          if (target > 0) {
            const rowObj: any = { target_collection: target };
            tenuredCols.forEach((col, cIdx) => {
              rowObj[col.key] = String(colMap.get(cIdx + 1) ?? 0);
            });
            rows.push(rowObj);
          }
        });

        if (rows.length > 0) {
          await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName: 'associateTenured', data: rows })
          });
        }
      }

      if (sheet.name === "Associate Vintage") {
        const rows: any[] = [];
        const sortedRowKeys = Array.from(rowsMap.keys()).sort((a, b) => a - b);
        
        sortedRowKeys.forEach(r => {
          if (r === 0) return;
          const colMap = rowsMap.get(r)!;
          const target = parseFloat(colMap.get(0) || 0);
          if (target > 0) {
            rows.push({
              target_collection: target,
              m0: String(colMap.get(1) ?? 0),
              m1: String(colMap.get(2) ?? 0),
              m2: String(colMap.get(3) ?? 0),
              m3: String(colMap.get(4) ?? 0)
            });
          }
        });

        if (rows.length > 0) {
          await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName: 'associateVintage', data: rows })
          });
        }
      }

      if (sheet.name === "Leadership Matrix") {
        const rows: any[] = [];
        const sortedRowKeys = Array.from(rowsMap.keys()).sort((a, b) => a - b);
        
        sortedRowKeys.forEach(r => {
          if (r === 0) return;
          const colMap = rowsMap.get(r)!;
          const role = String(colMap.get(0) || 'TL');
          const target = parseFloat(colMap.get(1) || 0);
          const rate = parseFloat(colMap.get(2) || 0);
          if (target > 0) {
            rows.push({
              role,
              target_collection: target,
              incentive_percentage: rate
            });
          }
        });

        if (rows.length > 0) {
          await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName: 'leadership', data: rows })
          });
        }
      }

      if (sheet.name === "Special Exceptions") {
        const rows: any[] = [];
        const sortedRowKeys = Array.from(rowsMap.keys()).sort((a, b) => a - b);
        
        sortedRowKeys.forEach(r => {
          if (r === 0) return;
          const colMap = rowsMap.get(r)!;
          const target = parseFloat(colMap.get(0) || 0);
          const rate = parseFloat(colMap.get(1) || 0);
          if (target > 0) {
            rows.push({
              target_collection: target,
              incentive_percentage: rate
            });
          }
        });

        if (rows.length > 0) {
          await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName: 'specialExceptions', data: rows })
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-[750px] border border-slate-200 bg-white shadow-2xs overflow-hidden rounded-none">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider">Interactive Spreadsheet Engine</span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold font-mono rounded-none">
            ● Live Synchronized
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-none cursor-pointer"
          >
            ↻ Reload Formulas
          </button>
        )}
      </div>

      <div className="flex-1 relative">
        <ExcelViewer
          title="Master Grids Matrix"
          subtitle="Live Synchronized Calculation Studio"
          initialData={sheets}
          onSave={handleSaveSpreadsheet}
        />
      </div>
    </div>
  );
}
