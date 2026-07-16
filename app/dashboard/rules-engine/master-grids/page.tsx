"use client";
import React, { useState, useEffect } from 'react';

export default function MasterGridsPage() {
  const [activeMasterGridTab, setActiveMasterGridTab] = useState('associateTenured');
  const [masterGrids, setMasterGrids] = useState<{
    associateTenured: any[];
    associateVintage: any[];
    leadership: any[];
    specialExceptions: any[];
    grid1_mapping?: { locations: string[], clients: string[], products: string[] };
    column_mappings?: {
        collection: string,
        salary: string,
        doj: string,
        designation: string,
        tl_name: string,
        am_name: string,
        employee_code: string,
        employee_name: string
    };
    tenured_salary_ranges?: { key: string, min: number, max: number, label: string }[];
  }>({ associateTenured: [], associateVintage: [], leadership: [], specialExceptions: [], grid1_mapping: { locations: [], clients: [], products: [] }, column_mappings: { collection: 'total_money_collected', salary: 'ctc', doj: 'date_of_joining', designation: 'job_title', tl_name: 'tl_name', am_name: 'am_name', employee_code: 'employee_code', employee_name: 'employee_name' }, tenured_salary_ranges: [] });
  const [masterGridsLoading, setMasterGridsLoading] = useState(false);
  const [isSavingMasterGrid, setIsSavingMasterGrid] = useState(false);

  useEffect(() => {
    fetchMasterGrids();
  }, []);

  const fetchMasterGrids = () => {
    setMasterGridsLoading(true);
    fetch(`/api/admin/master-grids`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setMasterGrids(d.data);
        setMasterGridsLoading(false);
      })
      .catch(() => setMasterGridsLoading(false));
  };



  const [showRangeEditor, setShowRangeEditor] = useState(false);

  const updateSalaryRange = (idx: number, field: string, value: any) => {
      const newRanges = [...(masterGrids.tenured_salary_ranges || [])];
      if (!newRanges[idx]) return;
      (newRanges[idx] as any)[field] = field === 'min' || field === 'max' ? Number(value) : value;
      setMasterGrids(prev => ({ ...prev, tenured_salary_ranges: newRanges }));
  };

  const saveSalaryRanges = async () => {
    setIsSavingMasterGrid(true);
    try {
        const res = await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName: 'tenured_salary_ranges', data: masterGrids.tenured_salary_ranges })
        });
        const data = await res.json();
        if (!data.success) {
            alert('Failed to save ranges');
        } else {
            alert('Salary ranges updated successfully!');
            setShowRangeEditor(false);
        }
    } catch (e) {
        alert('Error saving ranges');
    } finally {
        setIsSavingMasterGrid(false);
    }
  };

  const updateColMapping = (field: string, val: string) => {
    const newMappings = { ...(masterGrids.column_mappings || {}) };
    (newMappings as any)[field] = val;
    setMasterGrids(prev => ({ ...prev, column_mappings: newMappings as any }));
  };
  const updateMapping = (field: 'locations' | 'clients' | 'products', val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    setMasterGrids(prev => ({
      ...prev,
      grid1_mapping: {
        ...(prev.grid1_mapping || { locations: [], clients: [], products: [] }),
        [field]: arr
      }
    }));
  };



  const handleSaveMasterGrid = async (gridName: string) => {
    setIsSavingMasterGrid(true);
    try {
        await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName: 'grid1_mapping', data: masterGrids.grid1_mapping })
        });
        await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName: 'column_mappings', data: masterGrids.column_mappings })
        });
        const dataToSave = JSON.parse(JSON.stringify(masterGrids[gridName as keyof typeof masterGrids]));
        if (gridName === 'associateTenured' || gridName === 'associateVintage') {
            dataToSave.forEach((row: any) => {
                row.over_24k = row.between_18_24k;
            });
        }
        const res = await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName, data: dataToSave })
        });
        const data = await res.json();
        if (!data.success) {
            alert('Failed to save grid');
        } else {
            alert('Grid updated successfully!');
        }
    } catch (e) {
        alert('Error saving grid');
    } finally {
        setIsSavingMasterGrid(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full relative">
      <div className="flex justify-between items-center">
      </div>


      {/* Grid Configuration Section */}
      <div className="rounded-xl border bg-white shadow-sm overflow-visible flex flex-col p-5 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-800">Grid Configuration (Target & Column Mapping)</h3>
            <p className="text-xs text-slate-500">Specify filter values and column mappings required for the rules engine calculation.</p>
          </div>

        </div>
        



        <h4 className="text-sm font-bold text-slate-700 mb-3 border-b pb-1 flex items-center gap-2">
          Calculation Column Mappings
          <span className="text-xs font-normal text-slate-400">(Shows column names used in backend calculation)</span>
        </h4>

        {/* DPF Columns */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            From Daily Paid File (DPF)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Collection Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.collection || ''}
                />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee Code Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.employee_code || ''}
                />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee Name Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.employee_name || ''}
                />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">TL Name Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.tl_name || ''}
                />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">AM Name Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.am_name || ''}
                />
            </div>
          </div>
        </div>

        {/* Keka Columns */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            From Keka Master File
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Salary Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.salary || ''}
                />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">DOJ Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.doj || ''}
                />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Designation Col</label>
              <input type="text" readOnly className="w-full border rounded-md px-3 py-1.5 text-sm bg-slate-50 outline-none text-slate-500 cursor-not-allowed"
                value={masterGrids.column_mappings?.designation || ''}
                />
            </div>
          </div>
        </div>


      </div>

      <div className="flex gap-4 border-b mt-4">
        {['associateTenured', 'associateVintage', 'leadership', 'specialExceptions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveMasterGridTab(tab)}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeMasterGridTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'associateTenured' ? 'Associate Tenured (>3M)' : 
             tab === 'associateVintage' ? 'Associate Vintage (0-3M)' : 
             tab === 'specialExceptions' ? 'Special Exceptions (>=3.5L)' : 'Leadership (TL/ATL/AM)'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">
            {activeMasterGridTab === 'associateTenured' ? 'Tenured Logic Matrix' : 
             activeMasterGridTab === 'associateVintage' ? 'Vintage Fixed Matrix' : 
             activeMasterGridTab === 'specialExceptions' ? 'Special Exceptions Matrix' : 'Leadership Matrix'}
          </h3>
          <div className="flex gap-2">
              {activeMasterGridTab === 'associateTenured' && (
                  <button 
                      onClick={() => setShowRangeEditor(!showRangeEditor)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-1.5 rounded-md text-sm font-bold transition-colors"
                  >
                      {showRangeEditor ? 'Close Config' : 'Configure Ranges'}
                  </button>
              )}
              <button 
                  disabled={isSavingMasterGrid}
                  onClick={() => handleSaveMasterGrid(activeMasterGridTab)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors"
              >
                  {isSavingMasterGrid ? 'Saving...' : 'Save Grid'}
              </button>
          </div>
        </div>
        
        {activeMasterGridTab === 'associateTenured' && showRangeEditor && (
            <div className="bg-blue-50 border-b p-4">
                <h4 className="font-bold text-blue-900 mb-3 text-sm">Configure Salary Ranges</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {(masterGrids.tenured_salary_ranges || []).map((range, idx) => (
                        <div key={range.key} className="bg-white p-3 rounded border text-sm">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Column Label</label>
                            <input 
                                type="text" 
                                value={range.label} 
                                onChange={e => updateSalaryRange(idx, 'label', e.target.value)}
                                className="w-full border rounded px-2 py-1 mb-2 outline-none focus:border-blue-500" 
                            />
                            
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Min Salary (₹)</label>
                            <input 
                                type="number" 
                                value={range.min} 
                                onChange={e => updateSalaryRange(idx, 'min', e.target.value)}
                                className="w-full border rounded px-2 py-1 mb-2 outline-none focus:border-blue-500" 
                            />
                            
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Max Salary (₹)</label>
                            <input 
                                type="number" 
                                value={range.max} 
                                onChange={e => updateSalaryRange(idx, 'max', e.target.value)}
                                className="w-full border rounded px-2 py-1 outline-none focus:border-blue-500" 
                            />
                        </div>
                    ))}
                </div>
                <button onClick={saveSalaryRanges} disabled={isSavingMasterGrid} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-bold">
                    Save Ranges
                </button>
            </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b sticky top-0 z-10">
              <tr>
                {activeMasterGridTab === 'leadership' && <th className="px-4 py-3 font-medium">Role</th>}
                <th className="px-4 py-3 font-medium">Target Collection (₹)</th>
                {activeMasterGridTab === 'associateTenured' && (masterGrids.tenured_salary_ranges || [
                    { key: 'under_16k', label: '<16k (%)' },
                    { key: 'between_16_18k', label: '16k-18k (%)' },
                    { key: 'between_18_24k', label: '>18k (%)' }
                ]).map((r) => (
                    <th key={r.key} className="px-4 py-3 font-medium">{r.label}</th>
                ))}
                {activeMasterGridTab === 'associateVintage' && (
                  <>
                    <th className="px-4 py-3 font-medium">Month 0 (₹)</th>
                    <th className="px-4 py-3 font-medium">Month 1 (₹)</th>
                    <th className="px-4 py-3 font-medium">Month 2 (₹)</th>
                    <th className="px-4 py-3 font-medium">Month 3 (₹)</th>
                  </>
                )}
                {activeMasterGridTab === 'leadership' && (
                  <th className="px-4 py-3 font-medium">Incentive (%)</th>
                )}
                {activeMasterGridTab === 'specialExceptions' && (
                  <th className="px-4 py-3 font-medium">Incentive (%)</th>
                )}
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
                {masterGridsLoading ? (
                    <tr><td colSpan={10} className="px-4 py-6 text-center text-slate-400">Loading Grid...</td></tr>
                ) : (
                    (masterGrids[activeMasterGridTab as keyof typeof masterGrids] as any[])?.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                            {activeMasterGridTab === 'leadership' && (
                              <td className="px-4 py-2">
                                  <select
                                      value={row.role || ''}
                                      onChange={(e) => {
                                          const newGrids = { ...masterGrids };
                                          (newGrids[activeMasterGridTab as keyof typeof masterGrids] as any[])[idx].role = e.target.value;
                                          setMasterGrids(newGrids);
                                      }}
                                      className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
                                  >
                                      <option value="TL">TL</option>
                                      <option value="ATL">ATL</option>
                                      <option value="AM">AM</option>
                                  </select>
                              </td>
                            )}
                            <td className="px-4 py-2">
                                <input 
                                    type="number" 
                                    value={row.target_collection} 
                                    onChange={(e) => {
                                        const newGrids = { ...masterGrids };
                                        (newGrids[activeMasterGridTab as keyof typeof masterGrids] as any[])[idx].target_collection = e.target.value;
                                        setMasterGrids(newGrids);
                                    }}
                                    className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
                                />
                            </td>
                            {activeMasterGridTab === 'associateTenured' && (
                              <>
                                {(masterGrids.tenured_salary_ranges || [
                    { key: 'under_16k', label: '<16k (%)' },
                    { key: 'between_16_18k', label: '16k-18k (%)' },
                    { key: 'between_18_24k', label: '>18k (%)' }
                ]).map((r) => (
                                    <td key={r.key} className="px-4 py-2">
                                        <input type="number" step="0.01" value={row[r.key] || ''} onChange={(e) => {
                                            const newGrids = { ...masterGrids };
                                            newGrids.associateTenured[idx][r.key] = e.target.value;
                                            setMasterGrids(newGrids);
                                        }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full" />
                                    </td>
                                ))}
                              </>
                            )}
                            {activeMasterGridTab === 'associateVintage' && (
                              <>
                                {['m0', 'm1', 'm2', 'm3'].map((field) => (
                                    <td key={field} className="px-4 py-2">
                                        <input type="number" value={row[field]} onChange={(e) => {
                                            const newGrids = { ...masterGrids };
                                            newGrids.associateVintage[idx][field] = e.target.value;
                                            setMasterGrids(newGrids);
                                        }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full" />
                                    </td>
                                ))}
                              </>
                            )}
                            {activeMasterGridTab === 'leadership' && (
                              <td className="px-4 py-2">
                                  <input type="number" step="0.01" value={row.incentive_percentage} onChange={(e) => {
                                      const newGrids = { ...masterGrids };
                                      newGrids.leadership[idx].incentive_percentage = e.target.value;
                                      setMasterGrids(newGrids);
                                  }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full" />
                              </td>
                            )}
                            {activeMasterGridTab === 'specialExceptions' && (
                              <td className="px-4 py-2">
                                  <input type="number" step="0.01" value={row.incentive_percentage} onChange={(e) => {
                                      const newGrids = { ...masterGrids };
                                      newGrids.specialExceptions[idx].incentive_percentage = e.target.value;
                                      setMasterGrids(newGrids);
                                  }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full" />
                              </td>
                            )}
                            <td className="px-4 py-2 text-right">
                                <button 
                                    onClick={() => {
                                        const newGrids = { ...masterGrids };
                                        (newGrids as any)[activeMasterGridTab] = ((newGrids as any)[activeMasterGridTab] as any[]).filter((_item: any, i: number) => i !== idx);
                                        setMasterGrids(newGrids);
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold px-3 py-1.5 rounded-md text-sm transition-colors"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                <tr>
                    <td colSpan={10} className="px-4 py-3 bg-slate-50/50">
                        <button 
                            onClick={() => {
                                const newGrids = { ...masterGrids };
                                if (activeMasterGridTab === 'associateTenured') {
                                    newGrids.associateTenured.push({ target_collection: '', under_16k: '', between_16_18k: '', between_18_24k: '', over_24k: '' });
                                } else if (activeMasterGridTab === 'associateVintage') {
                                    newGrids.associateVintage.push({ target_collection: '', m0: '', m1: '', m2: '', m3: '' });
                                } else if (activeMasterGridTab === 'leadership') {
                                    newGrids.leadership.push({ role: 'TL', target_collection: '', incentive_percentage: '' });
                                } else if (activeMasterGridTab === 'specialExceptions') {
                                    newGrids.specialExceptions.push({ target_collection: '', incentive_percentage: '' });
                                }
                                setMasterGrids(newGrids);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-bold w-full text-left"
                        >
                            + Add New Rule
                        </button>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
