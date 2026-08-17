"use client";
import React from 'react';
import { Eye } from 'lucide-react';

interface IncentiveTableProps {
  loading: boolean;
  paginatedData: any[];
  uiConfig: { columns: string[]; filters: string[] };
  selectedRecord: any;
  setSelectedRecord: (r: any) => void;
  page: number;
  pageSize: number;
}

export function IncentiveTable({
  loading,
  paginatedData,
  uiConfig,
  selectedRecord,
  setSelectedRecord,
  page,
  pageSize
}: IncentiveTableProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

  const defaultCols = ['Employee', 'Designation', 'AM Name', 'TL Name', 'APH', 'PH', 'Collection', 'Vintage', 'Incentive'];
  const columns = uiConfig.columns?.length > 0 ? uiConfig.columns : defaultCols;

  const getCellValue = (row: any, col: string) => {
    const colKey = col.toLowerCase().replace(/[\s_-]+/g, '');
    if (colKey === 'employeecode' || colKey === 'employeeid' || colKey === 'empid') {
      return row.employee_code || row.employee_id || '—';
    }
    if (colKey === 'employeename' || colKey === 'empname' || colKey === 'name') {
      return row.employee_name || row.name || '—';
    }
    if (colKey === 'moneycollected' || colKey === 'totalcollection' || colKey === 'collection') {
      const val = row.money_collected ?? row.total_collection ?? row.collection;
      return typeof val === 'number' ? formatCurrency(val) : (val || '—');
    }
    if (colKey === 'am' || colKey === 'amname') {
      return row.am || row.am_name || '—';
    }
    if (colKey === 'tl' || colKey === 'tlname') {
      return row.tl_name || row.tl || '—';
    }
    if (colKey === 'aph') return row.aph || '—';
    if (colKey === 'ph') return row.ph || '—';
    if (colKey === 'bucket') return row.bucket || '—';
    if (colKey === 'paymentmode') return row.payment_mode || '—';
    if (colKey === 'designation') return row.designation || '—';
    if (colKey === 'incentive' || colKey === 'finalincentive') {
      const val = row.final_incentive ?? row.incentive;
      return typeof val === 'number' ? formatCurrency(val) : (val || '—');
    }
    const direct = row[col] ?? row[col.toLowerCase()] ?? row[col.toLowerCase().replace(/\s+/g, '_')];
    if (direct !== undefined && direct !== null) {
      return typeof direct === 'number' ? formatCurrency(direct) : String(direct);
    }
    return '—';
  };

  return (
    <div className="flex-1 overflow-auto bg-white border-t border-slate-200">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-500 text-[10px] uppercase font-semibold">
          <tr>
            <th className="px-3 py-2.5 whitespace-nowrap">#</th>
            {uiConfig.columns?.length > 0 ? (
              uiConfig.columns.map(c => (
                <th key={c} className="px-3 py-2.5 whitespace-nowrap">{c.replace(/_/g, ' ')}</th>
              ))
            ) : (
              defaultCols.map(c => (
                <th key={c} className="px-3 py-2.5 whitespace-nowrap">{c}</th>
              ))
            )}
            <th className="px-3 py-2.5 text-right whitespace-nowrap">Incentive</th>
            <th className="px-3 py-2.5 text-center whitespace-nowrap">Trace</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: (columns.length || 8) + 3 }).map((_, j) => (
                  <td key={j} className="px-3 py-3 whitespace-nowrap">
                    <div className="h-3 bg-slate-100 rounded-none w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : !paginatedData.length ? (
            <tr>
              <td colSpan={columns.length + 3} className="p-8 text-center text-slate-400">
                No matching employee incentive records found.
              </td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => {
              const rowNum = (page - 1) * pageSize + idx + 1;
              const isSelected = selectedRecord?.employee_id === row.employee_id;
              
              const totalDays = row.doc ? Math.floor((new Date().getTime() - new Date(row.doc).getTime()) / (1000 * 60 * 60 * 24)) : null;
              let vintage = '—';
              if (totalDays !== null) {
                if (totalDays <= 30) vintage = '0-30';
                else if (totalDays <= 60) vintage = '31-60';
                else if (totalDays <= 90) vintage = '61-90';
                else if (totalDays <= 120) vintage = '91-120';
                else vintage = '120+';
              }

              return (
                <tr
                  key={`${row.employee_id || row.employee_code || 'row'}-${row.location || ''}-${row.client || ''}-${idx}`}
                  onClick={() => setSelectedRecord(row)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-blue-50/60 font-semibold' : ''}`}
                >
                  <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">{rowNum}</td>
                  {uiConfig.columns?.length > 0 ? (
                    uiConfig.columns.map(col => {
                      const valStr = getCellValue(row, col);
                      return (
                        <td key={col} className="px-3 py-2 text-slate-700 whitespace-nowrap font-medium">
                          {valStr}
                        </td>
                      );
                    })
                  ) : (
                    <>
                      <td className="px-3 py-2 text-slate-900 font-bold whitespace-nowrap">
                        {row.name || row.employee_name} <span className="text-[10px] text-slate-400 font-mono">({row.employee_id || row.employee_code})</span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.designation || '—'}</td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.am_name || row.am || '—'}</td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.tl_name || row.tl || '—'}</td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.aph || '—'}</td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.ph || '—'}</td>
                      <td className="px-3 py-2 text-emerald-700 font-mono font-bold whitespace-nowrap">{formatCurrency(row.total_collection || row.money_collected)}</td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap font-mono">{vintage}</td>
                    </>
                  )}
                  <td className="px-3 py-2 text-right text-emerald-700 font-mono font-black whitespace-nowrap text-xs">
                    {formatCurrency(row.final_incentive || row.incentive)}
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedRecord(row); }}
                      className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                      title="Inspect Rules Trace"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
