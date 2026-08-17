"use client";
import React, { useState, useEffect } from 'react';
import { Scale, Clock, CheckCircle2, XCircle, User, Calendar } from 'lucide-react';

export function SettlementHistoryModal({ lead }: { lead: any }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!lead?.id) return;
    setLoading(true);
    fetch(`/api/settlements?customerId=${lead.id}&status=all&page=${page}&limit=${limit}`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.data || []);
        setData(list);
        setTotal(d?.total || list.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lead?.id, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  const STATUS_MAP: any = {
    Raised: { color: 'text-amber-700 bg-amber-50 border-amber-300', label: 'RAISED', icon: <Clock size={12}/> },
    Approve: { color: 'text-emerald-700 bg-emerald-50 border-emerald-300', label: 'APPROVED', icon: <CheckCircle2 size={12}/> },
    Rejected: { color: 'text-red-700 bg-red-50 border-red-300', label: 'REJECTED', icon: <XCircle size={12}/> },
    Pending: { color: 'text-blue-700 bg-blue-50 border-blue-300', label: 'PENDING', icon: <Clock size={12}/> },
  };

  return (
    <div className="p-4 space-y-3">
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading settlement history...</div>
      ) : data.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <Scale className="mx-auto h-6 w-6 opacity-40 mb-1" />
          <p className="text-xs">No settlement history found for this customer.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {data.map((s: any) => {
              const cfg = STATUS_MAP[s.status] || { color: 'text-slate-700 bg-slate-100 border-slate-300', label: s.status, icon: null };
              return (
                <div key={s.id} className="bg-white border border-slate-200 p-3 shadow-2xs rounded-none space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{s.reason}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-1.5 py-0.2 border border-red-200 rounded-none">
                          ₹{Number(s.amount).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Settlement Amount</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-none flex items-center gap-1 ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-2 text-xs text-slate-600 rounded-none">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Agent Justification</p>
                    <p className="italic">"{s.justification || 'No justification provided'}"</p>
                    {s.remarks && (
                      <div className="border-t border-slate-200 mt-1.5 pt-1">
                        <p className="text-[10px] text-blue-700 font-bold uppercase mb-0.5">Manager Response</p>
                        <p className="font-semibold text-slate-800">{s.remarks}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-600"><User size={11} /> {s.agent?.name || 'Agent'}</span>
                    <span className="flex items-center gap-1 font-mono"><Calendar size={11} /> {new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2 text-xs">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-none disabled:opacity-40 font-semibold">Prev</button>
              <span className="font-mono text-[11px] text-slate-600">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-none disabled:opacity-40 font-semibold">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
