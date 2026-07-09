"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, Node, Edge, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Loader2, Calculator, Settings2, Wallet, Percent, User } from 'lucide-react';

// ── Icon resolver (icons can't be serialised through JSON so we map by name) ─
const iconMap: Record<string, React.ReactNode> = {
  user: <User className="w-6 h-6" />,
  settings: <Settings2 className="w-6 h-6" />,
  percent: <Percent className="w-6 h-6" />,
  wallet: <Wallet className="w-6 h-6" />,
  calculator: <Calculator className="w-6 h-6" />,
};

// ── Custom React Flow node ───────────────────────────────────────────────────
const CustomNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 min-w-[320px] overflow-hidden relative">
    <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-400 border-2 border-white" />
    <div className={`absolute top-0 left-0 w-full h-1.5 ${data.stripeColor || 'bg-slate-200'}`}></div>
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${data.color || 'bg-slate-100 text-slate-600'}`}>
        {iconMap[data.icon] ?? <Calculator className="w-6 h-6" />}
      </div>
      <h3 className="font-black text-lg text-slate-800 tracking-tight">{data.title}</h3>
    </div>
    <div className="text-sm text-slate-600 leading-relaxed font-medium space-y-1">
      {data.content && data.content.split('\n').map((line: string, i: number) => {
        if (line.includes(':')) {
          const idx = line.indexOf(':');
          const k = line.slice(0, idx);
          const v = line.slice(idx + 1);
          return (
            <div key={i} className="flex justify-between items-center">
              <span className="text-slate-400">{k}</span>
              <span className="font-bold text-slate-800">{v}</span>
            </div>
          );
        }
        return <div key={i}>{line}</div>;
      })}
    </div>
    {data.tableData && (
      <div className="mt-4 rounded-lg overflow-hidden border border-slate-200">
        {data.tableData.title && (
          <h4 className="text-[11px] font-bold text-slate-700 mb-1.5 bg-slate-100 px-2 py-1 inline-block rounded">
            {data.tableData.title}
          </h4>
        )}
        <table className="w-full text-[11px] text-center border-collapse">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              {data.tableData.headers.map((h: string, idx: number) => (
                <th key={idx} className="border border-slate-200 p-1.5 font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.tableData.rows.map((row: any, rIdx: number) => (
              <tr key={rIdx} className={row.highlighted ? 'bg-amber-50' : ''}>
                {row.cells.map((c: any, cIdx: number) => (
                  <td key={cIdx} className={`border border-slate-200 p-1.5 ${c.highlighted ? 'bg-amber-200 font-bold text-amber-900' : 'text-slate-600'}`}>
                    {c.val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {data.tables && data.tables.map((tbl: any, tIdx: number) => (
      <div key={tIdx} className="mt-4">
        {tbl.title && <h4 className="text-[11px] font-bold text-slate-700 mb-1.5 bg-slate-100 px-2 py-1 rounded inline-block">{tbl.title}</h4>}
        <div className="rounded-lg overflow-hidden border border-slate-200">
          <table className="w-full text-[11px] text-center border-collapse">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                {tbl.headers.map((h: string, idx: number) => (
                  <th key={idx} className="border border-slate-200 p-1.5 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tbl.rows.map((row: any, rIdx: number) => (
                <tr key={rIdx} className={row.highlighted ? 'bg-amber-50' : ''}>
                  {row.cells.map((c: any, cIdx: number) => (
                    <td key={cIdx} className={`border border-slate-200 p-1.5 ${c.highlighted ? 'bg-amber-200 font-bold text-amber-900' : 'text-slate-600'}`}>
                      {c.val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
    <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-400 border-2 border-white" />
  </div>
);

const nodeTypes = { custom: CustomNode };

// ── Main component — now a thin API client ───────────────────────────────────
export default function TraceEngine({
  record,
  onClose,
}: {
  record: any;
  onClose: () => void;
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrace = useCallback(async (rec: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rec),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Unknown error from server');
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (e: any) {
      setError(e.message || 'Failed to load trace data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (record) fetchTrace(record);
  }, [record, fetchTrace]);

  return (
    <div className="flex flex-col h-[50vh] bg-slate-50 w-full border-b border-slate-200 shadow-inner relative">
      {/* Close */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onClose}
          className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-100 shadow-sm transition-colors text-slate-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Header badge */}
      <div className="absolute top-4 left-6 z-10 bg-white/80 backdrop-blur-md px-2 py-1 rounded border border-slate-200 shadow-sm pointer-events-none">
        <h2 className="text-[10px] font-bold text-slate-800 leading-tight">Incentive Trace Engine</h2>
        <p className="text-[8px] font-medium text-slate-400 uppercase tracking-wide">
          {record?.name} ({record?.employee_id})
        </p>
      </div>

      {/* Refresh button */}
      <div className="absolute top-4 right-14 z-20">
        <button
          onClick={() => record && fetchTrace(record)}
          disabled={loading}
          title="Re-fetch latest calculation"
          className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-blue-50 shadow-sm transition-colors text-slate-500 disabled:opacity-50"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Fetching latest calculation…</p>
              <p className="text-xs text-slate-400">Pulling fresh data from backend</p>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center max-w-sm shadow-lg">
              <p className="text-sm font-bold text-blue-700 mb-1">Trace Engine Error</p>
              <p className="text-xs text-blue-500">{error}</p>
              <button
                onClick={() => record && fetchTrace(record)}
                className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50/50"
        >
          <Background color="#cbd5e1" gap={20} size={2} />
          <Controls className="bg-white border-slate-200 shadow-lg rounded-xl overflow-hidden" />
        </ReactFlow>
      </div>
    </div>
  );
}
