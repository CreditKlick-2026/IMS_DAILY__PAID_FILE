"use client";
import React, { useState } from 'react';
import { LeadsHeader } from './leads/LeadsHeader';
import { CustomerDashHeader } from './leads/CustomerDashHeader';
import { AdvancedFiltersBar } from './leads/AdvancedFiltersBar';
import { LeadsTable } from './leads/LeadsTable';
import { LeadsPagination } from './leads/LeadsPagination';
import { RecordFormModal } from './leads/RecordFormModal';
import { useLeadsData } from './leads/useLeadsData';

interface LeadsProps {
  duplicateOnly?: boolean;
}

export default function Leads({ duplicateOnly }: LeadsProps) {
  const d = useLeadsData(duplicateOnly);
  const [showRecordModal, setShowRecordModal] = useState<'add' | 'edit' | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90 select-none p-4 gap-3">
      <LeadsHeader
        duplicateOnly={duplicateOnly}
        userRole={d.user?.role}
        filterLocation={d.filterLocation}
        setFilterLocation={d.setFilterLocation}
        filterClient={d.filterClient}
        setFilterClient={d.setFilterClient}
        filterProduct={d.filterProduct}
        setFilterProduct={d.setFilterProduct}
        filterMonth={d.filterMonth}
        setFilterMonth={d.setFilterMonth}
        filterYear={d.filterYear}
        setFilterYear={d.setFilterYear}
        masterLocationsList={d.masterLocationsList}
        masterClientsList={d.masterClientsList}
        onApproveDuplicates={d.handleApproveDuplicates}
      />

      <CustomerDashHeader
        selectedLead={d.selectedLead}
        loading={d.loading}
        search={d.search}
        setSearch={d.setSearch}
        setFilterTab={d.setFilterTab}
        profileCols={d.tableCols.slice(0, 6)}
      />

      <AdvancedFiltersBar
        showFilters={d.showFilters}
        tableCols={d.tableCols}
        filterOptions={d.filterOptions}
        filters={d.filters}
        setFilters={d.setFilters}
        exportToExcel={d.handleExport}
        exporting={d.exporting}
        onOpenAddRecord={() => { setEditingRecord(null); setShowRecordModal('add'); }}
        onClearFilters={() => d.setFilters({ employee_code: [], product: [], bucket: [], location: [], aph: [], ph: [], client: [], tl_name: [], employee_name: [] })}
        userRole={d.user?.role}
      />

      {!d.filtersReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-white border border-slate-200/90 shadow-2xs">
          <p className="font-bold text-slate-800 text-sm mb-1">Filter Context Selection Required</p>
          <p className="text-xs text-slate-500">Please select Location, Client, and Product Type above to stream records.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
            <button
              onClick={() => d.setShowFilters(!d.showFilters)}
              className="px-3 py-1 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-none shadow-2xs cursor-pointer"
            >
              {d.showFilters ? '▲ Hide Filters' : '▼ Advanced Filters'}
            </button>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-none">
              {d.totalCount.toLocaleString('en-IN')} Records Found
            </span>
          </div>

          <LeadsTable
            leads={d.leads}
            tableCols={d.tableCols}
            loading={d.loading}
            selectedLead={d.selectedLead}
            setSelectedLead={d.setSelectedLead}
            duplicateOnly={duplicateOnly}
            userRole={d.user?.role}
            onEditRecord={(l) => { setEditingRecord(l); setShowRecordModal('edit'); }}
            onDeleteRecord={async (id) => {
              if (confirm('Delete this record?')) { await fetch(`/api/leads/${id}`, { method: 'DELETE' }); d.fetchLeads(); }
            }}
            onTransferRecord={async (id) => {
              if (confirm('Transfer to leads?')) { await fetch(`/api/leads/${id}/transfer`, { method: 'POST' }); d.fetchLeads(); }
            }}
          />

          <LeadsPagination
            page={d.page}
            setPage={d.setPage}
            totalCount={d.totalCount}
            limit={d.limit}
            setLimit={d.setLimit}
          />
        </div>
      )}

      {showRecordModal && (
        <RecordFormModal
          mode={showRecordModal}
          record={editingRecord}
          onClose={() => { setShowRecordModal(null); setEditingRecord(null); }}
          onSave={d.fetchLeads}
        />
      )}
    </div>
  );
}
