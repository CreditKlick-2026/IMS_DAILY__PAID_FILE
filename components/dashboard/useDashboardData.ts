"use client";
import { useState, useEffect } from 'react';

export const months = [
  { v: '1', l: 'Jan' }, { v: '2', l: 'Feb' }, { v: '3', l: 'Mar' }, { v: '4', l: 'Apr' },
  { v: '5', l: 'May' }, { v: '6', l: 'Jun' }, { v: '7', l: 'Jul' }, { v: '8', l: 'Aug' },
  { v: '9', l: 'Sep' }, { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dec' }
];

export const filterDefs = [
  { key: 'tl_name', optKey: 'tlName', label: 'TL Name' },
  { key: 'client', optKey: 'client', label: 'Client' },
  { key: 'product', optKey: 'product', label: 'Product' },
  { key: 'bucket', optKey: 'bucket', label: 'Bucket' },
  { key: 'location', optKey: 'location', label: 'Location' },
  { key: 'employee_code', optKey: 'employeeCode', label: 'Emp Code' }
];

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  const now = new Date();
  const [month, setMonth] = useState((now.getMonth() + 1).toString());
  const [year, setYear] = useState(now.getFullYear().toString());
  const [lastUpdated, setLastUpdated] = useState('');
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [filters, setFilters] = useState<{ [k: string]: string[] }>({
    tl_name: [], client: [], product: [], bucket: [], location: [], employee_code: []
  });

  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/leads/filters').then(r => r.json()).then(d => { if (d.success) setFilterOptions(d.filters); });
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.success) setUser(d.user); });
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ month, year });
      Object.entries(filters).forEach(([k, vals]) => vals.forEach(v => q.append(k, v)));
      const res = await fetch(`/api/dashboard?${q}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [month, year, JSON.stringify(filters)]);

  const setFilter = (key: string, vals: string[]) => setFilters(f => ({ ...f, [key]: vals }));
  const clearFilters = () => setFilters({ tl_name: [], client: [], product: [], bucket: [], location: [], employee_code: [] });
  const activeCount = Object.values(filters).flat().length;

  const fmt = (num: number) => {
    if (!num) return '₹0';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const monthLabel = months.find(m => m.v === month)?.l || '';

  return {
    loading, user, data, currentTime, month, setMonth, year, setYear,
    lastUpdated, filterOptions, filters, setFilter, clearFilters,
    activeCount, fmt, monthLabel, months, filterDefs
  };
}
