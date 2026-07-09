"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Search, Building2, MapPin } from 'lucide-react';

export default function ProcessesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [addMode, setAddMode] = useState(false);
  
  // Form state
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
    i.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto min-h-full">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Settings className="text-blue-600" /> Process Management
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl">
            Configure processes by mapping them to specific clients and operating locations.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search processes..."
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
            <Plus size={18} /> Add Process
          </button>
        </div>
      </div>

      {/* ADD PROCESS FORM */}
      {addMode && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Plus size={18} /> Add New Process
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Client</label>
              <select 
                className="w-full px-3 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Select Client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Location</label>
              <select 
                className="w-full px-3 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="">Select Location...</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Process Name</label>
              <input
                type="text"
                placeholder="e.g. Inbound Telesales"
                className="w-full px-3 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Process Head Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={processHeadName}
                onChange={(e) => setProcessHeadName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2 border-t border-blue-100">
            <button
              onClick={() => {
                setAddMode(false);
                setName('');
                setProcessHeadName('');
                setClientId('');
                setLocationId('');
              }}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2 rounded-md font-medium shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={saving || !name.trim() || !clientId || !locationId}
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Process'}
            </button>
          </div>
        </div>
      )}

      {/* PROCESSES LIST */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="px-5 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Available Processes</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {filteredItems.length} {filteredItems.length === 1 ? 'Process' : 'Processes'}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b">
              <tr>
                <th className="px-5 py-3 font-medium">Process Name</th>
                <th className="px-5 py-3 font-medium">Process Head</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading processes...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <Settings className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">No processes found</p>
                    <p className="text-sm mt-1">{searchQuery ? 'Try adjusting your search' : 'Click "Add Process" to create one.'}</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium">
                      {item.process_head_name || <span className="text-slate-400 italic">Not Assigned</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 size={14} className="text-slate-400" />
                        {item.client_name || <span className="text-slate-400 italic">Unknown</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {item.location_name || <span className="text-slate-400 italic">Unknown</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Process"
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
    </div>
  );
}
