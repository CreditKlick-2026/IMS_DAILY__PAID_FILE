"use client";
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

interface KekaMasterTableProps {
  paginatedData: any[];
  loading: boolean;
  page: number;
  pageSize: number;
  kekaColumns?: any[];
  onEdit: (employee: any) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_COLUMNS = [
  { key: "employee_id", display: "Employee ID" },
  { key: "name", display: "Employee Name" },
  { key: "location", display: "Location" },
  { key: "client", display: "Client" },
  { key: "product", display: "Product" },
  { key: "designation", display: "Designation" },
  { key: "agent_ohr", display: "Agent OHR" },
  { key: "tl_name", display: "TL Name" },
  { key: "am_name", display: "AM Name" },
  { key: "doj", display: "DOJ" },
  { key: "doc", display: "DOC" },
  { key: "salary", display: "Salary" },
];

export function KekaMasterTable({
  paginatedData,
  loading,
  page,
  pageSize,
  kekaColumns = [],
  onEdit,
  onDelete
}: KekaMasterTableProps) {
  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

  // Active columns to render
  const activeColumns = (kekaColumns && kekaColumns.length > 0) ? kekaColumns : DEFAULT_COLUMNS;
  const totalColSpan = activeColumns.length + 2; // # + columns + Actions

  return (
    <div className="border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col flex-1 rounded-none">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600 uppercase font-bold sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2.5 w-10 text-center">#</th>
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 whitespace-nowrap ${
                    col.key === 'salary' ? 'text-right' : col.key === 'agent_ohr' ? 'font-mono' : ''
                  }`}
                >
                  {col.display}
                </th>
              ))}
              <th className="px-3.5 py-2.5 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableRowSkeleton cols={totalColSpan} rows={10} />
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={totalColSpan} className="px-4 py-12 text-center text-slate-500">
                  No employee master records match the filter criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((emp, index) => {
                const serialNum = (page - 1) * pageSize + index + 1;

                return (
                  <tr key={`${emp.id || emp.employee_id || 'emp'}-${index}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 text-center font-mono text-slate-400 font-medium">{serialNum}</td>

                    {activeColumns.map((col) => {
                      const key = col.key;
                      
                      if (key === 'employee_id') {
                        return (
                          <td key={key} className="px-3 py-2.5 font-mono font-bold text-slate-900">
                            {emp.employee_id}
                          </td>
                        );
                      }
                      if (key === 'name') {
                        return (
                          <td key={key} className="px-3.5 py-2.5 font-semibold text-slate-900">
                            {emp.name}
                          </td>
                        );
                      }
                      if (key === 'salary') {
                        return (
                          <td key={key} className="px-3.5 py-2.5 font-mono text-right font-semibold text-slate-800">
                            {emp.salary ? formatCurrency(Number(emp.salary)) : '—'}
                          </td>
                        );
                      }
                      if (key === 'doj' || key === 'doc') {
                        const dateVal = emp[key];
                        return (
                          <td key={key} className="px-3.5 py-2.5 text-slate-500 font-mono text-[11px]">
                            {dateVal ? new Date(dateVal).toLocaleDateString('en-GB') : '—'}
                          </td>
                        );
                      }
                      if (key === 'agent_ohr') {
                        return (
                          <td key={key} className="px-3 py-2.5 font-mono text-slate-600">
                            {emp.agent_ohr || '—'}
                          </td>
                        );
                      }

                      // Generic & Custom Columns (e.g. test, blood_group, custom_field)
                      const val = emp[key] ?? emp.extra_data?.[key] ?? emp.extra_data?.[col.display] ?? '—';
                      return (
                        <td key={key} className="px-3 py-2.5 text-slate-700">
                          {String(val !== null && val !== undefined && val !== '' ? val : '—')}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(emp.employee_id || emp.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                          title="Delete Employee Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
