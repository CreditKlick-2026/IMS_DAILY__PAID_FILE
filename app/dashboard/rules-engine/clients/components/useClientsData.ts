"use client";
import { useState, useEffect } from 'react';

const postJson = (url: string, body: any) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export function useClientsData() {
  const [clients, setClients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [masterColumns, setMasterColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProductType, setNewProductType] = useState('Card');
  const [newLocationIds, setNewLocationIds] = useState<number[]>([]);
  const [selectedClientForLocation, setSelectedClientForLocation] = useState<any | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [configuringClient, setConfiguringClient] = useState<any | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [assigningGridClient, setAssigningGridClient] = useState<any | null>(null);
  const [selectedGrid, setSelectedGrid] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, lRes, mRes, pRes, colRes] = await Promise.all([
        fetch('/api/universal/clients'),
        fetch('/api/universal/locations'),
        fetch('/api/universal/client-location'),
        fetch('/api/universal/products'),
        fetch('/api/admin/columns')
      ]);
      const [cJ, lJ, mJ, pJ, colJ] = await Promise.all([cRes.json(), lRes.json(), mRes.json(), pRes.json(), colRes.json()]);
      if (cJ.success) setClients(cJ.data);
      if (lJ.success) setLocations(lJ.data);
      if (mJ.success) setMappings(mJ.data);
      if (colJ.success) setMasterColumns(colJ.data);
      if (pJ.success) {
        setProducts(pJ.data);
        if (pJ.data.length > 0 && !newProductType) setNewProductType(pJ.data[0].name);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddClient = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await postJson('/api/universal/clients', { name: newName.trim(), locationIds: newLocationIds, productType: newProductType });
      if (res.ok) { setNewName(''); setNewLocationIds([]); setIsAddClientOpen(false); fetchData(); }
    } finally { setSaving(false); }
  };

  const handleSaveLocationMapping = async () => {
    if (!selectedClientForLocation) return;
    setSaving(true);
    try {
      await postJson('/api/universal/client-location', { clientId: selectedClientForLocation.id, locationIds: selectedLocations });
      setSelectedClientForLocation(null); fetchData();
    } finally { setSaving(false); }
  };

  const handleSaveColumnConfig = async () => {
    if (!configuringClient) return;
    setSaving(true);
    try {
      await postJson('/api/universal/clients/columns', { clientId: configuringClient.id, requiredColumns: selectedColumns });
      setConfiguringClient(null); fetchData();
    } finally { setSaving(false); }
  };

  const handleAddMasterColumn = async (name: string) => {
    setSaving(true);
    try {
      const res = await postJson('/api/admin/columns', { key: name.toLowerCase().replace(/\s+/g, '_'), display: name });
      if (res.ok) fetchData();
    } finally { setSaving(false); }
  };

  const handleDeleteMasterColumn = async (key: string) => {
    if (!confirm(`Delete master column "${key}"?`)) return;
    await fetch(`/api/admin/columns?key=${key}`, { method: 'DELETE' });
    fetchData();
  };

  const handleSaveGrid = async () => {
    if (!assigningGridClient) return;
    setSaving(true);
    try {
      await postJson('/api/universal/clients/grid', { clientId: assigningGridClient.id, gridId: selectedGrid });
      setAssigningGridClient(null); fetchData();
    } finally { setSaving(false); }
  };

  const handleUnassignGrid = async () => {
    if (!assigningGridClient) return;
    setSaving(true);
    try {
      await postJson('/api/universal/clients/grid', { clientId: assigningGridClient.id, gridId: null });
      setAssigningGridClient(null); fetchData();
    } finally { setSaving(false); }
  };

  const handleAddProduct = async (name: string) => {
    setSaving(true);
    try {
      const res = await postJson('/api/universal/products', { name });
      if (res.ok) fetchData();
    } finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product type?')) return;
    await fetch(`/api/universal/products?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    await fetch(`/api/universal/clients?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  return {
    clients, locations, mappings, products, masterColumns, loading, saving, searchQuery, setSearchQuery,
    isAddClientOpen, setIsAddClientOpen, isProductModalOpen, setIsProductModalOpen,
    newName, setNewName, newProductType, setNewProductType, newLocationIds, setNewLocationIds,
    selectedClientForLocation, setSelectedClientForLocation, selectedLocations, setSelectedLocations,
    configuringClient, setConfiguringClient, selectedColumns, setSelectedColumns,
    assigningGridClient, setAssigningGridClient, selectedGrid, setSelectedGrid,
    fetchData, handleAddClient, handleSaveLocationMapping, handleSaveColumnConfig, handleAddMasterColumn,
    handleDeleteMasterColumn, handleSaveGrid, handleUnassignGrid, handleAddProduct, handleDeleteProduct, handleDeleteClient
  };
}
