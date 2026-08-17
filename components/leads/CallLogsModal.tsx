"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Inbox, Calendar, Phone, PhoneOff, Star } from 'lucide-react';
import { CONNECT_STATUS_COLORS, PAGE_SIZE } from './constants';

export function CallLogsModal({ lead }: { lead: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ rpcCount: 0, ptpCount: 0, ncCount: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterCS, setFilterCS] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!lead?.id) return;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: PAGE_SIZE.toString()
        });
        if (filterCS) query.append('status', filterCS);
        if (search) query.append('search', search);

        const res = await fetch(`/api/leads/${lead.id}/call-logs?${query.toString()}`);
        const data = await res.json();
        if (data?.logs) {
          setLogs(data.logs);
          setTotalCount(data.totalCount || 0);
          if (data.stats) setStats(data.stats);
        } else if (Array.isArray(data)) {
          setLogs(data);
          setTotalCount(data.length);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, [lead?.id, page, filterCS, search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="p-4 space-y-3">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total Calls', val: totalCount, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'RPC', val: stats.rpcCount, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'PTP', val: stats.ptpCount, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Not Connected', val: stats.ncCount, color: 'text-slate-700 bg-slate-100 border-slate-200' },
        ].map(s => (
          <div key={s.label} className={`border p-2 text-center rounded-none ${s.color}`}>
            <div className="text-base font-bold">{s.val}</div>
            <div className="text-[9px] uppercase font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex gap-2 items-center text-xs">
        <input
          className="flex-1 px-2.5 py-1 text-xs border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none"
          placeholder="Search interaction logs..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold rounded-none outline-none focus:border-blue-500"
          value={filterCS}
          onChange={e => { setFilterCS(e.target.value); setPage(1); }}
        >
          <option value="">All Connect Statuses</option>
          {Object.keys(CONNECT_STATUS_COLORS).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* Logs Stream */}
      <div className="border border-slate-200 bg-white max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-none text-xs">
        {loading ? (
          <div className="p-6 text-center text-slate-400">Loading call logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-slate-400"><Inbox className="mx-auto h-5 w-5 mb-1 opacity-40" />No call logs recorded.</div>
        ) : (
          logs.map((log) => {
            const d = log.details as any;
            const csColor = CONNECT_STATUS_COLORS[d?.connectStatus] || '#64748b';
            return (
              <div key={log.id} className="p-2.5 hover:bg-slate-50 space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[10px] px-1.5 py-0.2 border rounded-none uppercase" style={{ color: csColor, borderColor: `${csColor}40`, backgroundColor: `${csColor}15` }}>
                      {d?.connectStatus || 'Call Log'}
                    </span>
                    <span className="font-semibold text-slate-800">{d?.disposition} {d?.subDisposition ? `• ${d.subDisposition}` : ''}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                </div>
                {d?.remarks && <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 border border-slate-100 italic">"{d.remarks}"</p>}
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>Agent: <strong className="text-slate-700">{log.user?.name || 'Agent'}</strong></span>
                  {d?.amount && <span className="font-mono text-emerald-700 font-bold">Amount: ₹{Number(d.amount).toLocaleString('en-IN')}</span>}
                  {d?.date && <span>PTP Date: {d.date}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-1 text-xs">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded-none disabled:opacity-40 font-semibold">Prev</button>
          <span className="font-mono text-[11px] text-slate-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-0.5 bg-white border border-slate-300 text-slate-700 rounded-none disabled:opacity-40 font-semibold">Next</button>
        </div>
      )}
    </div>
  );
}
