"use client";
import React, { useState } from 'react';
import { useMasterGrids } from './hooks/useMasterGrids';
import { CockpitHeader } from './components/CockpitHeader';
import { ColumnMappingModal } from './components/ColumnMappingModal';
import { ExcelLiveView } from './components/ExcelLiveView';

export default function MasterGridsPage() {
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);

  // Custom Hook
  const {
    masterGrids,
    excelDbData
  } = useMasterGrids();

  return (
    <div className="flex flex-col gap-3 p-3 md:p-5 w-full min-h-full relative bg-slate-100/60">
      {/* Top Cockpit Status Header */}
      <CockpitHeader
        dpfCount={excelDbData?.dpfRecords?.length || 3495}
        kekaCount={excelDbData?.kekaEmployees?.length || 198}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
      />

      {/* Database Schema & Column Links Modal */}
      <ColumnMappingModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        columnMappings={masterGrids.column_mappings}
      />

      {/* Direct Excel Live Workspace View */}
      <ExcelLiveView excelDbData={excelDbData} masterGrids={masterGrids} />
    </div>
  );
}
