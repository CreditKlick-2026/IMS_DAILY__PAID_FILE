"use client";
import React from 'react';
import { useKekaMasterData } from './components/useKekaMasterData';
import { KekaMasterHeader } from './components/KekaMasterHeader';
import { KekaMasterFilters } from './components/KekaMasterFilters';
import { KekaMasterTable } from './components/KekaMasterTable';
import { KekaMasterPagination } from './components/KekaMasterPagination';
import { EditEmployeeModal } from './components/EditEmployeeModal';
import { Shield } from 'lucide-react';

export default function KekaMasterPage() {
  const d = useKekaMasterData();

  if (!d.user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90 min-h-full">
        <div className="text-xs font-semibold text-slate-500 animate-pulse">Loading employee directory...</div>
      </div>
    );
  }

  if (d.user.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90 min-h-full">
        <div className="text-center p-8 bg-white border border-slate-200 shadow-2xs max-w-sm rounded-none">
          <Shield size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1">Administrator clearance is required to view master employee records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90 select-none p-4 md:p-6 space-y-4 min-h-full">
      {/* 1. Header Toolbar */}
      <KekaMasterHeader
        totalCount={d.totalCount}
        onDownloadExcel={d.downloadExcel}
      />

      {/* 2. Month, Year, Search & Multi-facet Filters */}
      <KekaMasterFilters
        search={d.search}
        setSearch={d.setSearch}
        selectedMonth={d.selectedMonth}
        setSelectedMonth={d.setSelectedMonth}
        selectedYear={d.selectedYear}
        setSelectedYear={d.setSelectedYear}
        selectedDesig={d.selectedDesig}
        setSelectedDesig={d.setSelectedDesig}
        selectedLocation={d.selectedLocation}
        setSelectedLocation={d.setSelectedLocation}
        selectedClient={d.selectedClient}
        setSelectedClient={d.setSelectedClient}
        uniqueDesigs={d.uniqueDesigs}
        uniqueLocations={d.uniqueLocations}
        uniqueClients={d.uniqueClients}
      />

      {/* 3. Paginated Full Columns Table */}
      <KekaMasterTable
        paginatedData={d.paginatedData}
        loading={d.loading}
        page={d.page}
        pageSize={d.PAGE_SIZE}
        kekaColumns={d.kekaColumns}
        onEdit={(emp) => d.setEditingEmployee({ ...emp })}
        onDelete={d.handleDelete}
      />

      {/* 4. Pagination Controls */}
      <KekaMasterPagination
        page={d.page}
        setPage={d.setPage}
        totalPages={d.totalPages}
        totalCount={d.totalCount}
        pageSize={d.PAGE_SIZE}
        paginatedCount={d.paginatedData.length}
      />

      {/* 5. Full Edit Modal with Backend Master Locations & Clients */}
      <EditEmployeeModal
        editingEmployee={d.editingEmployee}
        setEditingEmployee={d.setEditingEmployee}
        saving={d.saving}
        onUpdate={d.handleUpdate}
        locations={d.uniqueLocations}
        clients={d.uniqueClients}
        kekaColumns={d.kekaColumns}
      />
    </div>
  );
}
