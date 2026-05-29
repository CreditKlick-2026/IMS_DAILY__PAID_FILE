"use client";
import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState('');
  
  const date = new Date();
  const [month, setMonth] = useState((date.getMonth() + 1).toString());
  const [year, setYear] = useState(date.getFullYear().toString());

  const [lastUpdated, setLastUpdated] = useState<string>('');

  const months = [
    {v:'1',l:'Jan'},{v:'2',l:'Feb'},{v:'3',l:'Mar'},{v:'4',l:'Apr'},{v:'5',l:'May'},{v:'6',l:'Jun'},
    {v:'7',l:'Jul'},{v:'8',l:'Aug'},{v:'9',l:'Sep'},{v:'10',l:'Oct'},{v:'11',l:'Nov'},{v:'12',l:'Dec'}
  ];

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?month=${month}&year=${year}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatAmt = (num: number) => {
    if (!num) return '₹0';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getMonthLabel = () => months.find(m => m.v === month)?.l || '';

  const renderProgressBar = (percentage: number, colorClass: string) => (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
    </div>
  );

  return (
    <div className="flex-grow flex flex-col overflow-hidden bg-background" key={`${month}-${year}`}>
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between flex-shrink-0 gap-4 flex-wrap shadow-sm">
        <div>
          <div className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>▣ Deep Analytics Dashboard</span> 
            <span className="text-[9px] text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">LIVE</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            IMS Daily Paid File • {currentTime} {lastUpdated && `• Last updated: ${lastUpdated}`}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold text-xs cursor-pointer focus:outline-none focus:border-primary/50 w-24" 
            value={month} 
            onChange={e => setMonth(e.target.value)}
          >
            {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
          <select 
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold text-xs cursor-pointer focus:outline-none focus:border-primary/50 w-20" 
            value={year} 
            onChange={e => setYear(e.target.value)}
          >
            {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
        {loading || !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-xl h-24 p-5 flex flex-col gap-3">
                <div className="h-3.5 bg-muted rounded w-2/3" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* KPI metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col gap-1 shadow-sm">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Collection ({getMonthLabel()})</div>
                <div className="text-2xl font-bold tracking-tight text-green-500">{formatAmt(data.summary.totalCollected)}</div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col gap-1 shadow-sm">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Files Processed</div>
                <div className="text-2xl font-bold tracking-tight text-foreground">{data.summary.totalFiles}</div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col gap-1 shadow-sm">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Portfolio / Client</div>
                <div className="text-xl font-bold tracking-tight text-amber-500 truncate">{data.summary.topClient}</div>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card flex flex-col gap-1 shadow-sm">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Top Performing Bucket</div>
                <div className="text-xl font-bold tracking-tight text-blue-500 truncate">{data.summary.topBucket}</div>
              </div>
            </div>
            
            {/* 3 Column Layout for Deep Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1: Client & Product */}
              <div className="flex flex-col gap-6">
                <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Client Portfolio Wise</div>
                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                    {data.clients.length > 0 ? data.clients.map((item: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-foreground truncate max-w-[140px]" title={item.name}>{item.name}</span>
                          <span className="font-bold text-green-500">{formatAmt(item.collected)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                          <span>{item.files} files</span>
                          <span>{item.percentage.toFixed(1)}%</span>
                        </div>
                        {renderProgressBar(item.percentage, 'bg-amber-500')}
                      </div>
                    )) : <div className="text-xs text-muted-foreground text-center py-4">No data</div>}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Product Wise</div>
                  <div className="flex flex-col gap-3">
                    {data.products.length > 0 ? data.products.map((item: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-muted-foreground font-medium">{item.name}</span>
                          <span className="font-bold text-foreground">{formatAmt(item.collected)}</span>
                        </div>
                        {renderProgressBar(item.percentage, 'bg-blue-500')}
                      </div>
                    )) : <div className="text-xs text-muted-foreground text-center py-4">No data</div>}
                  </div>
                </div>
              </div>

              {/* Column 2: Bucket & Location */}
              <div className="flex flex-col gap-6">
                <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Bucket Wise Recovery</div>
                  <div className="flex flex-col gap-3">
                    {data.buckets.length > 0 ? data.buckets.map((item: any, i: number) => (
                      <div key={i}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-foreground">{item.name}</span>
                          <span className="font-bold text-green-500">{formatAmt(item.collected)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                          <span>{item.files} files</span>
                          <span>{item.percentage.toFixed(1)}%</span>
                        </div>
                        {renderProgressBar(item.percentage, 'bg-purple-500')}
                      </div>
                    )) : <div className="text-xs text-muted-foreground text-center py-4">No data</div>}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Top Locations</div>
                  <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                    {data.locations.length > 0 ? data.locations.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground">{item.files} files</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{formatAmt(item.collected)}</span>
                      </div>
                    )) : <div className="text-xs text-muted-foreground text-center py-4">No data</div>}
                  </div>
                </div>
              </div>

              {/* Column 3: Team Performance & Payment Modes */}
              <div className="flex flex-col gap-6">
                <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Top Team Leaders (TL)</div>
                  <div className="flex flex-col gap-3">
                    {data.teamLeaders.length > 0 ? data.teamLeaders.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i===0 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                            #{i+1}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">{item.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-green-500">{formatAmt(item.collected)}</span>
                          <span className="text-[10px] text-muted-foreground">{item.percentage.toFixed(1)}% share</span>
                        </div>
                      </div>
                    )) : <div className="text-xs text-muted-foreground text-center py-4">No data</div>}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
                  <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Payment Modes</div>
                  <div className="flex flex-wrap gap-4">
                    {data.paymentModes.length > 0 ? data.paymentModes.map((item: any, i: number) => (
                      <div key={i} className="flex-1 min-w-[45%] bg-muted/30 p-3 rounded-lg border border-border">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">{item.name}</div>
                        <div className="text-sm font-bold text-foreground">{formatAmt(item.collected)}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{item.files} transactions</div>
                      </div>
                    )) : <div className="text-xs text-muted-foreground text-center py-4">No data</div>}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
