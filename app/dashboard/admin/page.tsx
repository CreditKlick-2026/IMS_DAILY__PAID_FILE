"use client";
import React from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAdminData } from './components/useAdminData';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminDailyTracker } from './components/AdminDailyTracker';
import { AdminUploadedExcels } from './components/AdminUploadedExcels';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AddUserModal } from './components/AddUserModal';
import { AdminKekaUpload } from './components/AdminKekaUpload';
import { AdminKekaExcels } from './components/AdminKekaExcels';
import { AdminKekaColumnsTab } from './components/AdminKekaColumnsTab';

export default function AdminPage() {
  const { user } = useApp();
  const router = useRouter();
  const d = useAdminData();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center p-8 bg-white border border-slate-200 shadow-2xs max-w-sm rounded-none">
          <Shield size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1">Administrator clearance is required to view this panel.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (d.activeItem) {
      case 'tracker':
        return (
          <AdminDailyTracker
            filterLocation={d.filterLocation}
            setFilterLocation={d.setFilterLocation}
            locationOptions={d.locationOptions}
            filterClient={d.filterClient}
            setFilterClient={d.setFilterClient}
            clientOptions={d.clientOptions}
            filterProduct={d.filterProduct}
            setFilterProduct={d.setFilterProduct}
            trackerMonth={d.trackerMonth}
            setTrackerMonth={d.setTrackerMonth}
            trackerYear={d.trackerYear}
            setTrackerYear={d.setTrackerYear}
            trackerData={d.trackerData}
            trackerLoading={d.trackerLoading}
            onClearFilters={() => {
              d.setFilterLocation('');
              d.setFilterClient('');
              d.setFilterProduct('');
              d.setTrackerMonth(new Date().getMonth() + 1);
              d.setTrackerYear(new Date().getFullYear());
            }}
          />
        );
      case 'excels':
        return (
          <AdminUploadedExcels
            filterLocation={d.filterLocation}
            setFilterLocation={d.setFilterLocation}
            locationOptions={d.locationOptions}
            filterClient={d.filterClient}
            setFilterClient={d.setFilterClient}
            clientOptions={d.clientOptions}
            deleteMonth={d.deleteMonth}
            setDeleteMonth={d.setDeleteMonth}
            deleteYear={d.deleteYear}
            setDeleteYear={d.setDeleteYear}
            excels={d.excels}
            excelsLoading={d.excelsLoading}
            expandedUser={d.expandedUser}
            setExpandedUser={d.setExpandedUser}
            onDeleteExcel={d.handleDeleteExcel}
            onClearFilters={() => {
              d.setFilterLocation('');
              d.setFilterClient('');
              d.setDeleteMonth(new Date().getMonth() + 1);
              d.setDeleteYear(new Date().getFullYear());
            }}
          />
        );
      case 'users':
        return (
          <AdminUserManagement
            users={d.users}
            loading={d.loading}
            onOpenAddUser={() => d.setShowAddUserModal(true)}
            onEditPassword={d.handleEditPassword}
            onDeleteUser={d.handleDeleteUser}
          />
        );
      case 'keka':
        return (
          <AdminKekaUpload
            kekaMonth={d.kekaMonth}
            setKekaMonth={d.setKekaMonth}
            kekaYear={d.kekaYear}
            setKekaYear={d.setKekaYear}
            kekaColumns={d.kekaColumns}
            kekaFile={d.kekaFile}
            setKekaFile={d.setKekaFile}
            isValidatingKeka={d.isValidatingKeka}
            kekaValidationResult={d.kekaValidationResult}
            uploadingKeka={d.uploadingKeka}
            kekaMessage={d.kekaMessage}
            activeKekaJob={d.activeKekaJob}
            kekaProgressPercent={d.kekaProgressPercent}
            onValidateKekaFile={d.validateKekaFile}
            onKekaUpload={d.handleKekaUpload}
            onNavigateToColumns={() => d.setActiveItem('keka-columns')}
          />
        );
      case 'keka-columns':
        return <AdminKekaColumnsTab onColumnsUpdated={d.fetchKekaColumns} />;
      case 'keka-excels':
        return (
          <AdminKekaExcels
            excels={d.excels}
            excelsLoading={d.excelsLoading}
            onDeleteExcel={d.handleDeleteExcel}
            kekaMonth={d.kekaExcelMonth}
            setKekaMonth={d.setKekaExcelMonth}
            kekaYear={d.kekaExcelYear}
            setKekaYear={d.setKekaExcelYear}
            onClearFilters={() => {
              d.setKekaExcelMonth(new Date().getMonth() + 1);
              d.setKekaExcelYear(new Date().getFullYear());
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50/40 overflow-hidden">
      <AdminSidebar
        activeItem={d.activeItem}
        setActiveItem={d.setActiveItem}
        isOpen={d.isSidebarOpen}
        setIsOpen={d.setIsSidebarOpen}
      />

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      <AddUserModal
        isOpen={d.showAddUserModal}
        onClose={() => d.setShowAddUserModal(false)}
        newEmployeeId={d.newEmployeeId}
        setNewEmployeeId={d.setNewEmployeeId}
        newUsername={d.newUsername}
        setNewUsername={d.setNewUsername}
        newEmail={d.newEmail}
        setNewEmail={d.setNewEmail}
        newPassword={d.newPassword}
        setNewPassword={d.setNewPassword}
        newRole={d.newRole}
        setNewRole={d.setNewRole}
        newLocation={d.newLocation}
        setNewLocation={d.setNewLocation}
        locationOptions={d.locationOptions}
        isSubmitting={d.isSubmitting}
        onSubmit={d.handleAddUser}
      />
    </div>
  );
}
