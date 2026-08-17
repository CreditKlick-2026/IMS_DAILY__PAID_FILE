"use client";
import React from 'react';
import { Search, UserCheck, ShieldAlert } from 'lucide-react';

interface SpecialEmployeeTableProps {
  employees: any[];
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  page: number;
  setPage: (p: number) => void;
  total: number;
  limit: number;
  onToggleSpecial: (empId: string, currentStatus: boolean) => void;
}

export function SpecialEmployeeTable({
  employees,
  loading,
  search,
  setSearch,
  page,
  setPage,
  total,
  limit,
  onToggleSpecial
}: SpecialEmployeeTableProps) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col rounded-none">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Employee Special Case Overrides</h3>
          <p className="text-[11px] text-slate-500">Enable individual overrides for employees to qualify for special exception tiers.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name / code..."
            className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2 font-semibold">Employee Code</th>
              <th className="px-3.5 py-2 font-semibold">Employee Name</th>
              <th className="px-3.5 py-2 font-semibold">Designation</th>
              <th className="px-3.5 py-2 font-semibold">Location</th>
              <th className="px-3.5 py-2 font-semibold text-right">Special Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading employees...</span>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No employees found matching search criteria.
                </td>
              </tr>
            ) : (
              employees.map((emp, idx) => (
                <tr key={`${emp.employee_id || 'emp'}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono text-slate-900 font-bold">{emp.employee_id}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-slate-800">{emp.name}</td>
                  <td className="px-3.5 py-2.5 text-slate-600">{emp.designation || '—'}</td>
                  <td className="px-3.5 py-2.5 text-slate-600">{emp.location || '—'}</td>
                  <td className="px-3.5 py-2.5 text-right">
                    <button
                      onClick={() => onToggleSpecial(emp.employee_id, Boolean(emp.is_special))}
                      className={`px-3 py-1 text-xs font-bold transition-all rounded-none cursor-pointer border ${
                        emp.is_special
                          ? 'bg-red-500 hover:bg-red-600 text-white border-red-600 shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {emp.is_special ? '● Special Case (Active)' : 'Standard'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-mono text-[11px]">
          Showing Page {page} of {totalPages} ({total} Total Employees)
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 disabled:opacity-40 rounded-none cursor-pointer font-medium"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 disabled:opacity-40 rounded-none cursor-pointer font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
