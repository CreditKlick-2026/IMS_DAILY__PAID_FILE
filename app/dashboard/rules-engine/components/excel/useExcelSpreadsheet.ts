"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Sheet, CellValue, SelectedCellCoord } from "./types";

export function getColName(n: number) {
  let name = "";
  while (n >= 0) {
    name = String.fromCharCode(65 + (n % 26)) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
}

export function useExcelSpreadsheet(initialData?: Sheet[]) {
  const [sheetsState, setSheetsState] = useState<Sheet[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [selectedCell, setSelectedCell] = useState<SelectedCellCoord>({ r: 1, c: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formulaBarText, setFormulaBarText] = useState("");

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSheetsState(initialData);
    }
  }, [initialData]);

  const currentSheet = useMemo(() => {
    return sheetsState[activeSheetIdx] || sheetsState[0] || null;
  }, [activeSheetIdx, sheetsState]);

  // Construct 2D grid from celldata
  const { grid, maxR, maxC } = useMemo(() => {
    if (!currentSheet || !currentSheet.celldata) {
      return { grid: [] as CellValue[][], maxR: 0, maxC: 0 };
    }
    let mR = 0;
    let mC = 0;
    currentSheet.celldata.forEach((cell) => {
      if (cell.r > mR) mR = cell.r;
      if (cell.c > mC) mC = cell.c;
    });

    const matrix: CellValue[][] = Array.from({ length: mR + 1 }, () =>
      Array.from({ length: mC + 1 }, () => ({ v: "", m: "" }))
    );

    currentSheet.celldata.forEach((cell) => {
      if (matrix[cell.r] && matrix[cell.r][cell.c] !== undefined) {
        const valObj = typeof cell.v === 'object' && cell.v !== null ? cell.v : { v: cell.v, m: String(cell.v ?? "") };
        matrix[cell.r][cell.c] = {
          v: valObj.v ?? "",
          m: valObj.m ?? String(valObj.v ?? ""),
          f: valObj.f,
          bl: valObj.bl,
          bg: valObj.bg
        };
      }
    });

    return { grid: matrix, maxR: mR, maxC: mC };
  }, [currentSheet]);

  // Update formula bar text whenever selected cell changes
  useEffect(() => {
    if (grid[selectedCell.r] && grid[selectedCell.r][selectedCell.c]) {
      const cell = grid[selectedCell.r][selectedCell.c];
      setFormulaBarText(cell.f ? cell.f : String(cell.v ?? ""));
    } else {
      setFormulaBarText("");
    }
  }, [selectedCell, grid]);

  // Update Cell Value or Formula
  const updateCell = useCallback((r: number, c: number, valueOrFormula: string) => {
    setSheetsState((prev) => {
      const newSheets = [...prev];
      const sheet = { ...newSheets[activeSheetIdx] };
      if (!sheet || !sheet.celldata) return prev;

      const isFormula = valueOrFormula.startsWith("=");
      let numericVal: any = valueOrFormula;
      if (!isNaN(Number(valueOrFormula)) && valueOrFormula.trim() !== "") {
        numericVal = Number(valueOrFormula);
      }

      const existingIdx = sheet.celldata.findIndex((cell) => cell.r === r && cell.c === c);
      const newCellVal: CellValue = {
        v: isFormula ? numericVal : numericVal,
        m: String(numericVal),
        f: isFormula ? valueOrFormula : undefined
      };

      const newCellData = [...sheet.celldata];
      if (existingIdx >= 0) {
        newCellData[existingIdx] = { ...newCellData[existingIdx], v: newCellVal };
      } else {
        newCellData.push({ r, c, v: newCellVal });
      }

      sheet.celldata = newCellData;
      newSheets[activeSheetIdx] = sheet;
      return newSheets;
    });
  }, [activeSheetIdx]);

  // Add new row to current sheet
  const addRow = useCallback(() => {
    setSheetsState((prev) => {
      const newSheets = [...prev];
      const sheet = { ...newSheets[activeSheetIdx] };
      if (!sheet || !sheet.celldata) return prev;
      const nextR = maxR + 1;
      const newCells = [...sheet.celldata];
      for (let c = 0; c <= maxC; c++) {
        newCells.push({ r: nextR, c, v: { v: "", m: "" } });
      }
      sheet.celldata = newCells;
      newSheets[activeSheetIdx] = sheet;
      return newSheets;
    });
  }, [activeSheetIdx, maxR, maxC]);

  // Delete selected row from current sheet
  const deleteRow = useCallback((r: number) => {
    if (r === 0) return; // Protect header
    setSheetsState((prev) => {
      const newSheets = [...prev];
      const sheet = { ...newSheets[activeSheetIdx] };
      if (!sheet || !sheet.celldata) return prev;
      const newCells = sheet.celldata
        .filter((cell) => cell.r !== r)
        .map((cell) => (cell.r > r ? { ...cell, r: cell.r - 1 } : cell));
      sheet.celldata = newCells;
      newSheets[activeSheetIdx] = sheet;
      return newSheets;
    });
  }, [activeSheetIdx]);

  return {
    sheetsState,
    setSheetsState,
    activeSheetIdx,
    setActiveSheetIdx,
    selectedCell,
    setSelectedCell,
    searchTerm,
    setSearchTerm,
    isEditing,
    setIsEditing,
    formulaBarText,
    setFormulaBarText,
    currentSheet,
    grid,
    maxR,
    maxC,
    updateCell,
    addRow,
    deleteRow
  };
}
