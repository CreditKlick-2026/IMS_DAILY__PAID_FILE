"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, XCircle, BarChart2 } from 'lucide-react';

export function PaymentSummaryModal({ lead }: { lead: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lead?.id) return;
    setLoading(true);
    fetch(`/api/leads/${lead.id}/payments`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [lead?.id]);

  const s = data?.summary || {};
  const outstanding = lead?.outstanding || 0;
  const recovered = s.cleared || 0;
  const recoveryPct = outstanding > 0 ? Math.min(100, (recovered / outstanding) * 100) : 0;

  const monthlyData: Record<string, number> = {};
  (data?.payments || []).filter((p: any) => p.status === 'cleared').forEach((p: any) => {
    const m = p.date?.substring(0, 7) || 'Unknown';
    monthlyData[m] = (monthlyData[m] || 0) + p.amount;
  });
  const months = Object.keys(monthlyData).sort().slice(-6);
  const maxMonthly = Math.max(...months.map(m => monthlyData[m]), 1);

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading payment summary...</div>
      ) : (
        <>
          {/* Top KPI Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Collected', val: `₹${Number(s.cleared || 0).toLocaleString('en-IN')}`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={18} className="text-emerald-600"/>, note: `${s.clearedCount || 0} cleared payments` },
              { label: 'Pending Approval', val: `₹${Number(s.pending || 0).toLocaleString('en-IN')}`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock size={18} className="text-amber-600"/>, note: `${s.pendingCount || 0} pending payments` },
              { label: 'Rejected Amount', val: `₹${Number(s.rejected || 0).toLocaleString('en-IN')}`, color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <XCircle size={18} className="text-red-600"/>, note: `${s.rejectedCount || 0} rejected payments` },
            ].map(k => (
              <div key={k.label} className={`border p-3 rounded-none ${k.bg}`}>
                <div className="mb-1">{k.icon}</div>
                <div className={`text-base font-bold font-mono ${k.color}`}>{k.val}</div>
                <div className="text-xs font-semibold text-slate-800">{k.label}</div>
                <div className="text-[10px] text-slate-500">{k.note}</div>
              </div>
            ))}
          </div>

          {/* Recovery Progress */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-none space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-slate-900">Recovery Progress</div>
                <div className="text-[11px] text-slate-500">
                  Outstanding: ₹{Number(outstanding).toLocaleString('en-IN')} • Collected: ₹{Number(recovered).toLocaleString('en-IN')}
                </div>
              </div>
              <div className={`text-xl font-black font-mono ${recoveryPct >= 75 ? 'text-emerald-600' : recoveryPct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {recoveryPct.toFixed(1)}%
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-none overflow-hidden">
              <div style={{ width: `${recoveryPct}%` }} className={`h-full ${recoveryPct >= 75 ? 'bg-emerald-600' : recoveryPct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
            </div>
          </div>

          {/* Monthly Collections */}
          {months.length > 0 ? (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-none">
              <div className="text-xs font-bold text-slate-900 mb-3">Monthly Collections (Last 6 Months)</div>
              <div className="flex items-end gap-2 h-24 pt-2">
                {months.map(m => {
                  const val = monthlyData[m];
                  const h = Math.max(8, (val / maxMonthly) * 75);
                  const [yr, mo] = m.split('-');
                  const label = new Date(parseInt(yr), parseInt(mo) - 1).toLocaleString('default', { month: 'short' });
                  return (
                    <div key={m} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono font-bold text-emerald-700">₹{(val / 1000).toFixed(0)}K</span>
                      <div style={{ height: `${h}px` }} className="w-full bg-emerald-600 rounded-none shadow-2xs" />
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400">
              <BarChart2 className="mx-auto h-6 w-6 opacity-40 mb-1" />
              <p className="text-xs">No cleared monthly payments found yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
