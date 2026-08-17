"use client";
import React, { useState, useEffect } from 'react';
import { DynamicGridHeader } from './dynamic-grid/DynamicGridHeader';
import { DynamicGridTabs } from './dynamic-grid/DynamicGridTabs';
import { AssociateSlabTable } from './dynamic-grid/AssociateSlabTable';
import { LeaderSlabTable } from './dynamic-grid/LeaderSlabTable';
import { RidersTable } from './dynamic-grid/RidersTable';

interface DynamicGridEditorProps {
  gridId: string;
  title: string;
  subtitle: string;
  hasClientProduct?: boolean;
}

export default function DynamicGridEditor({
  gridId,
  title,
  subtitle,
  hasClientProduct = false
}: DynamicGridEditorProps) {
  const [activeTab, setActiveTab] = useState('associate');
  const [data, setData] = useState<any>({ associateSlabs: [], tlSlabs: [], amSlabs: [], riders: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/master-grids-${gridId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setData({
            associateSlabs: res.data.associateSlabs || [],
            tlSlabs: res.data.tlSlabs || [],
            amSlabs: res.data.amSlabs || [],
            riders: res.data.riders || []
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [gridId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/master-grids-${gridId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridName: `grid_${gridId}`, data })
      });
      const resData = await res.json();
      if (resData.success) {
        alert(`${title} updated successfully!`);
      } else {
        alert(resData.error || resData.message || 'Failed to update');
      }
    } catch (e) {
      alert('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const addAssociateSlab = () => {
    const newSlab = hasClientProduct
      ? { client: '', product: '', vintage: '', level: '', min: '', max: '', payout_pct: '0.00' }
      : { vintage: '', min: '', max: '', payout_pct: '0.00' };
    setData((prev: any) => ({ ...prev, associateSlabs: [...prev.associateSlabs, newSlab] }));
  };

  const addLeaderSlab = (type: 'tlSlabs' | 'amSlabs') => {
    setData((prev: any) => ({ ...prev, [type]: [...prev[type], { pcp_min: '', pcp_max: '', payout_pct: '0.00' }] }));
  };

  const addRider = () => {
    setData((prev: any) => ({ ...prev, riders: [...(prev.riders || []), { role: '', docking: '', payout: '' }] }));
  };

  const updateArray = (type: string, idx: number, field: string, val: string) => {
    setData((prev: any) => {
      const newArr = [...(prev[type] || [])];
      newArr[idx] = { ...newArr[idx], [field]: val };
      return { ...prev, [type]: newArr };
    });
  };

  const removeArray = (type: string, idx: number) => {
    setData((prev: any) => ({ ...prev, [type]: prev[type].filter((_: any, i: number) => i !== idx) }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Grid Matrix {gridId}...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/40">
      <DynamicGridHeader
        title={title}
        subtitle={subtitle}
        gridId={gridId}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <DynamicGridTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'associate' ? (
        <AssociateSlabTable
          slabs={data.associateSlabs}
          hasClientProduct={hasClientProduct}
          onAddSlab={addAssociateSlab}
          onUpdateSlab={(idx, f, v) => updateArray('associateSlabs', idx, f, v)}
          onRemoveSlab={(idx) => removeArray('associateSlabs', idx)}
        />
      ) : activeTab === 'tl' ? (
        <LeaderSlabTable
          title="Team Leader (TL) Slabs Matrix (PCP Based)"
          slabs={data.tlSlabs}
          onAddSlab={() => addLeaderSlab('tlSlabs')}
          onUpdateSlab={(idx, f, v) => updateArray('tlSlabs', idx, f, v)}
          onRemoveSlab={(idx) => removeArray('tlSlabs', idx)}
        />
      ) : activeTab === 'am' ? (
        <LeaderSlabTable
          title="Assistant Manager (AM) Slabs Matrix (PCP Based)"
          slabs={data.amSlabs}
          onAddSlab={() => addLeaderSlab('amSlabs')}
          onUpdateSlab={(idx, f, v) => updateArray('amSlabs', idx, f, v)}
          onRemoveSlab={(idx) => removeArray('amSlabs', idx)}
        />
      ) : (
        <RidersTable
          riders={data.riders}
          onAddRider={addRider}
          onUpdateRider={(idx, f, v) => updateArray('riders', idx, f, v)}
          onRemoveRider={(idx) => removeArray('riders', idx)}
        />
      )}
    </div>
  );
}
