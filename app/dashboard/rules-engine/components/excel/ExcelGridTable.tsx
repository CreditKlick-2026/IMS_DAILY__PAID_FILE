"use client";
import React, { useState } from "react";
import { CellValue, SelectedCellCoord } from "./types";
import { getColName } from "./useExcelSpreadsheet";

interface ExcelGridTableProps {
  grid: CellValue[][];
  maxC: number;
  selectedCell: SelectedCellCoord;
  setSelectedCell: (cell: SelectedCellCoord) => void;
  onUpdateCell: (r: number, c: number, value: string) => void;
  searchTerm: string;
}

export function ExcelGridTable({
  grid,
  maxC,
  selectedCell,
  setSelectedCell,
  onUpdateCell,
  searchTerm
}: ExcelGridTableProps) {
  const [editingCell, setEditingCell] = useState<SelectedCellCoord | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (r: number, c: number) => {
    setEditingCell({ r, c });
    const currentVal = grid[r] && grid[r][c] ? (grid[r][c].f || String(grid[r][c].v ?? "")) : "";
    setEditValue(currentVal);
  };

  const handleSaveEdit = (r: number, c: number) => {
    if (editingCell) {
      onUpdateCell(r, c, editValue);
      setEditingCell(null);
    }
  };

  const filteredRows = React.useMemo(() => {
    if (!grid.length) return [];
    const rows = grid.map((row, idx) => ({ row, originalIndex: idx }));
    if (!searchTerm.trim()) return rows;

    const term = searchTerm.toLowerCase().trim();
    return rows.filter(({ row, originalIndex }) => {
      if (originalIndex === 0) return true; // Always keep header
      return row.some((cell) => String(cell.v ?? "").toLowerCase().includes(term));
    });
  }, [grid, searchTerm]);

  return (
    <div className="flex-1 overflow-auto relative select-none font-sans text-xs bg-slate-50/20">
      <table className="border-collapse table-auto w-full min-w-max">
        {/* Column Alphabet Headers */}
        <thead className="sticky top-0 z-20 bg-slate-200 text-slate-700 shadow-2xs">
          <tr>
            <th className="w-12 px-2 py-1 bg-slate-300 border border-slate-300 text-center font-bold sticky left-0 z-30 text-[11px]">
              #
            </th>
            {Array.from({ length: maxC + 1 }).map((_, cIdx) => (
              <th
                key={cIdx}
                className="px-3 py-1 border border-slate-300 font-semibold text-center bg-slate-200 min-w-[130px] max-w-[260px] text-[11px]"
              >
                {getColName(cIdx)}
              </th>
            ))}
          </tr>
        </thead>

        {/* Data Rows */}
        <tbody className="divide-y divide-slate-200 bg-white">
          {filteredRows.map(({ row, originalIndex }) => {
            const isHeader = originalIndex === 0;
            return (
              <tr
                key={originalIndex}
                className={`${isHeader ? "bg-slate-100 font-bold sticky top-6 z-10 text-slate-900 border-b-2 border-slate-300" : "hover:bg-blue-50/40"}`}
              >
                {/* Row Number Header */}
                <td
                  className={`px-2 py-1 border border-slate-300 text-center text-slate-500 font-mono text-[11px] sticky left-0 z-10 ${
                    isHeader ? "bg-slate-200 font-bold" : "bg-slate-100"
                  }`}
                >
                  {originalIndex + 1}
                </td>

                {/* Cell Data */}
                {row.map((cell, cIdx) => {
                  const isSelected = selectedCell.r === originalIndex && selectedCell.c === cIdx;
                  const isCellEditing = editingCell?.r === originalIndex && editingCell?.c === cIdx;
                  const hasFormula = Boolean(cell?.f);
                  const isNumeric = typeof cell?.v === "number" || (!isNaN(Number(cell?.v)) && String(cell?.v).trim() !== "");

                  return (
                    <td
                      key={cIdx}
                      onClick={() => setSelectedCell({ r: originalIndex, c: cIdx })}
                      onDoubleClick={() => handleStartEdit(originalIndex, cIdx)}
                      className={`px-3 py-1.5 border border-slate-300 text-xs transition-colors cursor-cell relative ${
                        isSelected
                          ? "outline-2 outline-emerald-600 bg-emerald-50/60 z-10"
                          : ""
                      } ${isHeader ? "bg-slate-100 text-slate-900 font-bold" : ""} ${
                        isNumeric && !isHeader ? "text-right font-mono" : "text-left"
                      }`}
                      style={{
                        backgroundColor: isSelected ? undefined : cell?.bg || (isHeader ? "#f1f5f9" : undefined),
                        fontWeight: cell?.bl || isHeader ? "bold" : undefined
                      }}
                    >
                      {isCellEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(originalIndex, cIdx);
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                          onBlur={() => handleSaveEdit(originalIndex, cIdx)}
                          className="w-full bg-white border border-emerald-600 outline-none px-1 py-0.5 text-xs font-mono absolute inset-0 z-20 shadow-sm"
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">
                            {typeof cell?.v === "number" && !isHeader
                              ? cell.v.toLocaleString("en-IN")
                              : String(cell?.v ?? "")}
                          </span>
                          {hasFormula && (
                            <span className="text-[9px] text-emerald-700 font-mono font-bold bg-emerald-100 px-1 rounded">
                              fx
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredRows.length === 0 && (
        <div className="p-8 text-center text-slate-400 text-xs">No records found matching search term.</div>
      )}
    </div>
  );
}
