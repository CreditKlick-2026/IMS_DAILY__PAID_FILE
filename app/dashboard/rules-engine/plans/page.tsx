"use client";

import React, { useState, useEffect } from 'react';
import { Grid3X3, Plus, Trash2, Search, CheckCircle2, AlertTriangle, Layers, Percent, Settings, X, Calendar, MapPin, Building2, User } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [processId, setProcessId] = useState('');
  const [role, setRole] = useState('TC');
  const [minVintage, setMinVintage] = useState('0');
  const [maxVintage, setMaxVintage] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveTo, setEffectiveTo] = useState('');
  
  // Slabs State
  const [slabs, setSlabs] = useState([{ id: Date.now(), min_target: '0', max_target: '', payout_type: 'PERCENTAGE', payout_value: '0' }]);
  
  // Riders State
  const [riders, setRiders] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, processesRes] = await Promise.all([
        fetch('/api/universal/plans'),
        fetch('/api/universal/processes')
      ]);

      const plansJson = await plansRes.json();
      const processesJson = await processesRes.json();

      if (plansJson.success) setPlans(plansJson.data);
      if (processesJson.success) setProcesses(processesJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSlab = () => {
    setSlabs([...slabs, { id: Date.now(), min_target: '', max_target: '', payout_type: 'PERCENTAGE', payout_value: '' }]);
  };

  const handleRemoveSlab = (id: number) => {
    if (slabs.length > 1) {
      setSlabs(slabs.filter(s => s.id !== id));
    }
  };

  const handleUpdateSlab = (id: number, field: string, value: string) => {
    setSlabs(slabs.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddRider = () => {
    setRiders([...riders, { id: Date.now(), rider_type: 'QA', condition_operator: '>=', condition_value: '', payout_modifier_type: 'DOCKING', modifier_percentage: '' }]);
  };

  const handleRemoveRider = (id: number) => {
    setRiders(riders.filter(r => r.id !== id));
  };

  const handleUpdateRider = (id: number, field: string, value: string) => {
    setRiders(riders.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const resetForm = () => {
    setAddMode(false);
    setProcessId('');
    setRole('TC');
    setMinVintage('0');
    setMaxVintage('');
    setEffectiveFrom(new Date().toISOString().split('T')[0]);
    setEffectiveTo('');
    setSlabs([{ id: Date.now(), min_target: '0', max_target: '', payout_type: 'PERCENTAGE', payout_value: '0' }]);
    setRiders([]);
  };

  const handleSave = async () => {
    if (!processId || !effectiveFrom) {
      alert("Process and Effective From date are required!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        process_id: processId,
        role: role,
        min_vintage_days: parseInt(minVintage) || 0,
        max_vintage_days: maxVintage ? parseInt(maxVintage) : null,
        effective_from: effectiveFrom,
        effective_to: effectiveTo || null,
        slabs: slabs.map(s => ({
          min_target: parseFloat(s.min_target) || 0,
          max_target: s.max_target ? parseFloat(s.max_target) : null,
          payout_type: s.payout_type,
          payout_value: parseFloat(s.payout_value) || 0
        })),
        riders: riders.map(r => ({
          rider_type: r.rider_type,
          condition_operator: r.condition_operator,
          condition_value: parseFloat(r.condition_value) || 0,
          payout_modifier_type: r.payout_modifier_type,
          modifier_percentage: parseFloat(r.modifier_percentage) || 0
        }))
      };

      const res = await fetch('/api/universal/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        resetForm();
        fetchData();
      } else {
        alert(json.error || "Failed to save plan");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this master grid? This will also remove all associated slabs and riders.')) return;
    try {
      const res = await fetch(`/api/universal/plans?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPlans = plans.filter(p => 
    p.process_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto min-h-full">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Grid3X3 className="text-indigo-600" /> Master Grid Builder
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Design enterprise incentive plans by mapping processes to performance slabs and conditional riders.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search plans..."
              className="pl-9 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          </div>
          <button
            onClick={() => setAddMode(!addMode)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            {addMode ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Create Grid</>}
          </button>
        </div>
      </div>

      {/* CREATE GRID BUILDER */}
      {addMode && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <Layers className="text-indigo-600" /> New Master Grid Configuration
            </h3>
          </div>
          
          <div className="p-6 space-y-8">
            {/* SECTION 1: Base Configuration */}
            <section>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b">1. Scope & Demographics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Target Process *</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={processId}
                    onChange={(e) => setProcessId(e.target.value)}
                  >
                    <option value="">Select a Process...</option>
                    {processes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.client_name} - {p.name} ({p.location_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Target Role *</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="TC">Tele-caller (TC)</option>
                    <option value="TL">Team Leader (TL)</option>
                    <option value="AM">Assistant Manager (AM)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Min Vintage (Days)</label>
                    <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={minVintage} onChange={e => setMinVintage(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Max Vintage <span className="text-slate-400 font-normal">(Leave blank for max)</span></label>
                    <input type="number" placeholder="∞" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={maxVintage} onChange={e => setMaxVintage(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Effective From *</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Effective To <span className="text-slate-400 font-normal">(Leave blank for no expiry)</span></label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)} />
                </div>
              </div>
            </section>

            {/* SECTION 2: Incentive Slabs */}
            <section>
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Incentive Slabs</h4>
                <button onClick={handleAddSlab} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-md text-sm font-semibold transition-colors flex items-center gap-1">
                  <Plus size={16} /> Add Slab
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-200/50 text-slate-600 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Min Target</th>
                      <th className="px-4 py-3 font-semibold">Max Target (Leave blank for ∞)</th>
                      <th className="px-4 py-3 font-semibold">Payout Type</th>
                      <th className="px-4 py-3 font-semibold">Payout Value</th>
                      <th className="px-4 py-3 font-semibold w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {slabs.map((slab) => (
                      <tr key={slab.id} className="bg-white">
                        <td className="px-4 py-2">
                          <input type="number" className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={slab.min_target} onChange={e => handleUpdateSlab(slab.id, 'min_target', e.target.value)} />
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" placeholder="∞" className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={slab.max_target} onChange={e => handleUpdateSlab(slab.id, 'max_target', e.target.value)} />
                        </td>
                        <td className="px-4 py-2">
                          <select className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={slab.payout_type} onChange={e => handleUpdateSlab(slab.id, 'payout_type', e.target.value)}>
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={slab.payout_value} onChange={e => handleUpdateSlab(slab.id, 'payout_value', e.target.value)} />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => handleRemoveSlab(slab.id)} className="text-red-400 hover:text-red-600 p-1" disabled={slabs.length === 1}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 3: Riders */}
            <section>
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  3. Riders <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] normal-case">Optional</span>
                </h4>
                <button onClick={handleAddRider} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-md text-sm font-semibold transition-colors flex items-center gap-1">
                  <Plus size={16} /> Add Rider
                </button>
              </div>
              
              {riders.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
                  No riders configured. Click "Add Rider" to configure docking or kickers (e.g. QA &lt; 85% causes 50% payout).
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-200/50 text-slate-600 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Metric</th>
                        <th className="px-4 py-3 font-semibold">Operator</th>
                        <th className="px-4 py-3 font-semibold">Condition Value</th>
                        <th className="px-4 py-3 font-semibold">Modifier Type</th>
                        <th className="px-4 py-3 font-semibold">Effect (%)</th>
                        <th className="px-4 py-3 font-semibold w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {riders.map((rider) => (
                        <tr key={rider.id} className="bg-white">
                          <td className="px-4 py-2">
                            <select className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={rider.rider_type} onChange={e => handleUpdateRider(rider.id, 'rider_type', e.target.value)}>
                              <option value="QA">QA Score</option>
                              <option value="UPL">UPL Count</option>
                              <option value="ATTRITION_COUNT">Attrition Count</option>
                              <option value="TEAM_ELIGIBILITY">Team Eligibility %</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={rider.condition_operator} onChange={e => handleUpdateRider(rider.id, 'condition_operator', e.target.value)}>
                              <option value=">=">&gt;=</option>
                              <option value="<=">&lt;=</option>
                              <option value="<">&lt;</option>
                              <option value=">">&gt;</option>
                              <option value="=">=</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={rider.condition_value} onChange={e => handleUpdateRider(rider.id, 'condition_value', e.target.value)} />
                          </td>
                          <td className="px-4 py-2">
                            <select className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" value={rider.payout_modifier_type} onChange={e => handleUpdateRider(rider.id, 'payout_modifier_type', e.target.value)}>
                              <option value="DOCKING">Docking (Penalty)</option>
                              <option value="KICKER">Kicker (Bonus)</option>
                              <option value="FORFEITURE">Forfeiture (0% payout)</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" placeholder={rider.payout_modifier_type === 'FORFEITURE' ? '0' : '%'} disabled={rider.payout_modifier_type === 'FORFEITURE'} className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100" value={rider.payout_modifier_type === 'FORFEITURE' ? '0' : rider.modifier_percentage} onChange={e => handleUpdateRider(rider.id, 'modifier_percentage', e.target.value)} />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => handleRemoveRider(rider.id)} className="text-red-400 hover:text-red-600 p-1">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t flex justify-end gap-3">
             <button onClick={resetForm} className="px-6 py-2 rounded-md font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors">
              Discard
             </button>
             <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2">
              <CheckCircle2 size={18} /> {saving ? 'Publishing Grid...' : 'Publish Grid Config'}
             </button>
          </div>
        </div>
      )}

      {/* PLANS LIST */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="px-5 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Active Master Grids</h3>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {filteredPlans.length} {filteredPlans.length === 1 ? 'Grid' : 'Grids'}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 border-b">
              <tr>
                <th className="px-5 py-3 font-medium">Grid Plan</th>
                <th className="px-5 py-3 font-medium">Process Map</th>
                <th className="px-5 py-3 font-medium">Role & Vintage</th>
                <th className="px-5 py-3 font-medium">Timeline</th>
                <th className="px-5 py-3 font-medium">Rules Breakdown</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Fetching Active Grids...
                    </div>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Grid3X3 className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-base font-semibold text-slate-800">No active grids found</p>
                    <p className="text-sm mt-1">Configure your first Master Grid to enable incentive calculations.</p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-indigo-900">Grid ID: #{plan.id}</div>
                      <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border">
                         {plan.tracking_metric}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="font-semibold text-slate-800">{plan.process_name}</div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Building2 size={12}/> {plan.client_name}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {plan.location_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <User size={14} className="text-indigo-500"/> {plan.role}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Vntg: {plan.min_vintage_days} - {plan.max_vintage_days || '∞'} days
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Calendar size={14} className="text-green-600"/>
                        {new Date(plan.effective_from).toLocaleDateString()}
                      </div>
                      {plan.effective_to && (
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                          <Calendar size={12} className="text-red-500"/>
                          Ends: {new Date(plan.effective_to).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex gap-2">
                         <div className="bg-blue-50 border border-blue-100 rounded px-2 py-1 text-center">
                            <div className="text-blue-800 font-bold">{plan.slabs?.length || 0}</div>
                            <div className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Slabs</div>
                         </div>
                         <div className="bg-amber-50 border border-amber-100 rounded px-2 py-1 text-center">
                            <div className="text-amber-800 font-bold">{plan.riders?.length || 0}</div>
                            <div className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">Riders</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Master Grid"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
