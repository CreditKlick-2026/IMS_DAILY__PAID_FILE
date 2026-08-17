"use client";
import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';

interface LocationTableProps {
  loading: boolean;
  filteredItems: any[];
  searchQuery: string;
  onDelete: (id: number) => void;
}

export function LocationTable({
  loading,
  filteredItems,
  searchQuery,
  onDelete
}: LocationTableProps) {
  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col flex-1 rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Available Locations Directory</h3>
        <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-none">
          {filteredItems.length} {filteredItems.length === 1 ? 'Site' : 'Sites'}
        </span>
      </div>
      
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
          <tr>
            <th className="px-4 py-2 font-semibold w-20">Site ID</th>
            <th className="px-4 py-2 font-semibold">Location Name</th>
            <th className="px-4 py-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading directory...</span>
                </div>
              </td>
            </tr>
          ) : filteredItems.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-12 text-center text-slate-500">
                <MapPin className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                <p className="font-semibold text-slate-800">No locations found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{searchQuery ? 'Try adjusting your search query' : 'Click "Add Location" to create one.'}</p>
              </td>
            </tr>
          ) : (
            filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-4 py-2.5 font-mono text-slate-500 font-medium">#{item.id}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-none"></span>
                    {item.name}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 transition-colors cursor-pointer rounded-none"
                    title="Delete Location"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
