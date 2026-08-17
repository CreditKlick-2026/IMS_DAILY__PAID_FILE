"use client";
import React from 'react';
import { useAuditData } from './components/useAuditData';
import { AuditHeader } from './components/AuditHeader';
import { AuditTable } from './components/AuditTable';
import { AuditPagination } from './components/AuditPagination';
import { AuditDetailModal } from './components/AuditDetailModal';
import { Shield } from 'lucide-react';

export default function AuditPage() {
  const d = useAuditData();

  if (!d.user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 min-h-full">
        <div className="text-xs font-semibold text-slate-500 animate-pulse">Loading audit directory...</div>
      </div>
    );
  }

  if (d.user.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 min-h-full">
        <div className="text-center p-8 bg-white border border-slate-200 shadow-2xs max-w-sm rounded-none">
          <Shield size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1">Administrator clearance is required to view system audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto bg-slate-50/50 select-none p-4 md:p-6 space-y-4 min-h-full">
      {/* 1. Header Toolbar with KPIs, Filters, Search & Export */}
      <AuditHeader
        month={d.month}
        setMonth={d.setMonth}
        year={d.year}
        setYear={d.setYear}
        actionFilter={d.actionFilter}
        setActionFilter={d.setActionFilter}
        entityFilter={d.entityFilter}
        setEntityFilter={d.setEntityFilter}
        searchQuery={d.searchQuery}
        setSearchQuery={d.setSearchQuery}
        months={d.months}
        years={d.years}
        totalRecords={d.totalRecords}
        isDeleting={d.isDeleting}
        kpi={d.kpi}
        onDownloadExcel={d.handleDownloadExcel}
        onDeleteLogs={d.handleDeleteMonth}
        onResetFilters={d.handleResetFilters}
      />

      {/* 2. Audit Trail Log Table with Multi-Select & Actions */}
      <AuditTable
        logs={d.logs}
        loading={d.loading}
        selectedIds={d.selectedIds}
        onToggleSelectAll={d.handleToggleSelectAll}
        onToggleSelect={d.handleToggleSelect}
        onViewDetails={(log) => d.setActiveDetailLog(log)}
        onDeleteSingle={d.handleDeleteSingle}
        onDeleteBulk={d.handleDeleteBulk}
        isDeleting={d.isDeleting}
      />

      {/* 3. Audit Pagination */}
      <AuditPagination
        page={d.page}
        setPage={d.setPage}
        totalPages={d.totalPages}
      />

      {/* 4. Deep Forensic Payload Inspection Modal */}
      {d.activeDetailLog && (
        <AuditDetailModal
          log={d.activeDetailLog}
          onClose={() => d.setActiveDetailLog(null)}
          onDeleteSingle={d.handleDeleteSingle}
        />
      )}
    </div>
  );
}
