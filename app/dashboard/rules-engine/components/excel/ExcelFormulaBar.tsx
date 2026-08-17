"use client";
import React from "react";
import { Calculator } from "lucide-react";
import { getColName } from "./useExcelSpreadsheet";
import { SelectedCellCoord } from "./types";

interface ExcelFormulaBarProps {
  selectedCell: SelectedCellCoord;
  formulaBarText: string;
  setFormulaBarText: (val: string) => void;
  onCommitFormula: (text: string) => void;
}

export function ExcelFormulaBar({
  selectedCell,
  formulaBarText,
  setFormulaBarText,
  onCommitFormula
}: ExcelFormulaBarProps) {
  const cellAddress = `${getColName(selectedCell.c)}${selectedCell.r + 1}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onCommitFormula(formulaBarText);
    }
  };

  return (
    <div className="border-b bg-slate-50 px-3 py-1.5 flex items-center gap-2 text-xs shrink-0 select-none shadow-2xs">
      {/* Active Cell Address Badge */}
      <div className="flex items-center gap-1 font-mono font-bold text-emerald-800 bg-white border border-slate-300 px-3 py-1 rounded shadow-2xs min-w-[55px] justify-center text-xs">
        {cellAddress}
      </div>

      {/* Formula fx Icon */}
      <div className="flex items-center gap-1 text-slate-500 font-serif italic text-sm px-1.5 border-r border-slate-300 pr-2.5">
        <Calculator className="h-3.5 w-3.5 text-emerald-600" />
        <span className="font-bold">fx</span>
      </div>

      {/* Formula & Cell Value Input Bar */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={formulaBarText}
          onChange={(e) => setFormulaBarText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => onCommitFormula(formulaBarText)}
          placeholder="Enter value or formula (e.g. =J2*(O2/100) or =IF(...))"
          className="w-full font-mono text-slate-800 bg-white border border-slate-300 px-3 py-1 rounded text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
        />
      </div>
    </div>
  );
}
