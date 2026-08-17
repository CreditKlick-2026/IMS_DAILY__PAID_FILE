"use client";
import React from 'react';
import { FileSpreadsheet, Users, Download, Trash2, ChevronDown, ChevronUp, Calendar, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

interface AdminUploadedExcelsProps {
  filterLocation: string;
  setFilterLocation: (l: string) => void;
  locationOptions: any[];
  filterClient: string;
  setFilterClient: (c: string) => void;
  clientOptions: any[];
  deleteMonth: number;
  setDeleteMonth: (m: number) => void;
  deleteYear: number;
  setDeleteYear: (y: number) => void;
  excels: any[];
  excelsLoading: boolean;
  expandedUser: string | null;
  setExpandedUser: (u: string | null) => void;
  onDeleteExcel: (id: string) => void;
  onClearFilters: () => void;
}

export function AdminUploadedExcels({
  filterLocation,
  setFilterLocation,
  locationOptions,
  filterClient,
  setFilterClient,
  clientOptions,
  deleteMonth,
  setDeleteMonth,
  deleteYear,
  setDeleteYear,
  excels = [],
  excelsLoading,
  expandedUser,
  setExpandedUser,
  onDeleteExcel,
  onClearFilters
}: AdminUploadedExcelsProps) {
  const safeExcels = Array.isArray(excels) ? excels : [];
  const filteredExcels = safeExcels.filter((j: any) => j.job_type !== 'KEKA' && j.status !== 'DELETED_BY_ADMIN');
  
  const groupedExcels = filteredExcels.reduce((acc: any, job: any) => {
    const user = job.uploaded_by_name || job.uploaded_by_employee_id || 'Unknown Operator';
    if (!acc[user]) acc[user] = [];
    acc[user].push(job);
    return acc;
  }, {});

  const totalRecords = filteredExcels.reduce((acc: number, j: any) => acc + (j.processed_rows || j.total_rows || 0), 0);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/50">
      {/* Header Toolbar */}
      <div className="bg-white p-4 border border-slate-200 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#024e4d] text-white shrink-0 shadow-2xs">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Uploaded DPF Excels</h1>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
                {filteredExcels.length} Files ({totalRecords.toLocaleString()} Records)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Filter by month, year, location & purge collection files.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={filterLocation}
            onChange={(e) => { setFilterLocation(e.target.value); setFilterClient(''); }}
          >
            <option value="">All Locations</option>
            {locationOptions.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
          </select>

          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
          >
            <option value="">All Clients</option>
            {Array.from(new Set(clientOptions.map((p: any) => p.name))).sort().map((name: any) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Month Selector */}
          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={deleteMonth}
            onChange={(e) => setDeleteMonth(parseInt(e.target.value))}
          >
            <option value={0}>All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            className="px-2.5 py-1.5 text-xs font-semibold border border-slate-300 bg-slate-50 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700"
            value={deleteYear}
            onChange={(e) => setDeleteYear(parseInt(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            onClick={onClearFilters}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-none transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grouped Accordions by Operator */}
      <div className="space-y-3">
        {excelsLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-slate-200 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-64" />
              </div>
            ))}
          </div>
        ) : Object.keys(groupedExcels).length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 text-slate-500 text-xs">
            No uploaded DPF Excels found for the selected month/year/filters.
          </div>
        ) : (
          Object.keys(groupedExcels).map((userName) => {
            const userJobs = groupedExcels[userName];
            const isExpanded = expandedUser === null ? true : expandedUser === userName;

            return (
              <div key={userName} className="border border-slate-200 bg-white shadow-2xs overflow-hidden">
                <div
                  onClick={() => setExpandedUser(expandedUser === userName ? 'NONE' : userName)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer border-b border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#024e4d] text-white shadow-xs">
                      <Users size={14} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900">{userName}</h3>
                      <p className="text-[10px] text-slate-500">{userJobs.length} uploaded files</p>
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] text-slate-600 uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Filename</th>
                          <th className="px-3 py-2">Target Date</th>
                          <th className="px-3 py-2">Upload Timestamp</th>
                          <th className="px-3 py-2">Location</th>
                          <th className="px-3 py-2">Client</th>
                          <th className="px-3 py-2">Product</th>
                          <th className="px-3 py-2 text-right font-mono">Records</th>
                          <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userJobs.map((job: any) => (
                          <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-2 font-mono font-semibold text-slate-800">
                              {job.file_name || job.filename || job.file_path || 'DPF_FILE.xlsx'}
                            </td>
                            <td className="px-3 py-2 font-semibold text-teal-800">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-teal-600 shrink-0" />
                                {job.target_date || new Date(job.created_at).toLocaleDateString('en-GB')}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">
                              {job.created_at ? new Date(job.created_at).toLocaleString('en-GB') : '—'}
                            </td>
                            <td className="px-3 py-2 text-slate-600">{job.location_name || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{job.client_name || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{job.product_type || '—'}</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-teal-800">
                              {job.processed_rows || job.total_rows || 0}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {job.file_path && (
                                  <a
                                    href={job.file_path}
                                    download
                                    className="p-1.5 text-slate-400 hover:text-teal-700 transition-colors"
                                    title="Download File"
                                  >
                                    <Download size={13} />
                                  </a>
                                )}
                                <button
                                  onClick={() => onDeleteExcel(job.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete File & Purge Database Records"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
