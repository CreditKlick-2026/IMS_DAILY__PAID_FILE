"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SpecialExceptionsPage() {
  // Special Grid States
  const [specialGrid, setSpecialGrid] = useState<any[]>([]);
  const [specialGridLoading, setSpecialGridLoading] = useState(false);
  const [isSavingGrid, setIsSavingGrid] = useState(false);

  // Special Employees States
  const [specialEmployees, setSpecialEmployees] = useState<any[]>([]);
  const [specialLoading, setSpecialLoading] = useState(false);
  const [specialSearch, setSpecialSearch] = useState('');
  const [specialPage, setSpecialPage] = useState(1);
  const specialLimit = 10;
  const [specialTotal, setSpecialTotal] = useState(0);

  // Master Grids States
  const [activeMasterGridTab, setActiveMasterGridTab] = useState('associateTenured');
  const [masterGrids, setMasterGrids] = useState<any>({
    associateTenured: [], associateVintage: [], leadership: [], specialExceptions: []
  });
  const [masterGridsLoading, setMasterGridsLoading] = useState(false);
  const [isSavingMasterGrid, setIsSavingMasterGrid] = useState(false);

  useEffect(() => {
    fetchSpecialGrid();
    fetchMasterGrids();
    fetchSpecialEmployees();
  }, []);

  const fetchSpecialGrid = () => {
    setSpecialGridLoading(true);
    fetch('/api/admin/special-grid')
      .then(r => r.json())
      .then(d => {
        if (d.success) setSpecialGrid(d.data);
        setSpecialGridLoading(false);
      })
      .catch(() => setSpecialGridLoading(false));
  };

  const fetchSpecialEmployees = (search = '', page = 1) => {
    setSpecialLoading(true);
    fetch(`/api/admin/special?search=${encodeURIComponent(search)}&page=${page}&limit=${specialLimit}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
            setSpecialEmployees(d.employees);
            setSpecialTotal(d.total || 0);
        }
        setSpecialLoading(false);
      })
      .catch(() => setSpecialLoading(false));
  };

  const handleToggleSpecial = async (empId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/special', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empId, is_special: !currentStatus })
      });
      if (res.ok) fetchSpecialEmployees(specialSearch, specialPage);
    } catch (e) {
      alert("Error updating special status");
    }
  };

  const handleSaveGrid = async () => {
    setIsSavingGrid(true);
    try {
      const res = await fetch('/api/admin/special-grid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: specialGrid })
      });
      if (res.ok) {
          alert('Special Grid updated successfully');
          fetchSpecialGrid();
      } else {
          alert('Failed to update grid');
      }
    } catch (e) {
      alert("Error updating grid");
    } finally {
      setIsSavingGrid(false);
    }
  };

  const fetchMasterGrids = () => {
    setMasterGridsLoading(true);
    fetch('/api/admin/master-grids')
      .then(r => r.json())
      .then(d => {
        if (d.success) setMasterGrids(d.data);
        setMasterGridsLoading(false);
      })
      .catch(() => setMasterGridsLoading(false));
  };

  const handleSaveMasterGrid = async (gridName: string) => {
    setIsSavingMasterGrid(true);
    try {
        const res = await fetch('/api/admin/master-grids', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gridName, data: masterGrids[gridName as keyof typeof masterGrids] })
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
    <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto min-h-full relative">
      
      {/* HEADER WITH SEARCH */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Special Exceptions</h1>
          <p className="text-slate-500 mt-1 max-w-xl">Force employees into the Special Exceptions bucket (flat percentage logic) regardless of vintage/salary.</p>
        </div>
        <div className="flex gap-2 relative mt-2">
          <input
            type="text"
            placeholder="Search Employee ID or Name"
            className="pl-9 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-red-500/50 w-64"
            value={specialSearch}
            onChange={(e) => {
              setSpecialSearch(e.target.value);
              if (e.target.value.length >= 3 || e.target.value.length === 0) {
                fetchSpecialEmployees(e.target.value, 1);
                setSpecialPage(1);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && fetchSpecialEmployees(specialSearch, specialPage)}
          />
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <button
            onClick={() => fetchSpecialEmployees(specialSearch, specialPage)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* SPECIAL GRID SECTION */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Dynamic Grid Rules</h3>
          <button 
              disabled={isSavingGrid}
              onClick={handleSaveGrid}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors"
          >
              {isSavingGrid ? 'Saving...' : 'Save Grid'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Target Collection (₹)</th>
                <th className="px-4 py-3 font-medium">Incentive (%)</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
                {specialGridLoading ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Loading Grid...</td></tr>
                ) : (
                    specialGrid.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2">
                                <input 
                                    type="number" 
                                    value={row.target_collection} 
                                    onChange={(e) => {
                                        const newGrid = [...specialGrid];
                                        newGrid[idx].target_collection = e.target.value;
                                        setSpecialGrid(newGrid);
                                    }}
                                    className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full"
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={row.incentive_percentage} 
                                    onChange={(e) => {
                                        const newGrid = [...specialGrid];
                                        newGrid[idx].incentive_percentage = e.target.value;
                                        setSpecialGrid(newGrid);
                                    }}
                                    className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full"
                                />
                            </td>
                            <td className="px-4 py-2 text-right">
                                <button 
                                    onClick={() => {
                                        const newGrid = specialGrid.filter((_, i) => i !== idx);
                                        setSpecialGrid(newGrid);
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded text-xs"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                <tr>
                    <td colSpan={3} className="px-4 py-3 bg-slate-50/30">
                        <button 
                            onClick={() => setSpecialGrid([...specialGrid, { target_collection: '', incentive_percentage: '' }])}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-bold w-full text-left"
                        >
                            + Add New Rule
                        </button>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SPECIAL EMPLOYEES LIST */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-slate-500 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Emp ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Designation</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Toggle Exception</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {specialLoading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            ) : specialEmployees.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">{specialSearch ? "No results found." : "No special exceptions found. Use search to add one."}</td></tr>
            ) : (
              specialEmployees.map((emp: any) => (
                <tr key={emp.employee_id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{emp.employee_id}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{emp.name}</td>
                  <td className="px-4 py-3 text-slate-500">{emp.designation || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {emp.is_special ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-200">SPECIAL APPLIED</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-medium border border-slate-200">Normal Logic</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleSpecial(emp.employee_id, emp.is_special)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                        emp.is_special 
                          ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                          : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                      }`}
                    >
                      {emp.is_special ? 'Remove Exception' : 'Mark as Special'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {!specialLoading && specialTotal > specialLimit && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
            <span className="text-sm text-slate-500">
              Showing {(specialPage - 1) * specialLimit + 1} to {Math.min(specialPage * specialLimit, specialTotal)} of {specialTotal} employees
            </span>
            <div className="flex gap-2">
              <button
                disabled={specialPage === 1}
                onClick={() => {
                  const newPage = specialPage - 1;
                  setSpecialPage(newPage);
                  fetchSpecialEmployees(specialSearch, newPage);
                }}
                className="px-3 py-1.5 border rounded-md text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={specialPage * specialLimit >= specialTotal}
                onClick={() => {
                  const newPage = specialPage + 1;
                  setSpecialPage(newPage);
                  fetchSpecialEmployees(specialSearch, newPage);
                }}
                className="px-3 py-1.5 border rounded-md text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MASTER GRIDS SECTION */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-slate-50/50">
          {['associateTenured', 'associateVintage', 'leadership', 'specialExceptions'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                activeMasterGridTab === tab 
                  ? 'text-purple-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
              onClick={() => setActiveMasterGridTab(tab)}
            >
              {tab === 'associateTenured' ? 'Tenured Logic' : 
               tab === 'associateVintage' ? 'Vintage Fixed' : 
               tab === 'leadership' ? 'Leadership Matrix' : 'Special Overrides'}
              {activeMasterGridTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-b bg-white flex justify-between items-center">
          <h3 className="font-bold text-slate-800">
            {activeMasterGridTab === 'associateTenured' ? 'Tenured Logic Matrix' : 
             activeMasterGridTab === 'associateVintage' ? 'Vintage Fixed Matrix' : 
             activeMasterGridTab === 'leadership' ? 'Leadership Matrix' : 'Special Exceptions Override'}
          </h3>
          <button 
              disabled={isSavingMasterGrid}
              onClick={() => handleSaveMasterGrid(activeMasterGridTab)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors"
          >
              {isSavingMasterGrid ? 'Saving...' : 'Save Matrix'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Target Collection (₹)</th>
                {activeMasterGridTab === 'associateTenured' && (
                  <>
                    <th className="px-4 py-3 font-medium">&lt;16k (%)</th>
                    <th className="px-4 py-3 font-medium">16k-18k (%)</th>
                    <th className="px-4 py-3 font-medium">18k-24k (%)</th>
                    <th className="px-4 py-3 font-medium">&gt;24k (%)</th>
                  </>
                )}
                {activeMasterGridTab === 'associateVintage' && (
                  <>
                    <th className="px-4 py-3 font-medium">Month 0 (₹)</th>
                    <th className="px-4 py-3 font-medium">Month 1 (₹)</th>
                    <th className="px-4 py-3 font-medium">Month 2 (₹)</th>
                    <th className="px-4 py-3 font-medium">Month 3 (₹)</th>
                  </>
                )}
                {activeMasterGridTab === 'leadership' && (
                  <>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Incentive (%)</th>
                  </>
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
                    masterGrids[activeMasterGridTab as keyof typeof masterGrids]?.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                            {activeMasterGridTab === 'leadership' && (
                              <td className="px-4 py-2">
                                  <select
                                      value={row.role || ''}
                                      onChange={(e) => {
                                          const newGrids = { ...masterGrids };
                                          newGrids[activeMasterGridTab as keyof typeof masterGrids][idx].role = e.target.value;
                                          setMasterGrids(newGrids);
                                      }}
                                      className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full"
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
                                        newGrids[activeMasterGridTab as keyof typeof masterGrids][idx].target_collection = e.target.value;
                                        setMasterGrids(newGrids);
                                    }}
                                    className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full"
                                />
                            </td>
                            {activeMasterGridTab === 'associateTenured' && (
                              <>
                                {['under_16k', 'between_16_18k', 'between_18_24k', 'over_24k'].map((field) => (
                                    <td key={field} className="px-4 py-2">
                                        <input type="number" step="0.01" value={row[field]} onChange={(e) => {
                                            const newGrids = { ...masterGrids };
                                            newGrids.associateTenured[idx][field] = e.target.value;
                                            setMasterGrids(newGrids);
                                        }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full" />
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
                                        }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full" />
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
                                  }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full" />
                              </td>
                            )}
                            {activeMasterGridTab === 'specialExceptions' && (
                              <td className="px-4 py-2">
                                  <input type="number" step="0.01" value={row.incentive_percentage} onChange={(e) => {
                                      const newGrids = { ...masterGrids };
                                      newGrids.specialExceptions[idx].incentive_percentage = e.target.value;
                                      setMasterGrids(newGrids);
                                  }} className="border rounded px-3 py-1.5 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full" />
                              </td>
                            )}
                            <td className="px-4 py-2 text-right">
                                <button 
                                    onClick={() => {
                                        const newGrids = { ...masterGrids };
                                        newGrids[activeMasterGridTab as keyof typeof masterGrids] = newGrids[activeMasterGridTab as keyof typeof masterGrids].filter((_, i) => i !== idx);
                                        setMasterGrids(newGrids);
                                    }}
                                    className="text-red-500 hover:bg-red-50 font-medium px-3 py-1.5 rounded-md text-sm transition-colors"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))
                )}
                <tr>
                    <td colSpan={10} className="px-4 py-3 bg-slate-50/30">
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
                            className="text-purple-600 hover:text-purple-800 text-sm font-semibold w-full text-left"
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
