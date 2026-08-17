"use client";
import React from 'react';
import { MultiSelect } from './MultiSelect';

interface AdvancedFiltersBarProps {
  showFilters: boolean;
  tableCols: any[];
  filterOptions: any;
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  exportToExcel: () => void;
  exporting: boolean;
  onOpenAddRecord: () => void;
  onClearFilters: () => void;
  userRole?: string;
}

export function AdvancedFiltersBar({
  showFilters,
  tableCols,
  filterOptions,
  filters,
  setFilters,
  exportToExcel,
  exporting,
  onOpenAddRecord,
  onClearFilters,
  userRole
}: AdvancedFiltersBarProps) {
  if (!showFilters) return null;

  const FILTER_OPTIONS_CONFIG = [
    { key: 'employeeCode', filterKey: 'employee_code', label: 'Emp Code', isMulti: true, colKeys: ['employee_code'] },
    { key: 'product', filterKey: 'product', label: 'Product Type', isMulti: true, colKeys: ['product'] },
    { key: 'bucket', filterKey: 'bucket', label: 'Bucket', isMulti: true, colKeys: ['bucket'] },
    { key: 'location', filterKey: 'location', label: 'Location', isMulti: true, colKeys: ['location'] },
    { key: 'aph', filterKey: 'aph', label: 'APH', isMulti: true, colKeys: ['aph'] },
    { key: 'ph', filterKey: 'ph', label: 'PH', isMulti: true, colKeys: ['ph'] },
    { key: 'client', filterKey: 'client', label: 'Client', isMulti: true, colKeys: ['client'] },
    { key: 'tlName', filterKey: 'tl_name', label: 'TL Name', isMulti: true, colKeys: ['tl_name'] },
    { key: 'agentName', filterKey: 'employee_name', label: 'Agent Name', isMulti: true, colKeys: ['employee_name', 'name'] },
    { key: 'am', filterKey: 'am', label: 'AM / CM', isMulti: true, colKeys: ['am', 'agent'] },
    { key: 'paymentMode', filterKey: 'payment_mode', label: 'Payment Mode', isMulti: true, colKeys: ['payment_mode'] },
    { key: 'phoneNo', filterKey: 'mobile_no', label: 'Mobile No', isMulti: true, colKeys: ['mobile_no'] }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
      {FILTER_OPTIONS_CONFIG.filter(opt => tableCols.some(c => opt.colKeys.includes(c.key?.toLowerCase()))).map(opt => (
        opt.isMulti ? (
          <MultiSelect
            key={opt.key}
            label={opt.label}
            options={filterOptions[opt.key] || []}
            selected={Array.isArray(filters[opt.filterKey]) ? filters[opt.filterKey] : (filters[opt.filterKey] ? [filters[opt.filterKey]] : [])}
            onChange={(newVal) => setFilters({ ...filters, [opt.filterKey]: newVal })}
          />
        ) : (
          <select 
            key={opt.key}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 outline-none focus:border-teal-600 rounded-none cursor-pointer text-slate-700" 
            value={filters[opt.filterKey] || ''} 
            onChange={e => setFilters({ ...filters, [opt.filterKey]: e.target.value })}
          >
            <option value="">{opt.label}</option>
            {(filterOptions[opt.key] || []).map((val: string) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        )
      ))}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-auto mt-2 md:mt-0">
        <button
          className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-none shadow-2xs cursor-pointer flex items-center gap-1"
          onClick={exportToExcel} disabled={exporting}
        >
          {exporting ? '⏳ Exporting...' : '📥 Export Excel'}
        </button>

        {userRole === 'admin' && (
          <button
            className="px-3.5 py-1.5 text-xs font-bold bg-[#024e4d] hover:bg-[#036261] text-white rounded-none shadow-2xs cursor-pointer flex items-center gap-1"
            onClick={onOpenAddRecord}
          >
            ➕ Add Record
          </button>
        )}

        <button
          className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-none shadow-2xs cursor-pointer"
          onClick={onClearFilters}
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}
