"use client";
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface LeadsTableProps {
  leads: any[];
  tableCols: any[];
  loading: boolean;
  selectedLead: any;
  setSelectedLead: (l: any) => void;
  duplicateOnly?: boolean;
  userRole?: string;
  onEditRecord: (l: any) => void;
  onDeleteRecord: (id: string) => void;
  onTransferRecord: (id: string) => void;
}

export function LeadsTable({
  leads,
  tableCols,
  loading,
  selectedLead,
  setSelectedLead,
  duplicateOnly,
  userRole,
  onEditRecord,
  onDeleteRecord,
  onTransferRecord
}: LeadsTableProps) {
  return (
    <div className="flex-1 overflow-auto bg-white border-t border-slate-200">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-500 text-[10px] uppercase font-semibold">
          <tr>
            {tableCols.length > 0 ? tableCols.map(col => (
              <th key={col.key} className="px-3.5 py-2.5 whitespace-nowrap">
                {col.label}
              </th>
            )) : (
              <>
                <th className="px-3.5 py-2.5 whitespace-nowrap">Account Number</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap">Customer Name</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap">Money Collected</th>
                <th className="px-3.5 py-2.5 whitespace-nowrap">Assigned To</th>
              </>
            )}
            {userRole === 'admin' && (
              <th className="px-3.5 py-2.5 text-right whitespace-nowrap">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: (tableCols.length || 4) + 1 }).map((_, j) => (
                  <td key={j} className="px-3.5 py-3 whitespace-nowrap">
                    <div className="h-3 bg-slate-100 rounded-none w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : leads.map(lead => (
            <tr 
              key={lead.id} 
              onClick={() => setSelectedLead(lead)} 
              className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                selectedLead?.id === lead.id ? 'bg-teal-50/80 font-semibold border-l-4 border-l-[#024e4d]' : ''
              }`}
            >
              {tableCols.length > 0 ? tableCols.map(col => {
                const lowerKey = col.key?.toLowerCase();
                let rawVal = lead[col.key] ?? lead[lowerKey]
                  ?? lead.metadata?.[col.key] ?? lead.metadata?.[lowerKey]
                  ?? lead.metadata?.[col.label] ?? '—';
                  
                if (rawVal === '—' || rawVal == null || rawVal === '') {
                  if (lowerKey === 'employee_name') rawVal = lead.name ?? '—';
                  else if (lowerKey === 'money_collected') rawVal = lead.outstanding ?? '—';
                  else if (lowerKey === 'am') rawVal = lead.agent ?? lead.am ?? '—';
                  else if (lowerKey === 'lan' || lowerKey === 'account no') rawVal = lead.account_no ?? '—';
                  else if (lowerKey === 'mobile_no' || lowerKey === 'mobile no') rawVal = lead.mobile_no ?? '—';
                }
                
                const val = (rawVal && typeof rawVal === 'object') ? (rawVal.name || rawVal.label || '—') : rawVal;
                return (
                  <td key={col.key} className={`px-3.5 py-2.5 whitespace-nowrap ${col.type === 'amount' ? 'text-emerald-700 font-mono font-bold' : 'text-slate-800'}`}>
                    {(lowerKey === 'settlement' || lowerKey.includes('settlement')) ? (
                      lead.settlements && lead.settlements.length > 0 ? (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-none border border-slate-300">
                          {lead.settlements[0].status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )
                    ) : col.type === 'amount' ? `₹${Number(val).toLocaleString('en-IN')}` :
                      lowerKey === 'account_no' ? String(val).replace(/LN-|-/g, '') :
                        (lowerKey === 'createdat' || lowerKey === 'upload_at') ? String(val).split('T')[0] :
                          (lowerKey.includes('card') || col.label?.toLowerCase().includes('card')) && String(val).length > 4 ? 
                            'XXXX ' + String(val).slice(-4) : 
                            String(val)}
                  </td>
                );
              }) : (
                <>
                  <td className="px-3.5 py-2.5 font-mono text-slate-900 font-bold whitespace-nowrap">{String(lead.account_no || '').replace(/LN-|-/g, '')}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{lead.name}</td>
                  <td className="px-3.5 py-2.5 font-mono text-emerald-700 font-bold whitespace-nowrap">₹{lead.outstanding?.toLocaleString('en-IN')}</td>
                  <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">{lead.agent || 'Unassigned'}</td>
                </>
              )}
              {userRole === 'admin' && (
                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {duplicateOnly && (
                      <button onClick={(e) => { e.stopPropagation(); onTransferRecord(lead.id); }} className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold rounded-none hover:bg-teal-100 cursor-pointer">Approve</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onEditRecord(lead); }} className="text-slate-400 hover:text-teal-700 p-1 cursor-pointer" title="Edit"><Edit size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteRecord(lead.id); }} className="text-slate-400 hover:text-red-600 p-1 cursor-pointer" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
