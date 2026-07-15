"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Search, X } from 'lucide-react';

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
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <MapPin className="text-blue-600" /> Locations Management
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl">
            Add, edit, or remove operating locations used across the rules engine.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search locations..."
              className="pl-9 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500/50 w-64 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          </div>
          <button
            onClick={() => setAddMode(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Location
          </button>
        </div>
      </div>

      {/* ADD LOCATION INLINE FORM */}
      {addMode && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-semibold text-blue-900 mb-3">Add New Location</h3>
          <div className="flex gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Enter location name (e.g. Gurugram, Pune)..."
              className="flex-1 px-4 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              disabled={saving || !newName.trim()}
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Location'}
            </button>
            <button
              onClick={() => {
                setAddMode(false);
                setNewName('');
              }}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-md font-medium shadow-sm transition-colors flex items-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* LOCATIONS LIST */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Available Locations</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {filteredItems.length} {filteredItems.length === 1 ? 'Location' : 'Locations'}
          </span>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-slate-500 border-b">
            <tr>
              <th className="px-4 py-2 text-xs font-medium w-16">ID</th>
              <th className="px-4 py-2 text-xs font-medium">Location Name</th>
              <th className="px-4 py-2 text-xs font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading locations...
                  </div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-slate-500">
                  <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                  <p className="text-base font-medium text-slate-900">No locations found</p>
                  <p className="text-sm mt-1">{searchQuery ? 'Try adjusting your search' : 'Click "Add Location" to create one.'}</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-4 py-2 text-xs text-slate-500 font-medium">#{item.id}</td>
                  <td className="px-4 py-2 text-xs">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                  </td>
                  <td className="px-4 py-2 text-xs text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Location"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
