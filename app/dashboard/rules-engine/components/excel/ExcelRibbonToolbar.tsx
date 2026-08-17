"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Save, ArrowLeft, Download, Search, 
  Database, Layers, ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface ExcelRibbonToolbarProps {
  title: string;
  subtitle: string;
  isSaving: boolean;
  hideBackButton?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSave: () => Promise<void>;
  onExportCSV: () => void;
  onAddRow?: () => void;
  onDeleteRow?: () => void;
  selectedRowIdx?: number;
}

export function ExcelRibbonToolbar({
  title,
  subtitle,
  isSaving,
  hideBackButton,
  searchTerm,
  setSearchTerm,
  onSave,
  onExportCSV
}: ExcelRibbonToolbarProps) {
  return (
    <div className="flex flex-col gap-2 shrink-0 bg-white p-3 border border-slate-200 shadow-2xs rounded-none">
      {/* Top Application Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b pb-2.5">
        <div className="flex items-center gap-3">
          {!hideBackButton && (
            <Link href="/dashboard/rules-engine">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-none">
                <ArrowLeft className="h-4 w-4 text-slate-700" />
              </Button>
            </Link>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-700" />
              <h1 className="text-sm md:text-base font-bold tracking-tight text-slate-900">{title}</h1>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-1.5 py-0.2 border border-slate-300 rounded-none flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in sheet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-slate-300 bg-slate-50 w-44 outline-none focus:border-slate-500 focus:bg-white rounded-none transition-colors"
            />
          </div>

          {/* Export */}
          <button
            onClick={onExportCSV}
            className="h-7 text-xs px-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 rounded-none shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" /> Export CSV
          </button>

          {/* Save to PostgreSQL */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="h-7 text-xs px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 rounded-none shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Software Ribbon Quick Actions / Formula Helpers */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 select-none overflow-x-auto">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <Layers className="h-3.5 w-3.5 text-slate-600" /> Real Excel Workspace Mode
          </span>
          <span className="text-slate-300">|</span>
          <span>Click any cell to edit in <strong>Formula Bar (fx)</strong></span>
          <span className="text-slate-300">|</span>
          <span>Double-click for inline editing</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-emerald-800 font-mono text-[10px] bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-none">
            ● PostgreSQL Live Connected
          </span>
        </div>
      </div>
    </div>
  );
}
