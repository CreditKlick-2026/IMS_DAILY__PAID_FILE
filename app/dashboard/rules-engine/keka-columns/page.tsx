"use client";

import React, { useState, useEffect } from 'react';
import { Columns, Plus, Trash2, Save, X, Edit3 } from 'lucide-react';

export default function KekaColumnsPage() {
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [addMode, setAddMode] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDisplay, setNewDisplay] = useState('');
  const [newLabels, setNewLabels] = useState('');
  
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDisplay, setEditDisplay] = useState('');
  const [editLabels, setEditLabels] = useState('');

  const [locationOptions, setLocationOptions] = useState<{id: number, name: string}[]>([]);
  const [clientOptions, setClientOptions] = useState<any[]>([]);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Core columns that should not be deleted or have their key changed
  const coreKeys = ['location', 'employee_id', 'name', 'designation', 'agent_ohr', 'doj', 'doc', 'salary', 'tl_name', 'am_name'];

  useEffect(() => {
    fetch('/api/public/locations').then(r => r.json()).then(d => { if (d.success) setLocationOptions(d.data); });
  }, []);

  useEffect(() => {
    let url = '/api/universal/clients';
    if (selectedLocation && locationOptions.length > 0) {
      const loc = locationOptions.find(l => String(l.id) === String(selectedLocation));
      if (loc) {
        url += `?location_id=${loc.id}`;
      }
    }
    fetch(url).then(r => r.json()).then(d => {
      if (d.success) {
        setClientOptions(d.data);
        if (!d.data.find((p: any) => p.name === selectedClient)) {
          setSelectedClient('');
        }
      }
    });
  }, [selectedLocation, locationOptions]);

  const fetchColumns = async () => {
    if (!selectedLocation || !selectedClient || !selectedProduct) {
      setColumns([]);
      return;
    }
    const clientObj = clientOptions.find(c => c.name === selectedClient && c.product_type === selectedProduct);
    if (!clientObj) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/keka-columns?location_id=${selectedLocation}&client_id=${clientObj.id}&product_type=${selectedProduct}`);
      const json = await res.json();
      if (json.success) {
        setColumns(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [selectedLocation, selectedClient, selectedProduct]);

  const saveToServer = async (newCols: any[]) => {
    const clientObj = clientOptions.find(c => c.name === selectedClient && c.product_type === selectedProduct);
    if (!clientObj) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/keka-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          columns: newCols,
          location_id: selectedLocation,
          client_id: clientObj.id,
          product_type: selectedProduct
        })
      });
      if (res.ok) {
        setColumns(newCols);
        setAddMode(false);
        setEditingKey(null);
        setNewKey('');
        setNewDisplay('');
        setNewLabels('');
      } else {
        alert("Failed to save columns");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving columns");
    } finally {
      setSaving(false);
    }
  };

  const handleAddColumn = () => {
    if (!newKey.trim() || !newDisplay.trim() || !newLabels.trim()) return;
    const formattedKey = newKey.trim().toLowerCase().replace(/\s+/g, '_');
    if (columns.find(c => c.key === formattedKey)) {
      alert("A column with this key already exists!");
      return;
    }
    
    const labelsArr = newLabels.split(',').map(l => l.trim()).filter(l => l);
    if (!labelsArr.includes(newDisplay.trim())) {
        labelsArr.push(newDisplay.trim());
    }

    const newCol = {
      key: formattedKey,
      display: newDisplay.trim(),
      labels: labelsArr
    };

    saveToServer([...columns, newCol]);
  };

  const handleUpdateColumn = () => {
    if (!editDisplay.trim() || !editLabels.trim()) return;
    
    const labelsArr = editLabels.split(',').map(l => l.trim()).filter(l => l);
    if (!labelsArr.includes(editDisplay.trim())) {
        labelsArr.push(editDisplay.trim());
    }

    const updatedCols = columns.map(c => 
      c.key === editingKey ? { ...c, display: editDisplay.trim(), labels: labelsArr } : c
    );

    saveToServer(updatedCols);
  };

  const handleDeleteColumn = (key: string) => {
    if (coreKeys.includes(key)) {
      alert("Cannot delete core system columns.");
      return;
    }
    if (!confirm('Are you sure you want to delete this Keka column? It will no longer be extracted from uploaded files.')) return;
    
    const updatedCols = columns.filter(c => c.key !== key);
    saveToServer(updatedCols);
  };

  const startEdit = (col: any) => {
    setEditingKey(col.key);
    setEditDisplay(col.display);
    setEditLabels(col.labels.join(', '));
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Columns className="text-blue-600" /> Keka Columns
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl">
            Manage the expected columns for Keka file uploads. You can define aliases (labels) so the system automatically recognizes variations of the same column.
          </p>
        </div>
        
        <button
          disabled={!selectedLocation || !selectedClient || !selectedProduct}
          onClick={() => { setAddMode(true); setEditingKey(null); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Plus size={16} /> Add Custom Column
        </button>
      </div>

      {/* Context Selection Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
          <select 
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setSelectedClient('');
              setSelectedProduct('');
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Select Location</option>
            {locationOptions.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Client</label>
          <select 
            value={selectedClient}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedClient(val);
              const matchingClients = clientOptions.filter(c => c.name === val);
              if (matchingClients.length === 1 && matchingClients[0].product_type) {
                setSelectedProduct(matchingClients[0].product_type);
              } else {
                setSelectedProduct('');
              }
            }}
            disabled={!selectedLocation}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">Select Client</option>
            {Array.from(new Set(clientOptions.map((c: any) => c.name))).sort().map(name => (
              <option key={name as string} value={name as string}>{name as string}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Product</label>
          <select 
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={!selectedClient}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">Select Product</option>
            {clientOptions.filter(c => c.name === selectedClient).map(p => (
              <option key={p.id} value={p.product_type}>{p.product_type}</option>
            ))}
          </select>
        </div>
      </div>

      {addMode && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-semibold text-blue-900 mb-4 border-b border-blue-100 pb-2 flex items-center gap-2">
             <Plus size={16} /> Add New Keka Column
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-blue-800 mb-1">Key (Internal Name)</label>
              <input
                type="text"
                placeholder="e.g. department"
                className="w-full px-3 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-800 mb-1">Display Name</label>
              <input
                type="text"
                placeholder="e.g. Department"
                className="w-full px-3 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                value={newDisplay}
                onChange={(e) => setNewDisplay(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-800 mb-1">Expected Headers (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Dept, Department Name, dept"
                className="w-full px-3 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                value={newLabels}
                onChange={(e) => setNewLabels(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setAddMode(false)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={saving || !newKey.trim() || !newDisplay.trim() || !newLabels.trim()}
              onClick={handleAddColumn}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Column'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-slate-500 border-b">
            <tr>
              <th className="px-4 py-2 text-xs font-medium">Display Name</th>
              <th className="px-4 py-2 text-xs font-medium">Internal Key</th>
              <th className="px-4 py-2 text-xs font-medium">Expected Headers (Aliases)</th>
              <th className="px-4 py-2 text-xs font-medium">Type</th>
              <th className="px-4 py-2 text-xs font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading columns...</td>
              </tr>
            ) : columns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No columns found.</td>
              </tr>
            ) : (
              columns.map((col) => {
                const isEditing = editingKey === col.key;
                const isCore = coreKeys.includes(col.key);

                if (isEditing) {
                  return (
                    <tr key={col.key} className="bg-blue-50/30">
                      <td className="px-4 py-2 text-xs">
                        <input
                          type="text"
                          value={editDisplay}
                          onChange={(e) => setEditDisplay(e.target.value)}
                          className="w-full px-2 py-1.5 border border-blue-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 font-mono text-xs">{col.key}</td>
                      <td className="px-4 py-2 text-xs">
                        <input
                          type="text"
                          value={editLabels}
                          onChange={(e) => setEditLabels(e.target.value)}
                          className="w-full px-2 py-1.5 border border-blue-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Comma separated aliases..."
                        />
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${isCore ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isCore ? 'Core' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={saving}
                            onClick={handleUpdateColumn}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-2 py-1.5 rounded-md transition-colors text-xs font-medium shadow-sm flex items-center gap-1"
                          >
                            <Save size={14} /> Save
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors text-xs font-medium shadow-sm flex items-center gap-1"
                          >
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={col.key} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-3 font-semibold text-slate-800">{col.display}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{col.key}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {col.labels.map((l: string, i: number) => (
                          <span key={i} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200">
                            {l}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${isCore ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isCore ? 'Core' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(col)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1 border border-transparent hover:border-blue-100"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        {!isCore && (
                          <button
                            onClick={() => handleDeleteColumn(col.key)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                            title="Delete Column"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
