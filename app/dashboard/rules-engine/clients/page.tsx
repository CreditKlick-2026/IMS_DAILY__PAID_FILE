"use client";
import React from 'react';
import { ClientHeader } from './components/ClientHeader';
import { ClientTable } from './components/ClientTable';
import { AddClientModal } from './components/AddClientModal';
import { LocationMappingModal } from './components/LocationMappingModal';
import { ColumnConfigModal } from './components/ColumnConfigModal';
import { GridAssignModal } from './components/GridAssignModal';
import { ProductTypeModal } from './components/ProductTypeModal';
import { useClientsData } from './components/useClientsData';

export default function ClientsPage() {
  const d = useClientsData();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/40">
      <ClientHeader
        clientCount={d.clients.length}
        searchQuery={d.searchQuery}
        setSearchQuery={d.setSearchQuery}
        onOpenAddClient={() => d.setIsAddClientOpen(true)}
        onOpenAddProduct={() => d.setIsProductModalOpen(true)}
      />

      <ClientTable
        clients={d.clients}
        locations={d.locations}
        mappings={d.mappings}
        loading={d.loading}
        searchQuery={d.searchQuery}
        onOpenMapping={(client) => {
          const currentLocs = d.mappings.filter(m => m.client_id === client.id).map(m => m.location_id);
          d.setSelectedClientForLocation(client);
          d.setSelectedLocations(currentLocs);
        }}
        onOpenColumns={(client) => {
          const currentCols: string[] = client.required_columns 
            ? (Array.isArray(client.required_columns) ? client.required_columns : JSON.parse(client.required_columns || '[]'))
            : [];
          d.setConfiguringClient(client);
          d.setSelectedColumns(currentCols);
        }}
        onOpenGrid={(client) => {
          d.setAssigningGridClient(client);
          d.setSelectedGrid(client.assigned_grid || '');
        }}
        onDeleteClient={d.handleDeleteClient}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={d.isAddClientOpen}
        onClose={() => { d.setIsAddClientOpen(false); d.setNewName(''); d.setNewLocationIds([]); }}
        newName={d.newName}
        setNewName={d.setNewName}
        newProductType={d.newProductType}
        setNewProductType={d.setNewProductType}
        products={d.products}
        locations={d.locations}
        newLocationIds={d.newLocationIds}
        setNewLocationIds={d.setNewLocationIds}
        saving={d.saving}
        onSave={d.handleAddClient}
      />

      {/* Location Mapping Modal */}
      <LocationMappingModal
        client={d.selectedClientForLocation}
        onClose={() => d.setSelectedClientForLocation(null)}
        locations={d.locations}
        selectedLocations={d.selectedLocations}
        setSelectedLocations={d.setSelectedLocations}
        saving={d.saving}
        onSave={d.handleSaveLocationMapping}
      />

      {/* Column Config Modal */}
      <ColumnConfigModal
        client={d.configuringClient}
        onClose={() => d.setConfiguringClient(null)}
        masterColumns={d.masterColumns}
        selectedColumns={d.selectedColumns}
        setSelectedColumns={d.setSelectedColumns}
        onAddMasterColumn={d.handleAddMasterColumn}
        onDeleteMasterColumn={d.handleDeleteMasterColumn}
        saving={d.saving}
        onSave={d.handleSaveColumnConfig}
      />

      {/* Grid Assign Modal */}
      <GridAssignModal
        client={d.assigningGridClient}
        onClose={() => d.setAssigningGridClient(null)}
        selectedGrid={d.selectedGrid}
        setSelectedGrid={d.setSelectedGrid}
        saving={d.saving}
        onSave={d.handleSaveGrid}
        onUnassign={d.handleUnassignGrid}
      />

      {/* Product Type Modal */}
      <ProductTypeModal
        isOpen={d.isProductModalOpen}
        onClose={() => d.setIsProductModalOpen(false)}
        products={d.products}
        onAddProduct={d.handleAddProduct}
        onDeleteProduct={d.handleDeleteProduct}
        saving={d.saving}
      />
    </div>
  );
}
