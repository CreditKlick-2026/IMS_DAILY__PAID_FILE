"use client";
import React, { useState, useCallback } from "react";
import { ExcelSpreadsheetProps } from "./excel/types";
import { useExcelSpreadsheet } from "./excel/useExcelSpreadsheet";
import { ExcelRibbonToolbar } from "./excel/ExcelRibbonToolbar";
import { ExcelFormulaBar } from "./excel/ExcelFormulaBar";
import { ExcelGridTable } from "./excel/ExcelGridTable";
import { ExcelSheetTabBar } from "./excel/ExcelSheetTabBar";
import { ExcelStatusBar } from "./excel/ExcelStatusBar";

export default function ExcelViewer({
  title,
  subtitle,
  initialData,
  onSave,
  hideBackButton
}: ExcelSpreadsheetProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    sheetsState,
    activeSheetIdx,
    setActiveSheetIdx,
    selectedCell,
    setSelectedCell,
    searchTerm,
    setSearchTerm,
    formulaBarText,
    setFormulaBarText,
    currentSheet,
    grid,
    maxR,
    maxC,
    updateCell,
    addRow,
    deleteRow
  } = useExcelSpreadsheet(initialData);

  // Commit formula from formula bar
  const handleCommitFormula = useCallback(
    (text: string) => {
      updateCell(selectedCell.r, selectedCell.c, text);
    },
    [selectedCell, updateCell]
  );

  // Export current sheet to CSV
  const handleExportCSV = useCallback(() => {
    if (!grid.length) return;
    const csvContent = grid
      .map((row) =>
        row
          .map((cell) => {
            const val = String(cell.v ?? "").replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${currentSheet?.name || "sheet"}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [grid, currentSheet]);

  // Save spreadsheet state
  const handleSaveSpreadsheet = async () => {
    if (!onSave) {
      alert("Save function not provided.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(sheetsState);
      alert("Spreadsheet formulas and matrix slabs updated successfully!");
    } catch {
      alert("An error occurred while saving spreadsheet.");
    }
    setIsSaving(false);
  };

  return (
    <div className="w-full space-y-2.5 h-[calc(100vh-1.5rem)] flex flex-col bg-slate-50/50 rounded-none">
      {/* Top Excel Ribbon Toolbar */}
      <ExcelRibbonToolbar
        title={title}
        subtitle={subtitle}
        isSaving={isSaving}
        hideBackButton={hideBackButton}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSave={handleSaveSpreadsheet}
        onExportCSV={handleExportCSV}
      />

      {/* Main Excel Sheet Workstation */}
      <div className="flex-1 flex flex-col overflow-hidden border border-slate-300 shadow-2xs bg-white rounded-none">
        {/* Formula Bar */}
        <ExcelFormulaBar
          selectedCell={selectedCell}
          formulaBarText={formulaBarText}
          setFormulaBarText={setFormulaBarText}
          onCommitFormula={handleCommitFormula}
        />

        {/* Data Grid Table */}
        <ExcelGridTable
          grid={grid}
          maxC={maxC}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
          onUpdateCell={updateCell}
          searchTerm={searchTerm}
        />

        {/* Bottom Multi-Sheet Tabs Bar */}
        <ExcelSheetTabBar
          sheets={sheetsState}
          activeSheetIdx={activeSheetIdx}
          onSelectSheet={(idx) => {
            setActiveSheetIdx(idx);
            setSelectedCell({ r: 1, c: 0 });
          }}
        />

        {/* Bottom Status Bar */}
        <ExcelStatusBar maxR={maxR} maxC={maxC} />
      </div>
    </div>
  );
}
