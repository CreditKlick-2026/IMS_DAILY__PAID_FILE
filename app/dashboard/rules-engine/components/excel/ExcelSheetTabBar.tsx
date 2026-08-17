"use client";
import React from "react";
import { Sheet } from "./types";

interface ExcelSheetTabBarProps {
  sheets: Sheet[];
  activeSheetIdx: number;
  onSelectSheet: (idx: number) => void;
}

export function ExcelSheetTabBar({
  sheets,
  activeSheetIdx,
  onSelectSheet
}: ExcelSheetTabBarProps) {
  return (
    <div className="border-t border-slate-300 bg-slate-100 flex items-center px-0 overflow-x-auto shrink-0 select-none h-8">
      <div className="flex h-full">
        {sheets.map((sheet, idx) => {
          const isActive = activeSheetIdx === idx;

          return (
            <button
              key={idx}
              onClick={() => onSelectSheet(idx)}
              className={`flex items-center px-4 h-full text-xs transition-colors border-r border-slate-300 whitespace-nowrap cursor-pointer rounded-none ${
                isActive
                  ? "bg-white text-emerald-950 font-bold border-b-2 border-b-emerald-600 shadow-2xs"
                  : "text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 font-medium"
              }`}
            >
              <span>{sheet.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
