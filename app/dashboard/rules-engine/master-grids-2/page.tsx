'use client';

import React, { useState, useEffect } from 'react';
import { Card, Spinner } from '@shopify/polaris';

export default function MasterGrid2Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slabs' | 'riders'>('slabs');

  useEffect(() => {
    fetch('/api/admin/master-grids-2')
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Grid 2 — Axis Bank (Credit Card - Woff - BAU)</h1>
        <p className="text-gray-500 mt-1">Configure tiers for Associates (Vintage), TLs (PCP), and AMs (PCP)</p>
      </div>
      <div className="flex gap-4 border-b mt-4">
        <button onClick={() => setActiveTab('slabs')} className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'slabs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Associate Slabs
        </button>
        <button onClick={() => setActiveTab('riders')} className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'riders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Riders & Docking Rules ({data?.riders?.length || 0})
        </button>
      </div>

      {activeTab === 'slabs' && (
        <div className="space-y-6">

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Associate Slabs (Vintage & Collection based)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vintage Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Collection</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.associateSlabs?.map((slab: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{slab.vintage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slab.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slab.min}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slab.max}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{slab.payout_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Team Leader Slabs (PCP based)</h3>
          {(!data?.tlSlabs || data?.tlSlabs.length === 0) && (
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-200">Awaiting TL Data</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min PCP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max PCP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.tlSlabs?.map((slab: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slab.pcp_min}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slab.pcp_max}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{slab.payout_pct}%</td>
                </tr>
              ))}
              {(!data?.tlSlabs || data?.tlSlabs.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                    No TL slabs available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Assistant Manager Slabs (PCP based)</h3>
          {(!data?.amSlabs || data?.amSlabs.length === 0) && (
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-200">Awaiting AM Data</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min PCP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max PCP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.amSlabs?.map((slab: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slab.pcp_min}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{slab.pcp_max}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{slab.payout_pct}%</td>
                </tr>
              ))}
              {(!data?.amSlabs || data?.amSlabs.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                    No AM slabs available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
              </div>
      )}
      {activeTab === 'riders' && (
        <div className="space-y-6">
  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Rider and Docker Rules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Rule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition (Docking)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Multiplier / Extra</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.riders?.map((rider: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{rider.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rider.docking}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {typeof rider.payout === 'number' ? (rider.payout * 100) + '%' : rider.payout}
                  </td>
                </tr>
              ))}
              {(!data?.riders || data?.riders.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                    No rider rules available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
              </div>
        </div>
      )}
    </div>
  );
}
