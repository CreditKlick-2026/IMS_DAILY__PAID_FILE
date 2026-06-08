"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart2, IndianRupee, Trophy, Calendar, FileSpreadsheet, Loader2, FilterX } from 'lucide-react';

const MultiSelect = ({ label, options, selected, onChange }: { label: string, options: string[], selected: string[], onChange: (s: string[]) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter(x => x !== val));
    else onChange([...selected, val]);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: 'auto' }}>
      <div 
        className="finp" 
        style={{ fontSize: 12, padding: '6px 10px', minWidth: 120, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2, #ffffff)', border: '1px solid var(--bdr)', borderRadius: 4 }}
        onClick={() => setOpen(!open)}
      >
        <span>{selected.length === 0 ? label : `${label} (${selected.length})`}</span>
        <span style={{ fontSize: 10 }}>▼</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--bg2, #ffffff)', border: '1px solid var(--bdr)', borderRadius: 6, zIndex: 100, maxHeight: 200, overflowY: 'auto', minWidth: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {options.length === 0 ? <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--txt3)' }}>No options</div> : null}
          {options.map(o => (
            <div key={o} onClick={() => toggle(o)} style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderBottom: '1px solid var(--faint)' }}>
              <input type="checkbox" checked={selected.includes(o)} readOnly style={{ cursor: 'pointer' }} />
              <span style={{ whiteSpace: 'nowrap' }}>{o}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function IncentivePage() {
  const { user } = useApp();
  const date = new Date();
  const [month, setMonth] = useState((date.getMonth() + 1).toString());
  const [year, setYear] = useState(date.getFullYear().toString());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [outMin, setOutMin] = useState('');
  const [groupBy, setGroupBy] = useState('ph');
  const [filterOptions, setFilterOptions] = useState<any>({});
  const initialFilters = {
    employee_code: [], product: [], bucket: [], location: [],
    aph: [], ph: [], client: [], tl_name: [], employee_name: []
  };
  const [filters, setFilters] = useState<any>(initialFilters);

  const months = [
    {v:'1',l:'January'},{v:'2',l:'February'},{v:'3',l:'March'},{v:'4',l:'April'},{v:'5',l:'May'},{v:'6',l:'June'},
    {v:'7',l:'July'},{v:'8',l:'August'},{v:'9',l:'September'},{v:'10',l:'October'},{v:'11',l:'November'},{v:'12',l:'December'}
  ];
  const years = ['2024','2025','2026','2027'];

  useEffect(() => {
    fetch('/api/leads/filters')
      .then(res => res.json())
      .then(d => {
        if (d.success) setFilterOptions(d.filters);
      });
  }, []);

  const fetchIncentives = () => {
    if (!user) return;
    setLoading(true);
    
    const query = new URLSearchParams();
    query.append('month', month);
    query.append('year', year);
    query.append('groupBy', groupBy);
    if (outMin) query.append('outMin', outMin);
    
    Object.entries(filters).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach(val => query.append(k, val));
      }
    });

    fetch(`/api/incentives?${query.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    // Debounce the fetch to avoid too many requests while typing/clicking
    const timer = setTimeout(() => {
      fetchIncentives();
    }, 300);
    return () => clearTimeout(timer);
  }, [month, year, outMin, filters, groupBy, user]);

  const clearFilters = () => {
    setOutMin('');
    setFilters(initialFilters);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (!user) {
    return <div className="flex-1 flex items-center justify-center bg-muted/10 h-full w-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 h-full w-full">
      <div className="w-full mx-auto h-full flex flex-col max-w-[1400px]">
        
        {/* Header Section matching Leads.tsx */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--txt)', margin: '0 0 4px 0' }}>
              {isAdmin ? 'Team Incentives' : 'My Incentives'}
            </h1>
            <p style={{ fontSize: 12, color: 'var(--txt3)', margin: 0 }}>
              {isAdmin ? 'Company-wide performance and payout tracking' : 'Your performance metrics and earned payouts'}
            </p>
          </div>
        </div>

        {/* Filter Bar matching Leads.tsx */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 15, background: 'var(--bg3)', border: '1px solid var(--bdr)', borderRadius: 8, marginBottom: 20, alignItems: 'center' }}>
          
          <select 
            className="finp" 
            style={{ fontSize: 12, padding: '6px 10px', width: 'auto', background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)', borderRadius: 4, outline: 'none' }}
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
          
          <select 
            className="finp" 
            style={{ fontSize: 12, padding: '6px 10px', width: 'auto', background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)', borderRadius: 4, outline: 'none' }}
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <input 
            type="number" 
            placeholder="₹ Min Collection" 
            value={outMin} 
            onChange={e => setOutMin(e.target.value)} 
            className="finp" 
            style={{ fontSize: 12, padding: '6px 10px', width: '130px', background: 'var(--bg2)', color: 'var(--txt)', border: '1px solid var(--bdr)', borderRadius: 4, outline: 'none' }}
          />
          
          <MultiSelect label="Emp Code" options={filterOptions.employeeCode || []} selected={filters.employee_code} onChange={s => setFilters({...filters, employee_code: s})} />
          <MultiSelect label="Product Type" options={filterOptions.product || []} selected={filters.product} onChange={s => setFilters({...filters, product: s})} />
          <MultiSelect label="Bucket" options={filterOptions.bucket || []} selected={filters.bucket} onChange={s => setFilters({...filters, bucket: s})} />
          <MultiSelect label="Location" options={filterOptions.location || []} selected={filters.location} onChange={s => setFilters({...filters, location: s})} />
          <MultiSelect label="APH" options={filterOptions.aph || []} selected={filters.aph} onChange={s => setFilters({...filters, aph: s})} />
          <MultiSelect label="PH" options={filterOptions.ph || []} selected={filters.ph} onChange={s => setFilters({...filters, ph: s})} />
          <MultiSelect label="Client" options={filterOptions.client || []} selected={filters.client} onChange={s => setFilters({...filters, client: s})} />
          <MultiSelect label="TL Name" options={filterOptions.tlName || []} selected={filters.tl_name} onChange={s => setFilters({...filters, tl_name: s})} />
          <MultiSelect label="Agent Name" options={filterOptions.agentName || []} selected={filters.employee_name} onChange={s => setFilters({...filters, employee_name: s})} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px solid var(--bdr)', paddingLeft: 12, marginLeft: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Group By:</span>
            <select 
              className="finp"
              value={groupBy} 
              onChange={e => setGroupBy(e.target.value)}
              style={{ fontSize: 12, padding: '4px 8px', width: 'auto', background: 'var(--bg2)', color: 'var(--acc2)', border: '1px solid var(--bdr)', borderRadius: 4, outline: 'none', fontWeight: 700 }}
            >
              <option value="ph">PH</option>
              <option value="tl_name">TL Name</option>
              <option value="employee_name">Agent Name</option>
              <option value="employee_code">Employee Code</option>
              <option value="client">Client</option>
              <option value="location">Location</option>
              <option value="product">Product Type</option>
              <option value="bucket">Bucket</option>
            </select>
          </div>

          <button 
            onClick={clearFilters}
            style={{ padding: '6px 14px', background: 'var(--red)', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
          >
            <FilterX size={14} /> Clear
          </button>
        </div>

        {/* Data Views - Temporarily Hidden per user request */}
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <FilterX className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Calculations Paused</h2>
          <p className="text-slate-500">Incentive calculations and table data are currently hidden.</p>
        </div>
      </div>
    </div>
  );
}
