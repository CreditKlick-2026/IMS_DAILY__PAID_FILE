"use client";
import React from 'react';
import { UploadHeader } from './components/UploadHeader';
import { UploadContextFilters } from './components/UploadContextFilters';
import { UploadDateTimerBar } from './components/UploadDateTimerBar';
import { UploadDropzone } from './components/UploadDropzone';
import { UploadValidationSidebar } from './components/UploadValidationSidebar';
import { UploadProgressCard } from './components/UploadProgressCard';
import { UploadValidationView } from './components/UploadValidationView';
import { useUploadData } from './components/useUploadData';
import { Upload, Loader2, ArrowRight } from 'lucide-react';

export default function UploadPage() {
  const d = useUploadData();

  return (
    <div className="flex flex-col flex-1 h-full overflow-y-auto bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90 select-none p-4 md:p-6 space-y-4">
      {/* Cockpit Header */}
      <UploadHeader
        globalDate={d.globalDate}
        countdown={d.countdown}
      />

      {/* Context Selection Filters */}
      <UploadContextFilters
        userRole={d.user?.role}
        selectedLocation={d.selectedLocation}
        setSelectedLocation={d.setSelectedLocation}
        locationsList={d.locationsList}
        selectedClientName={d.selectedClientName}
        setSelectedClientName={d.setSelectedClientName}
        clientsList={d.clientsList}
        selectedProductType={d.selectedProductType}
        setSelectedProductType={d.setSelectedProductType}
        targetEmployeeId={d.targetEmployeeId}
        setTargetEmployeeId={d.setTargetEmployeeId}
        usersList={d.usersList}
      />

      {/* Target File Date Selection */}
      <UploadDateTimerBar
        dateOptions={d.dateOptions}
        selectedDate={d.selectedDate}
        setSelectedDate={d.setSelectedDate}
        userRole={d.user?.role}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Side: Upload Zone & Actions */}
        <div className="flex-1 w-full space-y-4">
          <UploadDropzone
            file={d.file}
            setFile={d.setFile}
            isDragOver={d.isDragOver}
            setIsDragOver={d.setIsDragOver}
            needsPassword={d.needsPassword}
            filePassword={d.filePassword}
            setFilePassword={d.setFilePassword}
            onValidatePassword={d.validateFile}
            fileInputRef={d.fileInputRef}
            onReset={() => {}}
          />

          {/* Active Job Progress */}
          <UploadProgressCard
            activeJob={d.activeJob}
            progressPercent={d.progressPercent}
          />

          {/* Action Message Alert */}
          {d.message && (
            <div className={`p-3 text-xs border rounded-none font-semibold ${
              d.message.includes('Error') || d.message.includes('failed')
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-teal-50 border-teal-200 text-teal-800'
            }`}>
              {d.message}
            </div>
          )}

          {/* Submit Ingestion Button */}
          {d.file && (
            <button
              disabled={d.uploading || !d.validationResult?.isValid}
              onClick={d.handleUpload}
              className="w-full py-3 bg-[#024e4d] hover:bg-[#036261] text-white font-bold text-xs rounded-none shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {d.uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Ingestion in Worker...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Ingest & Process Collection File</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}

          {/* Validated Rows Inspector */}
          {d.validatedData && (
            <UploadValidationView
              validatedData={d.validatedData}
              validationView={d.validationView}
              setValidationView={d.setValidationView}
            />
          )}
        </div>

        {/* Right Side: Schema Verification Checklist */}
        <UploadValidationSidebar
          selectedClient={d.selectedClient}
          activeHeaders={d.activeHeaders}
          isValidating={d.isValidating}
          validationResult={d.validationResult}
        />
      </div>
    </div>
  );
}
