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



  useEffect(() => {
    fetchSpecialGrid();
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



  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto no-scrollbar bg-slate-50/50 relative gap-6">
      
      {/* HEADER WITH SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            Special Exceptions
          </h1>
          <p className="text-sm text-slate-500 font-medium ml-13 mt-1 max-w-xl">Force employees into the Special Exceptions bucket (flat percentage logic) regardless of vintage/salary.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <input
              type="text"
              placeholder="Search Employee ID or Name"
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-colors w-full md:w-64 text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white"
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
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <button
            onClick={() => fetchSpecialEmployees(specialSearch, specialPage)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-bold transition-colors"
          >
              {isSavingGrid ? 'Saving...' : 'Save Grid'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b">
              <tr>
                <th className="px-4 py-2 text-xs font-medium">Target Collection (₹)</th>
                <th className="px-4 py-2 text-xs font-medium">Incentive (%)</th>
                <th className="px-4 py-2 text-xs font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
                {specialGridLoading ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Loading Grid...</td></tr>
                ) : (
                    specialGrid.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-1.5">
                                <input 
                                    type="number" 
                                    value={row.target_collection} 
                                    onChange={(e) => {
                                        const newGrid = [...specialGrid];
                                        newGrid[idx].target_collection = e.target.value;
                                        setSpecialGrid(newGrid);
                                    }}
                                    className="border rounded px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
                                />
                            </td>
                            <td className="px-4 py-1.5">
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={row.incentive_percentage} 
                                    onChange={(e) => {
                                        const newGrid = [...specialGrid];
                                        newGrid[idx].incentive_percentage = e.target.value;
                                        setSpecialGrid(newGrid);
                                    }}
                                    className="border rounded px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full"
                                />
                            </td>
                            <td className="px-4 py-1.5 text-right">
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

      {/* SPECIAL EMPLOYEES LIST */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-slate-500 border-b">
            <tr>
              <th className="px-4 py-2 text-xs font-medium">Emp ID</th>
              <th className="px-4 py-2 text-xs font-medium">Name</th>
              <th className="px-4 py-2 text-xs font-medium">Designation</th>
              <th className="px-4 py-2 text-xs font-medium">Status</th>
              <th className="px-4 py-2 text-xs font-medium text-right">Toggle Exception</th>
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
                  <td className="px-4 py-2 font-medium text-xs">{emp.employee_id}</td>
                  <td className="px-4 py-2 font-bold text-slate-800 text-xs">{emp.name}</td>
                  <td className="px-4 py-2 text-slate-500 text-xs">{emp.designation || 'N/A'}</td>
                  <td className="px-4 py-2">
                    {emp.is_special ? (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">SPECIAL APPLIED</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200">Normal Logic</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
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


    </div>
  );
}
