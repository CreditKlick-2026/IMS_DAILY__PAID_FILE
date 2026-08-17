"use client";
import React, { useState, useEffect } from 'react';
import { ProcessHeader } from './components/ProcessHeader';
import { AddProcessCard } from './components/AddProcessCard';
import { ProcessTable } from './components/ProcessTable';

export default function ProcessesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addMode, setAddMode] = useState(false);
  
  const [clientId, setClientId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [name, setName] = useState('');
  const [processHeadName, setProcessHeadName] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [procRes, cliRes, locRes] = await Promise.all([
        fetch('/api/universal/processes'),
        fetch('/api/universal/clients'),
        fetch('/api/universal/locations')
      ]);

      const procJson = await procRes.json();
      const cliJson = await cliRes.json();
      const locJson = await locRes.json();

      if (procJson.success) setItems(procJson.data);
      if (cliJson.success) setClients(cliJson.data);
      if (locJson.success) setLocations(locJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !clientId || !locationId) {
      alert("Please fill in all required fields (Client, Location, Process Name).");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch('/api/universal/processes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          client_id: clientId,
          location_id: locationId,
          name: name.trim(),
          process_head_name: processHeadName.trim()
        })
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        setName('');
        setProcessHeadName('');
        setAddMode(false);
        fetchData();
      } else {
        alert(json.error || "Failed to add process");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding process");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this process?')) return;
    try {
      const res = await fetch(`/api/universal/processes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete process");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting process");
    }
  };

  const filteredItems = items.filter(i => 
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.process_head_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/40">
      <ProcessHeader
        totalCount={items.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAdd={() => setAddMode(true)}
      />

      <AddProcessCard
        show={addMode}
        clientId={clientId}
        setClientId={setClientId}
        locationId={locationId}
        setLocationId={setLocationId}
        name={name}
        setName={setName}
        processHeadName={processHeadName}
        setProcessHeadName={setProcessHeadName}
        clients={clients}
        locations={locations}
        saving={saving}
        onSave={handleAdd}
        onCancel={() => setAddMode(false)}
      />

      <ProcessTable
        loading={loading}
        filteredItems={filteredItems}
        searchQuery={searchQuery}
        onDelete={handleDelete}
      />
    </div>
  );
}
