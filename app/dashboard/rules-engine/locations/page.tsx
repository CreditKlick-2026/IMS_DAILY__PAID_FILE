"use client";
import React, { useState, useEffect } from 'react';
import { LocationHeader } from './components/LocationHeader';
import { AddLocationCard } from './components/AddLocationCard';
import { LocationTable } from './components/LocationTable';

export default function LocationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/universal/locations');
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/universal/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.ok) {
        setNewName('');
        setAddMode(false);
        fetchItems();
      } else {
        alert("Failed to add location");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding location");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      const res = await fetch(`/api/universal/locations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      } else {
        alert("Failed to delete location");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting location");
    }
  };

  const filteredItems = items.filter(i => i.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/40">
      <LocationHeader
        totalCount={items.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAdd={() => setAddMode(true)}
      />

      <AddLocationCard
        show={addMode}
        newName={newName}
        setNewName={setNewName}
        saving={saving}
        onSave={handleAdd}
        onCancel={() => { setAddMode(false); setNewName(''); }}
      />

      <LocationTable
        loading={loading}
        filteredItems={filteredItems}
        searchQuery={searchQuery}
        onDelete={handleDelete}
      />
    </div>
  );
}
