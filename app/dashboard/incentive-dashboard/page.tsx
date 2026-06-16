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

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('groupBy', 'employee_code');
      if (filterMonth) queryParams.append('month', filterMonth);
      if (filterYear) queryParams.append('year', filterYear);

      const [kekaRes, incRes] = await Promise.all([
        fetch('/api/keka'),
        fetch(`/api/incentives?${queryParams.toString()}`)
      ]);
      
      const kekaResult = await kekaRes.json();
      const incResult = await incRes.json();
      
      if (kekaResult.success) {
        const kekaData = kekaResult.data;
        const incData = incResult.success ? incResult.data : [];
        
        const mergedData = kekaData.map((emp: any) => {
          const match = incData.find((inc: any) => inc.employee_id === emp.employee_id) || {};
          return {
            ...emp,
            ...match,
            final_incentive: match.incentive || 0,
            total_collection: match.total_collection || 0,
            am_name: match.am_name || emp.am_name || '—',
            tl_name: match.tl_name || emp.tl_name || '—',
            designation: match.designation || emp.designation || '—',
            location: match.location || emp.location || 'Unknown'
          };
        });
        
        setData(mergedData);
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
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto no-scrollbar bg-[var(--bg)]">
      
      {/* Header & Filters */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--txt)]">Incentive Dashboard</h1>
          <p className="text-sm text-[var(--txt3)] font-medium">In-depth analysis of collections and payouts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            className="bg-[var(--bg2)] border border-[var(--bdr)] rounded-md px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 text-[var(--txt)]"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select
            className="bg-[var(--bg2)] border border-[var(--bdr)] rounded-md px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/50 text-[var(--txt)]"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
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
            style={{
              background: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--txt3)]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">Analyzing Data...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-top)] border border-[var(--bdr)] rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-[var(--txt3)] uppercase tracking-wider mb-1">Total Payout</p>
              <h2 className="text-3xl font-black text-emerald-500">{formatCurrency(totalPayout)}</h2>
            </div>
            <div className="bg-[var(--bg-top)] border border-[var(--bdr)] rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-[var(--txt3)] uppercase tracking-wider mb-1">Total Collection</p>
              <h2 className="text-3xl font-black text-amber-500">{formatCurrency(totalCollection)}</h2>
            </div>
            <div className="bg-[var(--bg-top)] border border-[var(--bdr)] rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-[var(--txt3)] uppercase tracking-wider mb-1">Eligible Employees</p>
              <h2 className="text-3xl font-black text-indigo-500">{eligibleEmployees} <span className="text-sm font-semibold text-[var(--txt3)]">/ {totalEmployees}</span></h2>
            </div>
            <div className="bg-[var(--bg-top)] border border-[var(--bdr)] rounded-xl p-5 shadow-sm">
              <p className="text-xs font-bold text-[var(--txt3)] uppercase tracking-wider mb-1">Avg. Incentive</p>
              <h2 className="text-3xl font-black text-blue-500">{formatCurrency(avgIncentive)}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Designation Chart */}
            <div className="bg-[var(--bg-top)] border border-[var(--bdr)] rounded-xl p-5 shadow-sm h-[350px] flex flex-col">
              <h3 className="text-sm font-bold text-[var(--txt)] mb-4">Payout by Designation</h3>
              <div style={{ width: '100%', height: 280, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={desigChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({name, percent = 0}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {desigChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Location Chart */}
            <div className="bg-[var(--bg-top)] border border-[var(--bdr)] rounded-xl p-5 shadow-sm h-[350px] flex flex-col">
              <h3 className="text-sm font-bold text-[var(--txt)] mb-4">Payout by Location</h3>
              <div style={{ width: '100%', height: 280, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locChartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--bdr)" />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v).replace('₹', '')} stroke="var(--txt3)" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="var(--txt3)" fontSize={11} />
                    <Tooltip cursor={{fill: 'var(--bdr)'}} formatter={(value: any) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                      {locChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top 10 Earners Table */}
          <div className="bg-[var(--bg-top)] border border-[var(--bdr)] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--bdr)] bg-[var(--bg2)]">
              <h3 className="text-sm font-bold text-[var(--txt)]">Top 10 Incentive Earners</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--bg-top)] border-b border-[var(--bdr)]">
                    <th className="py-3 px-4 text-xs font-bold text-[var(--txt3)] uppercase">Rank</th>
                    <th className="py-3 px-4 text-xs font-bold text-[var(--txt3)] uppercase">Employee Name</th>
                    <th className="py-3 px-4 text-xs font-bold text-[var(--txt3)] uppercase">Designation</th>
                    <th className="py-3 px-4 text-xs font-bold text-[var(--txt3)] uppercase">Location</th>
                    <th className="py-3 px-4 text-xs font-bold text-[var(--txt3)] uppercase text-right">Collection</th>
                    <th className="py-3 px-4 text-xs font-bold text-[var(--txt3)] uppercase text-right">Incentive</th>
                  </tr>
                </thead>
                <tbody>
                  {topEarners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[var(--txt3)] text-sm font-medium">No incentive data found for this month.</td>
                    </tr>
                  ) : (
                    topEarners.map((emp, idx) => (
                      <tr key={emp.employee_id} className="border-b border-[var(--bdr)] last:border-0 hover:bg-[var(--bg2)] transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx < 3 ? 'bg-amber-100 text-amber-600' : 'bg-[var(--bg)] text-[var(--txt3)]'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--txt)] text-sm">{emp.name}</div>
                          <div className="text-[10px] font-mono text-[var(--txt3)]">{emp.employee_id}</div>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--txt2)]">{emp.designation || '—'}</td>
                        <td className="py-3 px-4 text-xs text-[var(--txt2)]">{emp.location || '—'}</td>
                        <td className="py-3 px-4 text-sm font-bold text-[var(--txt)] text-right">{formatCurrency(emp.total_collection)}</td>
                        <td className="py-3 px-4 text-sm font-black text-emerald-500 text-right">{formatCurrency(emp.final_incentive)}</td>
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
