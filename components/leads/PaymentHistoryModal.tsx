"use client";
import React, { useState, useEffect } from 'react';
import { Inbox } from 'lucide-react';

export function PaymentHistoryModal({ lead }: { lead: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    if (!lead?.id) return;
    setLoading(true);
    fetch(`/api/leads/${lead.id}/payments?page=${page}&limit=${LIMIT}&status=${statusFilter}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lead?.id, page, statusFilter]);

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
    cleared: { label: 'Cleared', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    pending_approval: { label: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  };

  const payments = data?.payments || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="p-4 space-y-3">
      {/* Summary KPI cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total Payments', val: data?.summary?.count || 0, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Cleared', val: data?.summary?.clearedCount || 0, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Pending', val: data?.summary?.pendingCount || 0, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Rejected', val: data?.summary?.rejectedCount || 0, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        ].map(s => (
          <div key={s.label} className={`border p-2 text-center rounded-none ${s.bg}`}>
            <div className={`text-base font-bold ${s.color}`}>{s.val}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center text-xs">
        <select
          className="border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold rounded-none outline-none focus:border-blue-500"
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="cleared">Cleared</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="text-[11px] text-slate-400 font-mono">{data?.total || 0} total records</div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden rounded-none max-h-72 overflow-y-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Mode</th>
              <th className="px-3 py-2">Ref No</th>
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400">Loading payment records...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-slate-400"><Inbox className="mx-auto h-5 w-5 mb-1 opacity-50" />No payments found.</td></tr>
            ) : (
              payments.map((p: any, idx: number) => {
                const cfg = STATUS_CFG[p.status] || { label: p.status, color: '#64748b', bg: '#f1f5f9' };
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-slate-400 text-[11px]">{(page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{p.date}</td>
                    <td className="px-3 py-2 font-mono font-bold text-emerald-600">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2 text-slate-600">{p.mode}</td>
                    <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{p.ref || '—'}</td>
                    <td className="px-3 py-2 text-slate-700">{p.agent?.name || '—'}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-none border" style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2 text-xs">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-none disabled:opacity-40 font-semibold">Prev</button>
          <span className="font-mono text-[11px] text-slate-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-none disabled:opacity-40 font-semibold">Next</button>
        </div>
      )}
    </div>
  );
}
