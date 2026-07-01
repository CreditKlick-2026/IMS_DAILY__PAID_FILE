'use client';

import React, { useState, useEffect } from 'react';

type AssociateSlab = {
  client: string;
  product: string;
  vintage: string;
  level: string;
  min: number | string;
  max: number | string;
  payout_pct: string;
};

type Rider = {
  role: string;
  docking: string | number;
  payout: string | number;
};

type MasterGrid2Data = {
  associateSlabs: AssociateSlab[];
  riders: Rider[];
  column_mappings?: Record<string, string>;
};

export default function MasterGrid2Page() {
  const [data, setData] = useState<MasterGrid2Data>({ associateSlabs: [], riders: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'associate' | 'riders'>('associate');
  const [filterClient, setFilterClient] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterVintage, setFilterVintage] = useState('');

  useEffect(() => {
    fetch('/api/admin/master-grids-2')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const clients = [...new Set(data.associateSlabs.map(s => s.client))];
  const products = [...new Set(data.associateSlabs.filter(s => !filterClient || s.client === filterClient).map(s => s.product))];
  const vintages = [...new Set(data.associateSlabs.filter(s => (!filterClient || s.client === filterClient) && (!filterProduct || s.product === filterProduct)).map(s => s.vintage))];

  const filteredSlabs = data.associateSlabs.filter(s =>
    (!filterClient || s.client === filterClient) &&
    (!filterProduct || s.product === filterProduct) &&
    (!filterVintage || s.vintage === filterVintage)
  );

  const formatVal = (v: number | string | null) => {
    if (v === null || v === undefined || v === '-') return '—';
    if (typeof v === 'number') return '₹' + v.toLocaleString('en-IN');
    return String(v);
  };

  return (
    <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto min-h-full relative">

      {/* Header */}
      <div className="rounded-xl border bg-white shadow-sm p-5 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Master Grid 2 — Incentive Slabs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Collection-based slab incentives for Axis Bank and other clients. Read-only.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block"></span>
            {data.associateSlabs.length} Rules Loaded
          </span>
        </div>

        {/* Column Mappings (Read-Only) */}
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Calculation Column Mappings (Read-Only)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(data.column_mappings || {
              collection: 'total_money_collected',
              employee_code: 'employee_code',
              employee_name: 'employee_name',
              tl_name: 'tl_name',
              am_name: 'am_name',
              salary: 'ctc',
              doj: 'date_of_joining',
              designation: 'job_title'
            }).map(([key, val]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-0.5 capitalize">{key.replace(/_/g, ' ')} Col</label>
                <input readOnly value={val} className="w-full border rounded-md px-3 py-1.5 text-xs bg-slate-50 outline-none text-slate-500 cursor-not-allowed" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button onClick={() => setActiveTab('associate')} className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'associate' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Associate Slabs
        </button>
        <button onClick={() => setActiveTab('riders')} className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'riders' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Riders &amp; Docking Rules ({data.riders.length})
        </button>
      </div>

      {/* Associate Slabs Tab */}
      {activeTab === 'associate' && (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b bg-slate-50 flex flex-wrap gap-3 items-center">
            <select value={filterClient} onChange={e => { setFilterClient(e.target.value); setFilterProduct(''); setFilterVintage(''); }}
              className="px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white">
              <option value="">All Clients</option>
              {clients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterProduct} onChange={e => { setFilterProduct(e.target.value); setFilterVintage(''); }}
              className="px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white">
              <option value="">All Products</option>
              {products.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterVintage} onChange={e => setFilterVintage(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white">
              <option value="">All Vintages</option>
              {vintages.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <span className="ml-auto text-xs text-slate-400">{filteredSlabs.length} rules</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Product / Bucket</th>
                    <th className="px-4 py-3 font-medium">Vintage</th>
                    <th className="px-4 py-3 font-medium">Level</th>
                    <th className="px-4 py-3 font-medium text-right">Min Collection</th>
                    <th className="px-4 py-3 font-medium text-right">Max Collection</th>
                    <th className="px-4 py-3 font-medium text-right">Payout %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlabs.map((slab, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-4 py-2.5 font-medium text-slate-700">{slab.client}</td>
                      <td className="px-4 py-2.5 text-slate-600">{slab.product}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${slab.vintage?.includes('<90') ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                          {slab.vintage || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-medium">{slab.level}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-mono text-xs">{formatVal(slab.min)}</td>
                      <td className="px-4 py-2.5 text-right text-slate-700 font-mono text-xs">{formatVal(slab.max)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`font-bold text-sm ${parseFloat(slab.payout_pct) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {slab.payout_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredSlabs.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No slabs found for selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Riders Tab */}
      {activeTab === 'riders' && (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-amber-50 flex items-center gap-2">
            <span className="text-amber-600 font-bold text-sm">⚡ Rider / Docking Rules</span>
            <span className="text-xs text-amber-600">These multipliers apply to base incentive amounts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Role / Criteria</th>
                  <th className="px-4 py-3 font-medium">Docking Condition</th>
                  <th className="px-4 py-3 font-medium text-right">Payout Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {data.riders.map((rider, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{rider.role}</td>
                    <td className="px-4 py-2.5 text-slate-600">{String(rider.docking)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-bold text-sm ${
                        typeof rider.payout === 'number' && rider.payout >= 1 ? 'text-emerald-600' :
                        typeof rider.payout === 'number' && rider.payout > 0 ? 'text-amber-600' :
                        typeof rider.payout === 'string' ? 'text-blue-600' : 'text-red-500'
                      }`}>
                        {typeof rider.payout === 'number' ? `${rider.payout}x` : String(rider.payout)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
