"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';

export default function IncentiveDashboard() {
  const { user } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const [filterLocation, setFilterLocation] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [clientOptions, setClientOptions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/locations').then(r => r.json()).then(d => { if (d.success) setLocationOptions(d.data); });
  }, []);

  useEffect(() => {
    let url = '/api/universal/clients';
    if (filterLocation && locationOptions.length > 0) {
      const loc = locationOptions.find(l => l.name === filterLocation);
      if (loc) {
        url += `?location_id=${loc.id}`;
      }
    }
    fetch(url).then(r => r.json()).then(d => {
      if (d.success) {
        setClientOptions(d.data);
        if (!d.data.find((p: any) => String(p.id) === String(filterClient))) {
          setFilterClient('');
        }
      }
    });
  }, [filterLocation, locationOptions]);

  useEffect(() => {
    if (user) {
      if (!filterClient) {
        setData([]);
        setLoading(false);
        return;
      }
      fetchData();
    }
  }, [user, filterMonth, filterYear, filterClient, clientOptions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterMonth) queryParams.append('month', filterMonth);
      if (filterYear) queryParams.append('year', filterYear);
      if (filterClient) {
         const clientName = clientOptions.find(c => String(c.id) === String(filterClient))?.name;
         if (clientName) {
            queryParams.append('client', clientName);
         }
      }

      const res = await fetch(`/api/universal/dashboard?${queryParams.toString()}`);
      const result = await res.json();

      if (result.success) {
        // Data is already joined in the backend now!
        setData(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  // --- Aggregate Metrics ---
  const totalEmployees = data.length;
  const eligibleEmployees = data.filter(d => d.final_incentive > 0).length;
  const totalCollection = data.reduce((sum, d) => sum + (d.total_collection || 0), 0);
  const totalPayout = data.reduce((sum, d) => sum + (d.final_incentive || 0), 0);
  const avgIncentive = eligibleEmployees > 0 ? totalPayout / eligibleEmployees : 0;

  // --- Chart Data ---
  // 1. Payout by Designation
  const desigPayout = data.reduce((acc, d) => {
    if (d.final_incentive > 0) {
      const desig = d.designation || 'Unknown';
      acc[desig] = (acc[desig] || 0) + d.final_incentive;
    }
    return acc;
  }, {} as Record<string, number>);
  const desigChartData = Object.entries(desigPayout).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value);

  // 2. Payout by Location
  const locPayout = data.reduce((acc, d) => {
    if (d.final_incentive > 0) {
      const loc = d.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + d.final_incentive;
    }
    return acc;
  }, {} as Record<string, number>);
  const locChartData = Object.entries(locPayout).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value);

  // 3. Top 10 Earners
  const topEarners = [...data]
    .filter(d => d.final_incentive > 0)
    .sort((a, b) => b.final_incentive - a.final_incentive)
    .slice(0, 10);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="w-full h-full flex flex-col p-8 overflow-y-auto no-scrollbar bg-slate-50/50 relative">

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            Incentive Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium ml-13 mt-1">In-depth analysis of collections and payouts</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user?.role === 'admin' && (
            <select
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setFilterClient(''); }}
            >
              <option value="">All Locations</option>
              {locationOptions.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
            </select>
          )}
          <select
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
          >
            <option value="">All Processes</option>
            {clientOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors cursor-pointer"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (data.length === 0) return;
              const ws = XLSX.utils.json_to_sheet(data);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
              XLSX.writeFile(wb, `IncentiveDashboard_${filterMonth || 'All'}_${filterYear || 'All'}.xlsx`);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Excel
          </button>
        </div>
      </div>

      {!filterClient ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px] bg-white rounded-2xl border border-slate-200 border-dashed">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p className="font-bold text-lg text-slate-500">Select a Process</p>
          <p className="text-sm">Please select a Process to view dashboard data.</p>
        </div>
      ) : loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="font-bold tracking-wide">Analyzing Data Matrix...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px] bg-white rounded-2xl border border-slate-200 border-dashed">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p className="font-bold text-lg text-slate-500">No Data Found</p>
          <p className="text-sm">Try selecting a different month or year.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm shadow-emerald-100 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
              <p className="text-xs font-black text-emerald-600/70 uppercase tracking-widest mb-2 relative z-10">Total Payout</p>
              <h2 className="text-3xl font-black text-emerald-600 relative z-10">{formatCurrency(totalPayout)}</h2>
            </div>

            <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm shadow-amber-100 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
              <p className="text-xs font-black text-amber-600/70 uppercase tracking-widest mb-2 relative z-10">Total Collection</p>
              <h2 className="text-3xl font-black text-amber-600 relative z-10">{formatCurrency(totalCollection)}</h2>
            </div>

            <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
              <p className="text-xs font-black text-indigo-600/70 uppercase tracking-widest mb-2 relative z-10">Eligible Employees</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <h2 className="text-3xl font-black text-indigo-600">{eligibleEmployees}</h2>
                <span className="text-sm font-bold text-slate-400">/ {totalEmployees}</span>
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm shadow-blue-100 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
              <p className="text-xs font-black text-blue-600/70 uppercase tracking-widest mb-2 relative z-10">Avg. Incentive</p>
              <h2 className="text-3xl font-black text-blue-600 relative z-10">{formatCurrency(avgIncentive)}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Designation Chart */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 rounded-full bg-indigo-500"></div>
                <h3 className="text-base font-bold text-slate-800">Payout by Designation</h3>
              </div>
              <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                {desigChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={desigChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        label={({ name, percent = 0 }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : null}
                        labelLine={false}
                      >
                        {desigChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-sm">No payout data available</div>
                )}
              </div>
            </div>

            {/* Location Chart */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-6 rounded-full bg-purple-500"></div>
                <h3 className="text-base font-bold text-slate-800">Payout by Location</h3>
              </div>
              <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                {locChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locChartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000)}k`} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} fontWeight={600} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={32}>
                        {locChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-sm">No payout data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Top 10 Earners Table */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center border border-yellow-200 shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <h3 className="text-base font-bold text-slate-800">Top 10 Incentive Earners</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-100">
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Employee</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Designation</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Collection</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Incentive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topEarners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-medium">No incentive data found for this month.</td>
                    </tr>
                  ) : (
                    topEarners.map((emp, idx) => (
                      <tr key={emp.employee_id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black shadow-sm border ${idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white border-yellow-400' :
                            idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white border-slate-400' :
                              idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-700' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{emp.name}</div>
                          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">{emp.employee_id}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">{emp.designation || '—'}</span>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-600">{emp.location || '—'}</td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-700 text-right bg-amber-50/30 group-hover:bg-amber-50/60 transition-colors">{formatCurrency(emp.total_collection)}</td>
                        <td className="py-4 px-6 text-sm font-black text-emerald-600 text-right bg-emerald-50/30 group-hover:bg-emerald-50/60 transition-colors">{formatCurrency(emp.final_incentive)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
