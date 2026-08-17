"use client";
import React from 'react';
import { ShieldCheck, Download, Trash2, Calendar, Search, Filter, RefreshCw } from 'lucide-react';

interface AuditHeaderProps {
  month: string;
  setMonth: (m: string) => void;
  year: string;
  setYear: (y: string) => void;
  actionFilter: string;
  setActionFilter: (a: string) => void;
  entityFilter: string;
  setEntityFilter: (e: string) => void;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  months: { v: string; l: string }[];
  years: string[];
  totalRecords: number;
  isDeleting: boolean;
  kpi: {
    totalEvents: number;
    uploadEvents: number;
    deleteEvents: number;
    securityEvents: number;
    kekaEvents: number;
  };
  onDownloadExcel: () => void;
  onDeleteLogs: () => void;
  onResetFilters: () => void;
}

export function AuditHeader({
  month,
  setMonth,
  year,
  setYear,
  actionFilter,
  setActionFilter,
  entityFilter,
  setEntityFilter,
  searchQuery,
  setSearchQuery,
  months,
  years,
  totalRecords,
  isDeleting,
  kpi,
  onDownloadExcel,
  onDeleteLogs,
  onResetFilters
}: AuditHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top Banner Toolbar */}
      <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#024e4d] text-white shrink-0 shadow-2xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">System Audit Trail & Report</h1>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
                {totalRecords} Events Logged
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deep forensic audit trail of database operations, file batches, headcount modifications, and access controls.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onDownloadExcel}
            disabled={totalRecords === 0}
            className="px-3.5 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <Download size={13} />
            <span>Export Detailed Report</span>
          </button>

          <button
            onClick={onDeleteLogs}
            disabled={isDeleting || totalRecords === 0}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 size={13} />
            <span>Purge Month Logs</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Period Events</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{kpi.totalEvents}</p>
        </div>
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">File Ingestions</p>
          <p className="text-xl font-bold font-mono text-teal-800 mt-0.5">{kpi.uploadEvents}</p>
        </div>
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Deletions & Purges</p>
          <p className="text-xl font-bold font-mono text-rose-600 mt-0.5">{kpi.deleteEvents}</p>
        </div>
        <div className="bg-white p-3 border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-400">Security & Users</p>
          <p className="text-xl font-bold font-mono text-amber-700 mt-0.5">{kpi.securityEvents}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 border border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Month Selector */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 px-2 py-1">
          <Calendar size={13} className="text-slate-400" />
          <select
            className="bg-transparent font-semibold outline-none cursor-pointer text-slate-700"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m.v} value={m.v}>{m.l}</option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <select
          className="px-2.5 py-1.5 font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Action Filter */}
        <select
          className="px-2.5 py-1.5 font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="ALL">All Actions</option>
          <option value="UPLOAD_EXCEL">File Uploads</option>
          <option value="DELETE_EXCEL">File Deletions</option>
          <option value="CREATE_USER">User Created</option>
          <option value="DELETE_USER">User Deleted</option>
          <option value="UPDATE_PASSWORD">Password Changes</option>
        </select>

        {/* Entity Filter */}
        <select
          className="px-2.5 py-1.5 font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 cursor-pointer text-slate-700"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="ALL">All Entities</option>
          <option value="EMPLOYEE_KEKA_DATA">Keka Headcount</option>
          <option value="EXCEL_BATCH">DPF Batches</option>
          <option value="USERS">User Accounts</option>
          <option value="RULE_ENGINE">Rules Engine</option>
        </select>

        {/* Search Bar */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by operator, emp ID, or payload details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 text-xs text-slate-800"
          />
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={onResetFilters}
          className="px-3 py-1.5 font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
