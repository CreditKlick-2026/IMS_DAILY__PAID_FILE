"use client";
import React, { useState } from 'react';
import { Search, XCircle, ChevronDown } from 'lucide-react';

interface CustomerDashHeaderProps {
  selectedLead: any;
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  setFilterTab: (t: string) => void;
  profileCols: any[];
}

export function CustomerDashHeader({
  selectedLead,
  loading,
  search,
  setSearch,
  setFilterTab,
  profileCols
}: CustomerDashHeaderProps) {
  const [openAltIdx, setOpenAltIdx] = useState<number | null>(null);

  return (
    <div className="bg-white border border-slate-200/90 p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Left Side: Selected Lead */}
        <div className="flex items-center gap-3 min-w-0">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 animate-pulse rounded-none" />
              <div className="space-y-1">
                <div className="w-32 h-4 bg-slate-100 animate-pulse" />
                <div className="w-48 h-3 bg-slate-100 animate-pulse" />
              </div>
            </div>
          ) : !selectedLead ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Search size={16} />
              <span>Search and select a collection record below to view details</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#024e4d] text-white font-bold flex items-center justify-center text-sm shadow-2xs rounded-none">
                {selectedLead.name?.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{selectedLead.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {(selectedLead.account_no || '').replace(/LN-|-/g, '')} • {selectedLead.product || 'Personal Loan'} • {selectedLead.client || 'Bank'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Quick Search Bar */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-slate-50 focus:bg-white outline-none focus:border-teal-600 rounded-none transition-colors"
              placeholder="Search account, mobile, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setSearch(''); setFilterTab('all'); }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs rounded-none"
          >
            <XCircle size={13} className="text-slate-500" /> Clear
          </button>
        </div>
      </div>

      {/* Grid of Profile Fields */}
      {selectedLead && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          {(profileCols.length > 0 ? profileCols : [
            { label: 'ACCOUNT NUMBER', key: 'account_no' },
            { label: 'MOBILE NUMBER', key: 'mobile' },
            { label: 'OUTSTANDING', key: 'outstanding', type: 'amount' }
          ]).map((item: any, i: number) => {
            const lowerKey = item.key?.toLowerCase();
            let rawVal = selectedLead[item.key] ?? selectedLead[lowerKey]
              ?? selectedLead.metadata?.[item.key] ?? selectedLead.metadata?.[lowerKey]
              ?? selectedLead.metadata?.[item.label] ?? '—';
              
            if (rawVal === '—' || rawVal == null || rawVal === '') {
              if (lowerKey === 'employee_name') rawVal = selectedLead.name ?? '—';
              else if (lowerKey === 'money_collected') rawVal = selectedLead.outstanding ?? '—';
              else if (lowerKey === 'am') rawVal = selectedLead.agent ?? '—';
            }
            
            let val = (rawVal && typeof rawVal === 'object') ? (rawVal.name || rawVal.label || '—') : rawVal;

            const isCardField = item.label?.toLowerCase().includes('card') || lowerKey?.includes('card');
            if (isCardField && typeof val === 'string' && val.length > 4) {
              val = 'XXXX ' + val.slice(-4);
            }

            const isMobile = lowerKey === 'mobile' || lowerKey === 'mobile_number' || lowerKey === 'mobile_no';
            const allAlts = Array.from(new Set([
              selectedLead.alt_mobile,
              selectedLead.alt_mobile_2,
              selectedLead.alt_mobile_3,
              selectedLead.alt_mobile_4,
              selectedLead.metadata?.alt_mobile
            ])).filter(n => n && n !== '—' && n !== val);

            return (
              <div key={i} className="p-2 bg-slate-50 border border-slate-200 rounded-none relative">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  <span className="truncate">{item.label}</span>
                  {isMobile && allAlts.length > 0 && (
                    <div
                      className="cursor-pointer text-teal-700 p-0.5"
                      onClick={(e) => { e.stopPropagation(); setOpenAltIdx(openAltIdx === i ? null : i); }}
                    >
                      <ChevronDown size={11} className={openAltIdx === i ? 'rotate-180' : ''} />
                    </div>
                  )}
                </div>
                <div className={`text-xs font-bold truncate ${item.type === 'amount' ? 'text-emerald-700 font-mono' : 'text-slate-900'}`}>
                  {item.type === 'amount' ? `₹${Number(val).toLocaleString('en-IN')}` :
                    lowerKey === 'account_no' ? String(val).replace(/LN-|-/g, '') :
                      (lowerKey === 'createdat' || lowerKey === 'upload_at') ? String(val).split('T')[0] :
                        String(val)}
                </div>

                {isMobile && allAlts.length > 0 && openAltIdx === i && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-300 shadow-2xl p-2 z-50 min-w-[160px] text-xs rounded-none">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Alternate Numbers</p>
                    {allAlts.map((alt, idx) => (
                      <div key={idx} className="py-1 border-t border-slate-100 text-slate-700 font-mono">{String(alt)}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
