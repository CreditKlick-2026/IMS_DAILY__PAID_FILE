"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid, Legend as RechartsLegend
} from 'recharts';
import { 
  IndianRupee, FileText, Users, BarChart3, UserCheck, Building2, 
  AlertTriangle, ShieldAlert, PieChart as PieChartIcon, MapPin, 
  CreditCard, Headphones, Clock, TrendingUp
} from 'lucide-react';

const COLORS = ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];

// ─── MultiSelect ─────────────────────────────────────────────────────────────
const MultiSelect = ({ label, options, selected, onChange }: {
  label: string; options: string[]; selected: string[]; onChange: (s: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = (val: string) => onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);

  const filteredOptions = (options || []).filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', background: '#ffffff', color: '#000000', minWidth: 110, whiteSpace: 'nowrap' }}>
        <span>{selected.length === 0 ? label : `${label} (${selected.length})`}</span>
        <span style={{ fontSize: 9, opacity: 0.6 }}>▼</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 9999, background: '#ffffff', color: '#000000', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, maxHeight: 250, overflowY: 'auto', minWidth: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <div style={{ padding: '6px', position: 'sticky', top: 0, background: '#ffffff', borderBottom: '1px solid var(--border, #e5e7eb)', zIndex: 2 }}>
            <input 
              type="text" 
              placeholder={`Search ${label}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px', fontSize: 11, border: '1px solid var(--border, #e5e7eb)', borderRadius: 4, outline: 'none', background: '#f9fafb', color: '#000000' }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          {filteredOptions.length === 0 && <div style={{ padding: '8px 12px', fontSize: 11, opacity: 0.5 }}>No options</div>}
          {filteredOptions.map(o => (
            <div key={o} onClick={() => toggle(o)} style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderBottom: '1px solid var(--border, #f3f4f6)' }}>
              <input type="checkbox" readOnly checked={selected.includes(o)} style={{ cursor: 'pointer' }} />
              <span style={{ whiteSpace: 'nowrap' }}>{o}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--color-foreground)' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {formatter ? formatter(p.value) : p.value}</div>
      ))}
    </div>
  );
};

const ChartCard = ({ title, icon: Icon, children, span }: { title: string; icon?: any; children: React.ReactNode; span?: number }) => (
  <div className={`p-5 rounded-xl border border-border bg-card shadow-sm ${span === 2 ? 'lg:col-span-2' : ''} ${span === 3 ? 'lg:col-span-3' : ''}`}>
    <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-primary" />}
      {title}
    </div>
    {children}
  </div>
);

const NoData = () => <div className="text-xs text-muted-foreground text-center py-8">No data for selected filters</div>;

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  const date = new Date();
  const [month, setMonth] = useState((date.getMonth() + 1).toString());
  const [year, setYear] = useState(date.getFullYear().toString());
  const [lastUpdated, setLastUpdated] = useState('');
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [filters, setFilters] = useState<{ [k: string]: string[] }>({
    tl_name: [], client: [], product: [], bucket: [], location: [], employee_code: []
  });

  const months = [
    { v: '1', l: 'Jan' }, { v: '2', l: 'Feb' }, { v: '3', l: 'Mar' }, { v: '4', l: 'Apr' }, { v: '5', l: 'May' }, { v: '6', l: 'Jun' },
    { v: '7', l: 'Jul' }, { v: '8', l: 'Aug' }, { v: '9', l: 'Sep' }, { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dec' }
  ];

  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch('/api/leads/filters').then(r => r.json()).then(d => { if (d.success) setFilterOptions(d.filters); });
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.success) setUser(d.user); });
  }, []);

  useEffect(() => { fetchDashboardData(); }, [month, year, JSON.stringify(filters)]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ month, year });
      Object.entries(filters).forEach(([k, vals]) => vals.forEach(v => q.append(k, v)));
      const res = await fetch(`/api/dashboard?${q}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

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
  const getMonthLabel = () => months.find(m => m.v === month)?.l || '';

  const filterDefs = [
    { key: 'tl_name', optKey: 'tlName', label: 'TL Name' },
    { key: 'client', optKey: 'client', label: 'Client' },
    { key: 'product', optKey: 'product', label: 'Product' },
    { key: 'bucket', optKey: 'bucket', label: 'Bucket' },
    { key: 'location', optKey: 'location', label: 'Location' },
    { key: 'employee_code', optKey: 'employeeCode', label: 'Emp Code' },
  ];

  const toChartData = (arr: any[]) => (arr || []).map(item => ({ name: item.name, value: item.collected, files: item.files }));

  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-background">

      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <div>
            {user?.name && (
              <div className="text-xl font-bold text-foreground mb-1 flex items-center gap-3">
                <span>Welcome, <span className="text-primary">{user.name}</span></span>
                {user.location && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {user.location}
                  </span>
                )}
              </div>
            )}
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Daily Paid File Dashboard</span>
              <span className="text-[9px] text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">LIVE</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              IMS Daily Paid File • {currentTime}{lastUpdated && ` • Updated: ${lastUpdated}`}
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <select className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold text-xs cursor-pointer w-24" value={month} onChange={e => setMonth(e.target.value)}>
              {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <select className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold text-xs cursor-pointer w-20" value={year} onChange={e => setYear(e.target.value)}>
              {['2024', '2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {filterDefs.map(f => (
            <MultiSelect key={f.key} label={f.label} options={filterOptions[f.optKey] || []} selected={filters[f.key]} onChange={vals => setFilter(f.key, vals)} />
          ))}
          {activeCount > 0 && (
            <button onClick={clearFilters} style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8, border: '1px solid var(--color-destructive)', color: 'var(--color-destructive)', background: 'transparent', cursor: 'pointer' }}>
              Clear Filters ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
        {loading || !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-xl h-24 p-5 flex flex-col gap-3">
                <div className="h-3.5 bg-muted rounded w-2/3" /><div className="h-6 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ── KPI Row (8 cards) ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { label: `Collection (${getMonthLabel()})`, value: fmt(data.summary.totalCollected), icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Total Paid Files', value: data.summary.totalFiles, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Unique Accounts', value: data.summary.uniqueAccounts, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Avg / File', value: fmt(data.summary.avgPerFile), icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Active Agents', value: data.summary.activeAgents, icon: UserCheck, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Top Client', value: data.summary.topClient, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Duplicates', value: data.summary.duplicateCount || 0, icon: AlertTriangle, color: data.summary.duplicateCount > 0 ? 'text-amber-500' : 'text-slate-400', bg: data.summary.duplicateCount > 0 ? 'bg-amber-500/10' : 'bg-slate-100' },
                { label: 'Frauds', value: data.summary.fraudCount || 0, icon: ShieldAlert, color: data.summary.fraudCount > 0 ? 'text-destructive' : 'text-slate-400', bg: data.summary.fraudCount > 0 ? 'bg-destructive/10' : 'bg-slate-100' },
              ].map((k, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${k.bg} ${k.color}`}>
                      <k.icon size={14} strokeWidth={2.5} />
                    </div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                      {k.label}
                    </div>
                  </div>
                  <div className={`text-lg font-bold tracking-tight truncate ${k.color}`}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* ── Daily Collection Trend (full width) ── */}
            <ChartCard title={`Daily Collection Trend — ${getMonthLabel()} ${year}`} icon={TrendingUp} span={3}>
              {(data.dailyTrend || []).length === 0 ? <NoData /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.dailyTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} width={60} />
                    <Tooltip content={<ChartTooltip formatter={fmt} />} />
                    <Area type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={2} fill="url(#gradBlue)" name="Collection" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* ── Row 2: Client + Bucket + TL ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="Client Portfolio Wise" icon={Building2}>
                {data.clients.length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={toChartData(data.clients)} layout="vertical" margin={{ left: 4, right: 30, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18} name="Collection">
                          {toChartData(data.clients).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Legend items={data.clients} fmt={fmt} />
                  </>
                )}
              </ChartCard>

              <ChartCard title="Bucket Wise Recovery" icon={PieChartIcon}>
                {data.buckets.length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={toChartData(data.buckets)} layout="vertical" margin={{ left: 4, right: 30, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18} name="Collection">
                          {toChartData(data.buckets).map((_: any, i: number) => <Cell key={i} fill={COLORS[(i+2) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Legend items={data.buckets} fmt={fmt} colors={COLORS.slice(2)} />
                  </>
                )}
              </ChartCard>

              <ChartCard title="Top Team Leaders" icon={Users}>
                {data.teamLeaders.length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={toChartData(data.teamLeaders)} layout="vertical" margin={{ left: 4, right: 30, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18} name="Collection">
                          {toChartData(data.teamLeaders).map((_: any, i: number) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-1 mt-2">
                      {data.teamLeaders.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <span style={{ width: 14, height: 14, borderRadius: 3, background: COLORS[(i + 4) % COLORS.length], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700 }}>#{i + 1}</span>
                            {item.name}
                          </span>
                          <span className="font-semibold text-primary">{fmt(item.collected)} <span className="text-muted-foreground font-normal">({(item.percentage ?? 0).toFixed(1)}%)</span></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ChartCard>
            </div>

            {/* ── Row 3: Product Pie + Location Bar + Payment Pie ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="Product Wise" icon={PieChartIcon}>
                {data.products.length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie data={toChartData(data.products)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={30} paddingAngle={3}>
                          {toChartData(data.products).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Legend items={data.products} fmt={fmt} />
                  </>
                )}
              </ChartCard>

              <ChartCard title="Top Locations" icon={MapPin}>
                {data.locations.length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart data={toChartData(data.locations).slice(0, 8)} layout="vertical" margin={{ left: 4, right: 30, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                        <Bar dataKey="value" fill={COLORS[3]} radius={[0, 6, 6, 0]} maxBarSize={16} name="Collection" />
                      </BarChart>
                    </ResponsiveContainer>
                    <Legend items={data.locations.slice(0, 5)} fmt={fmt} colors={[COLORS[3]]} />
                  </>
                )}
              </ChartCard>

              <ChartCard title="Payment Modes" icon={CreditCard}>
                {data.paymentModes.length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={170}>
                      <PieChart>
                        <Pie data={toChartData(data.paymentModes)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={30} paddingAngle={3}>
                          {toChartData(data.paymentModes).map((_: any, i: number) => <Cell key={i} fill={COLORS[(i+5) % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {data.paymentModes.map((item: any, i: number) => (
                        <div key={i} className="bg-muted/30 p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-1 mb-1">
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[(i+5) % COLORS.length], display: 'inline-block' }} />
                            <span className="text-[9px] text-muted-foreground uppercase font-semibold truncate">{item.name}</span>
                          </div>
                          <div className="text-xs font-bold text-foreground">{fmt(item.collected)}</div>
                          <div className="text-[9px] text-muted-foreground">{item.files} txns</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ChartCard>
            </div>

            {/* ── Row 4: Agent Performance (full width table) ── */}
            {/* ── Row 4: Agent Performance (full width table) ── */}
            <ChartCard title="Agent-wise Performance (Top 10)" icon={Users} span={3}>
              {(data.agents || []).length === 0 ? <NoData /> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                        {['#', 'Agent Name', 'Emp Code', 'Files', 'Unique A/C', 'Collection', '% Share'].map(h => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.agents.map((a: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ width: 20, height: 20, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', background: i === 0 ? '#1e40af' : i === 1 ? '#2563eb' : i === 2 ? '#60a5fa' : 'var(--color-muted-foreground)' }}>{i + 1}</span>
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--color-foreground)' }}>{a.name}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--color-muted-foreground)', fontFamily: 'monospace', fontSize: 10 }}>{a.code || '—'}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--color-foreground)' }}>{a.files}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--color-blue-500, #3b82f6)', fontWeight: 600 }}>{a.uniqueAccounts}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#3b82f6' }}>{fmt(a.collected)}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-muted)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 3, background: COLORS[i % COLORS.length], width: `${a.percentage}%` }} />
                              </div>
                              <span style={{ fontSize: 10, color: 'var(--color-muted-foreground)', minWidth: 36 }}>{(a.percentage ?? 0).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>

            {/* ── Row 5: APH + PH breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="APH Wise Breakdown" icon={Headphones}>
                {(data.aphBreakdown || []).length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={toChartData(data.aphBreakdown)} layout="vertical" margin={{ left: 4, right: 30, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={16} name="Collection">
                          {toChartData(data.aphBreakdown).map((_: any, i: number) => <Cell key={i} fill={COLORS[(i+6) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Legend items={data.aphBreakdown} fmt={fmt} colors={COLORS.slice(6).concat(COLORS)} />
                  </>
                )}
              </ChartCard>

              <ChartCard title="PH Wise Breakdown" icon={Clock}>
                {(data.phBreakdown || []).length === 0 ? <NoData /> : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={toChartData(data.phBreakdown)} layout="vertical" margin={{ left: 4, right: 30, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTooltip formatter={fmt} />} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={16} name="Collection">
                          {toChartData(data.phBreakdown).map((_: any, i: number) => <Cell key={i} fill={COLORS[(i+2) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <Legend items={data.phBreakdown} fmt={fmt} colors={COLORS.slice(2).concat(COLORS)} />
                  </>
                )}
              </ChartCard>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

// ─── Shared Legend ─────────────────────────────────────────────────────────────
const Legend = ({ items, fmt, colors }: { items: any[]; fmt: (n: number) => string; colors?: string[] }) => (
  <div className="flex flex-col gap-1 mt-2">
    {items.slice(0, 6).map((item: any, i: number) => (
      <div key={i} className="flex justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1 truncate">
          <span style={{ width: 8, height: 8, borderRadius: 2, background: (colors || COLORS)[i % (colors || COLORS).length], display: 'inline-block', flexShrink: 0 }} />
          <span className="truncate">{item.name}</span>
        </span>
        <span className="font-semibold text-foreground whitespace-nowrap ml-2">{fmt(item.collected)} · {item.files} files</span>
      </div>
    ))}
  </div>
);

export default Dashboard;
