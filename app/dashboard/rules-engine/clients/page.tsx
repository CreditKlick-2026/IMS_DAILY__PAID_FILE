"use client";

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, MapPin, Building2, Columns } from 'lucide-react';

const INITIAL_COLUMNS = [];

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [addProductMode, setAddProductMode] = useState(false);
  const [addClientNameMode, setAddClientNameMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductType, setNewProductType] = useState('');
  const [newLocationIds, setNewLocationIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [savingMapping, setSavingMapping] = useState(false);

  const [masterColumns, setMasterColumns] = useState<any[]>([]);

  const [configuringClient, setConfiguringClient] = useState<any | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [savingColumns, setSavingColumns] = useState(false);
  const [newCustomColumn, setNewCustomColumn] = useState('');

  const [assigningGridClient, setAssigningGridClient] = useState<any | null>(null);
  const [selectedGrid, setSelectedGrid] = useState<string>('');
  const [savingGrid, setSavingGrid] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, locRes, mapRes, prodRes, colsRes] = await Promise.all([
        fetch('/api/universal/clients'),
        fetch('/api/universal/locations'),
        fetch('/api/universal/client-location'),
        fetch('/api/universal/products'),
        fetch('/api/admin/columns')
      ]);
      const clientsJson = await clientsRes.json();
      const locJson = await locRes.json();
      const mapJson = await mapRes.json();
      const prodJson = await prodRes.json();
      const colsJson = await colsRes.json();

      if (clientsJson.success) setClients(clientsJson.data);
      if (locJson.success) setLocations(locJson.data);
      if (mapJson.success) setMappings(mapJson.data);
      if (colsJson.success) setMasterColumns(colsJson.data);
      if (prodJson.success) {
        setProducts(prodJson.data);
        if (prodJson.data.length > 0 && !newProductType) {
          setNewProductType(prodJson.data[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClient = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/universal/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), locationIds: newLocationIds, productType: newProductType })
      });
      if (res.ok) {
        setNewName('');
        setNewProductType('Card');
        setNewLocationIds([]);
        setAddMode(false);
        fetchData();
      } else {
        alert("Failed to add client");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding client");
      } finally {
        setSaving(false);
      }
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/universal/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProductName.trim() })
      });
      if (res.ok) {
        setNewProductName('');
        setAddProductMode(false);
        fetchData();
      } else {
        alert("Failed to add product");
      }
    } catch (e) {
      console.error(e);
      alert("Error adding product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      const res = await fetch(`/api/universal/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert("Failed to delete client");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting client");
    }
  };

  const handleDeleteProduct = async () => {
    const selectedProd = products.find(p => p.name === newProductType);
    if (!selectedProd) return;
    if (!confirm(`Are you sure you want to delete the product type "${selectedProd.name}"?`)) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/universal/products?id=${selectedProd.id}`, { method: 'DELETE' });
      if (res.ok) {
        setNewProductType('');
        fetchData();
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting product");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveColumns = async () => {
    if (!configuringClient) return;
    setSavingColumns(true);
    try {
      const res = await fetch('/api/universal/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: configuringClient.id, required_columns: selectedColumns })
      });
      if (res.ok) {
        setConfiguringClient(null);
        fetchData();
      } else {
        alert("Failed to save columns");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving columns");
    } finally {
      setSavingColumns(false);
    }
  };

  const handleSaveMapping = async () => {
    if (!selectedClient) return;
    setSavingMapping(true);
    try {
      const res = await fetch('/api/universal/client-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient.id, locationIds: selectedLocations })
      });
      if (res.ok) {
        setSelectedClient(null);
        fetchData();
      } else {
        alert("Failed to save mapping");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving mapping");
    } finally {
      setSavingMapping(false);
    }
  };

  const handleUnassignGrid = async () => {
    if (!assigningGridClient) return;
    setSavingGrid(true);
    try {
      const res = await fetch('/api/universal/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assigningGridClient.id, assigned_grid: null })
      });
      if (res.ok) {
        setClients(clients.map(c => c.id === assigningGridClient.id ? { ...c, assigned_grid: null } : c));
        setAssigningGridClient(null);
      }
    } catch (e) {
      alert("Error unassigning grid.");
    } finally {
      setSavingGrid(false);
    }
  };

  const handleSaveGrid = async () => {
    if (!assigningGridClient) return;

    if (selectedGrid === 'grid_1') {
      let reqCols: string[] = [];
      if (typeof assigningGridClient.required_columns === 'string') {
        try { reqCols = JSON.parse(assigningGridClient.required_columns); } catch(e) {}
      } else if (Array.isArray(assigningGridClient.required_columns)) {
        reqCols = assigningGridClient.required_columns;
      }

      try {
        const gridRes = await fetch('/api/admin/master-grids');
        const gridData = await gridRes.json();
        const colMap = gridData.data?.column_mappings || {};
        
        // We only validate columns that come from the Daily Paid File (DPF).
        // Salary, DOJ, and Designation come from the KEKA master file, so they are not validated here.
        const reqCollection = colMap.collection || 'total_money_collected';
        const reqEmpCode = colMap.employee_code || 'employee_code';
        const reqEmpName = colMap.employee_name || 'employee_name';

        const missing = [];
        
        // Also allow 'money_collected' as a fallback since many clients use it
        if (!reqCols.includes(reqCollection) && !reqCols.includes('money_collected')) {
            missing.push(reqCollection);
        }
        
        if (!reqCols.includes(reqEmpCode) && !reqCols.includes(reqEmpName) && !reqCols.includes('Employee_Code')) {
            missing.push(reqEmpCode + " or " + reqEmpName);
        }

        if (missing.length > 0) {
          alert(`⚠️ Cannot assign Master Grid 1. This client's DPF configuration is missing required columns:\n\n${missing.join('\n')}\n\nPlease configure these in 'Client Columns' first.`);
          return;
        }
      } catch (err) {
        console.error("Failed to validate grid requirements", err);
      }
    }

    setSavingGrid(true);
    try {
      const res = await fetch('/api/universal/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assigningGridClient.id, assigned_grid: selectedGrid })
      });
      if (res.ok) {
        setAssigningGridClient(null);
        fetchData();
      } else {
        alert("Failed to save grid");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving grid");
    } finally {
      setSavingGrid(false);
    }
  };

  const toggleLocation = (locId: number) => {
    setSelectedLocations(prev => 
      prev.includes(locId) ? prev.filter(id => id !== locId) : [...prev, locId]
    );
  };

  const openMappingModal = (client: any) => {
    setSelectedClient(client);
    const clientMap = mappings.filter(m => m.client_id === client.id).map(m => m.location_id);
    setSelectedLocations(clientMap);
  };

  const openGridModal = (client: any) => {
    setAssigningGridClient(client);
    setSelectedGrid(client.assigned_grid || '');
  };

  const openColumnModal = (client: any) => {
    setConfiguringClient(client);
    if (client.required_columns && Array.isArray(client.required_columns)) {
      setSelectedColumns(client.required_columns);
    } else {
      setSelectedColumns(masterColumns.map(c => c.key));
    }
  };

  const toggleColumn = (colKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(colKey) ? prev.filter(k => k !== colKey) : [...prev, colKey]
    );
  };

  const handleAddMasterColumn = async (colName: string) => {
    const key = colName.toLowerCase().replace(/\s+/g, '_');
    // If it already exists, just toggle it on
    if (masterColumns.find(c => c.key === key)) {
      if (!selectedColumns.includes(key)) setSelectedColumns([...selectedColumns, key]);
      return;
    }
    const newCol = { key, display: colName, labels: [colName, key, colName.toUpperCase()] };
    const newMasterColumns = [...masterColumns, newCol];
    try {
      await fetch('/api/admin/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: newMasterColumns })
      });
      setMasterColumns(newMasterColumns);
      setSelectedColumns([...selectedColumns, key]);
    } catch(e) {}
  };

  const handleDeleteMasterColumn = async (key: string) => {
    if (!confirm('Are you sure you want to delete this global column? It will be removed from all clients.')) return;
    const newMasterColumns = masterColumns.filter(c => c.key !== key);
    try {
      await fetch('/api/admin/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: newMasterColumns })
      });
      setMasterColumns(newMasterColumns);
      setSelectedColumns(prev => prev.filter(k => k !== key));
    } catch(e) {}
  };

  const filteredClients = clients.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto min-h-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Building2 className="text-blue-600" /> Clients Management
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl">
            Add clients and distribute them by assigning operating locations.
          </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white/50 backdrop-blur-sm"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>

            <button
              onClick={() => setAddMode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Add Client
            </button>
          </div>
        </div>

        {/* ADD CLIENT FORM */}
        {addMode && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
            <h3 className="font-semibold text-blue-900 mb-4 border-b border-blue-100 pb-2">Add New Client</h3>
            
            {addClientNameMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 shadow-sm">
                <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Plus size={16} /> Create New Client Name
                </h4>
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-blue-800 mb-1">Client Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. SBI Recovery..."
                      className="w-full px-4 py-2 border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      disabled={!newName.trim()}
                      onClick={() => setAddClientNameMode(false)}
                      className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm disabled:opacity-50 transition-colors"
                    >
                      Confirm Name
                    </button>
                    <button
                      onClick={() => { setAddClientNameMode(false); setNewName(''); }}
                      className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {addProductMode && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-5 shadow-sm">
                <h4 className="text-sm font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <Plus size={16} /> Create New Product Type
                </h4>
                <div className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-emerald-800 mb-1">Product Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Education Loan..."
                      className="w-full px-4 py-2 border border-emerald-200 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      disabled={saving || !newProductName.trim()}
                      onClick={handleAddProduct}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium shadow-sm disabled:opacity-50 transition-colors"
                    >
                      Save Product
                    </button>
                    <button
                      onClick={() => { setAddProductMode(false); setNewProductName(''); }}
                      className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-blue-900">Client Name</label>
                  {!addClientNameMode && (
                    <button
                      type="button"
                      onClick={() => { setAddClientNameMode(true); setNewName(''); }}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Add New Client
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                  >
                    <option value="">-- Select Existing Client --</option>
                    {newName && !clients.some(c => c.name === newName) && (
                      <option value={newName}>{newName} (New)</option>
                    )}
                    {Array.from(new Set(clients.map(c => c.name))).sort().map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-blue-900">Product Type</label>
                  {!addProductMode && (
                    <button
                      type="button"
                      onClick={() => setAddProductMode(true)}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Add New Product
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={newProductType}
                    onChange={(e) => setNewProductType(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                  >
                    {products.length === 0 && <option value="Card">Credit Card</option>}
                    {products.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  {products.length > 0 && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleDeleteProduct}
                      className="p-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 shadow-sm"
                      title="Delete selected product"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {locations.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-blue-900">Assign to Locations:</span>
                <div className="flex flex-wrap gap-2">
                  {locations.map(loc => (
                    <label 
                      key={loc.id} 
                      className={`flex items-center gap-2 px-3 py-1.5 border rounded-md cursor-pointer text-sm transition-colors ${
                        newLocationIds.includes(loc.id) ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={newLocationIds.includes(loc.id)}
                        onChange={() => {
                          setNewLocationIds(prev => 
                            prev.includes(loc.id) ? prev.filter(id => id !== loc.id) : [...prev, loc.id]
                          )
                        }}
                      />
                      {loc.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-5 border-t border-blue-100 mt-5">
              <button
                onClick={() => {
                  setAddMode(false);
                  setNewName('');
                  setNewLocationIds([]);
                  setAddProductMode(false);
                  setAddClientNameMode(false);
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2 rounded-lg font-medium shadow-sm transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={saving || !newName.trim()}
                onClick={handleAddClient}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Client'}
              </button>
            </div>
          </div>
        )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="px-5 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Available Clients</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
          </span>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-slate-500 border-b">
            <tr>
              <th className="px-5 py-3 font-medium w-16">ID</th>
              <th className="px-5 py-3 font-medium">Client Name</th>
              <th className="px-5 py-3 font-medium">Assigned Locations</th>
              <th className="px-5 py-3 font-medium">Required Columns</th>
              <th className="px-5 py-3 font-medium">Assigned Grid</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading clients...
                  </div>
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                  <Building2 className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                  <p className="text-base font-medium text-slate-900">No clients found</p>
                  <p className="text-sm mt-1">{searchQuery ? 'Try adjusting your search' : 'Click "Add Client" to create one.'}</p>
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const clientLocations = mappings.filter(m => m.client_id === client.id);
                return (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-4 text-slate-500 font-medium">#{client.id}</td>
                    <td className="p-4 font-semibold text-slate-800">
                      {client.name}
                      {client.product_type && (
                        <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {client.product_type}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {clientLocations.length > 0 ? (
                          clientLocations.map(cl => (
                            <span key={cl.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-md border border-blue-100">
                              <MapPin size={12} />
                              {cl.location_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">No locations assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(() => {
                           let reqCols: string[] = [];
                           if (typeof client.required_columns === 'string') {
                             try { reqCols = JSON.parse(client.required_columns); } catch(e) {}
                           } else if (Array.isArray(client.required_columns)) {
                             reqCols = client.required_columns;
                           }
                           
                           if (reqCols.length === 0) {
                             return <span className="text-slate-400 text-xs italic">None</span>;
                           }
                           
                           return reqCols.map((col: string) => {
                             const disp = masterColumns.find(m => m.key === col)?.display || col;
                             return (
                               <span key={col} className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[10px] font-medium px-1.5 py-0.5 rounded border border-emerald-100">
                                 {disp}
                               </span>
                             );
                           });
                        })()}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {client.assigned_grid ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-md border border-blue-100">
                          {client.assigned_grid === 'grid_1' ? 'Master Grid 1' : client.assigned_grid}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => openGridModal(client)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1 border border-transparent hover:border-blue-100"
                        >
                          <Columns size={14} /> Assign Grid
                        </button>
                        <button
                          onClick={() => openColumnModal(client)}
                          className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1 border border-transparent hover:border-emerald-100"
                        >
                          <Columns size={14} /> Configure Columns
                        </button>
                        <button
                          onClick={() => openMappingModal(client)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1 border border-transparent hover:border-blue-100"
                        >
                          <MapPin size={14} /> Assign Locations
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ASSIGN LOCATIONS MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-blue-600" size={18} />
                Assign Locations to {selectedClient.name}
              </h3>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {locations.length === 0 ? (
                <p className="text-slate-500 text-center py-4 text-sm">No locations available. Please add locations first.</p>
              ) : (
                <div className="space-y-3">
                  {locations.map(loc => {
                    const isSelected = selectedLocations.includes(loc.id);
                    return (
                      <label 
                        key={loc.id} 
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          checked={isSelected}
                          onChange={() => toggleLocation(loc.id)}
                        />
                        <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                          {loc.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                disabled={savingMapping}
                onClick={handleSaveMapping}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm disabled:opacity-50"
              >
                {savingMapping ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURE COLUMNS MODAL */}
      {configuringClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Columns className="text-emerald-600" size={18} />
                Configure Columns for {configuringClient.name}
              </h3>
              <button onClick={() => setConfiguringClient(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-800">Configure Required Columns</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Select the standard columns that MUST be present when uploading excel files for this client. 
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2">
                {masterColumns.map(col => {
                  const isSelected = selectedColumns.includes(col.key);
                  return (
                    <div key={col.key} className={`flex items-center justify-between gap-3 p-3 border rounded-lg transition-colors ${isSelected ? 'bg-emerald-50 border-emerald-200' : 'hover:bg-slate-50 border-slate-200'}`}>
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          checked={isSelected}
                          onChange={() => toggleColumn(col.key)}
                        />
                        <span className={`font-medium text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                          {col.display}
                        </span>
                      </label>
                      <button onClick={() => handleDeleteMasterColumn(col.key)} className="text-blue-400 hover:text-blue-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type new column name..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  value={newCustomColumn}
                  onChange={(e) => setNewCustomColumn(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCustomColumn.trim()) {
                      handleAddMasterColumn(newCustomColumn.trim());
                      setNewCustomColumn('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newCustomColumn.trim()) {
                      handleAddMasterColumn(newCustomColumn.trim());
                      setNewCustomColumn('');
                    }
                  }}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-2 rounded-md font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  <Plus size={16} /> Add Column
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setConfiguringClient(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                disabled={savingColumns}
                onClick={handleSaveColumns}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors font-medium text-sm disabled:opacity-50"
              >
                {savingColumns ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN GRID MODAL */}
      {assigningGridClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Columns className="text-blue-600" size={18} />
                Assign Grid Logic
              </h3>
              <button onClick={() => setAssigningGridClient(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Select which calculation logic to apply for <strong>{assigningGridClient.name}</strong>.
              </p>
              
              <label className="block text-sm font-semibold text-slate-700 mb-2">Calculation Grid</label>
              <select
                value={selectedGrid}
                onChange={(e) => setSelectedGrid(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="">-- No Grid Assigned --</option>
                <option value="grid_1">Master Grid 1</option>
                <option value="grid_2">Master Grid 2</option>
                <option value="grid_3">Master Grid 3</option>
                <option value="grid_4">Master Grid 4</option>
                <option value="grid_5">Master Grid 5</option>
                <option value="grid_6">Master Grid 6</option>
                <option value="grid_7">Master Grid 7</option>
                <option value="grid_8">Master Grid 8</option>
              </select>
            </div>
            
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center gap-3">
              <button
                onClick={() => setAssigningGridClient(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-md transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <button
                  disabled={savingGrid || !assigningGridClient?.assigned_grid}
                  onClick={handleUnassignGrid}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-md transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Unassign Grid
                </button>
                <button
                  disabled={savingGrid || !selectedGrid}
                  onClick={handleSaveGrid}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingGrid ? 'Assigning...' : 'Assign Grid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
