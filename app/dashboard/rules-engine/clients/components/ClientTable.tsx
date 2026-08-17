"use client";
import React from 'react';
import { MapPin, Columns, Grid3X3, Trash2, Building2 } from 'lucide-react';

interface ClientTableProps {
  clients: any[];
  locations: any[];
  mappings: any[];
  loading: boolean;
  searchQuery: string;
  onOpenMapping: (client: any) => void;
  onOpenColumns: (client: any) => void;
  onOpenGrid: (client: any) => void;
  onDeleteClient: (id: number) => void;
}

export function ClientTable({
  clients,
  locations,
  mappings,
  loading,
  searchQuery,
  onOpenMapping,
  onOpenColumns,
  onOpenGrid,
  onDeleteClient
}: ClientTableProps) {
  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col flex-1 rounded-none">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Available Clients Directory</h3>
        <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 border border-slate-200 rounded-none">
          {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-2 font-semibold w-16">ID</th>
              <th className="px-3.5 py-2 font-semibold">Client Name & Product</th>
              <th className="px-3.5 py-2 font-semibold">Assigned Locations</th>
              <th className="px-3.5 py-2 font-semibold">DPF Columns</th>
              <th className="px-3.5 py-2 font-semibold">Calculation Grid</th>
              <th className="px-3.5 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading client directory...</span>
                  </div>
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                  <Building2 className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-800">No clients found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{searchQuery ? 'Try adjusting your search query' : 'Click "Add Client" to register one.'}</p>
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const assignedLocIds = mappings.filter(m => m.client_id === client.id).map(m => m.location_id);
                const assignedLocs = locations.filter(l => assignedLocIds.includes(l.id));

                let reqColsCount = 0;
                if (Array.isArray(client.required_columns)) reqColsCount = client.required_columns.length;
                else if (typeof client.required_columns === 'string') {
                  try { reqColsCount = JSON.parse(client.required_columns).length; } catch(e) {}
                }

                return (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-3.5 py-2.5 font-mono text-slate-500 font-medium">#{client.id}</td>
                    
                    {/* Client Name & Product */}
                    <td className="px-3.5 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{client.name}</span>
                        {client.product_type && (
                          <span className="text-[10px] text-blue-600 font-medium">
                            Product: {client.product_type}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Locations */}
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {assignedLocs.length > 0 ? (
                          assignedLocs.map(loc => (
                            <span key={loc.id} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 border border-slate-200 rounded-none">
                              {loc.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">None</span>
                        )}
                        <button
                          onClick={() => onOpenMapping(client)}
                          className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 border border-blue-200 rounded-none font-semibold cursor-pointer"
                        >
                          + Assign
                        </button>
                      </div>
                    </td>

                    {/* DPF Columns */}
                    <td className="px-3.5 py-2.5">
                      <button
                        onClick={() => onOpenColumns(client)}
                        className="text-xs text-slate-700 hover:text-blue-700 font-semibold flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 border border-slate-200 rounded-none cursor-pointer"
                      >
                        <Columns size={13} className="text-slate-500" />
                        <span>{reqColsCount > 0 ? `${reqColsCount} Columns` : 'Configure'}</span>
                      </button>
                    </td>

                    {/* Assigned Calculation Grid */}
                    <td className="px-3.5 py-2.5">
                      <button
                        onClick={() => onOpenGrid(client)}
                        className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 border rounded-none cursor-pointer ${
                          client.assigned_grid
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Grid3X3 size={13} className={client.assigned_grid ? "text-blue-600" : "text-slate-400"} />
                        <span>{client.assigned_grid ? client.assigned_grid.replace('_', ' ').toUpperCase() : 'Assign Grid'}</span>
                      </button>
                    </td>

                    {/* Action */}
                    <td className="px-3.5 py-2.5 text-right">
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 transition-colors cursor-pointer rounded-none"
                        title="Delete Client"
                      >
                        <Trash2 size={15} />
                      </button>
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
