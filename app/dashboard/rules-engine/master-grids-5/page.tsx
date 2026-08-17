"use client";
import { useState, useEffect } from 'react';
import { Grid5Header } from './components/Grid5Header';
import { Grid5Tabs } from './components/Grid5Tabs';
import { Grid5AssociateTable } from './components/Grid5AssociateTable';
import { Grid5LeaderTable } from './components/Grid5LeaderTable';

interface AssociateSlab {
  vintage: string;
  upgrade_pct: string;
  recovery_pct: string;
}

interface LeaderSlab {
  level: string;
  avg_min: string;
  avg_max: string;
  upgrade_pct: string;
  recovery_pct: string;
}

interface Grid5Data {
  associateSlabs: AssociateSlab[];
  tlSlabs: LeaderSlab[];
  amSlabs: LeaderSlab[];
}

export default function MasterGrid5Page() {
  const [data, setData] = useState<Grid5Data>({ associateSlabs: [], tlSlabs: [], amSlabs: [] });
  const [activeTab, setActiveTab] = useState('associate');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/master-grids-5')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setData({
            associateSlabs: res.data.associateSlabs || [],
            tlSlabs: res.data.tlSlabs || [],
            amSlabs: res.data.amSlabs || []
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/master-grids-5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        alert('Master Grid 5 updated successfully!');
      } else {
        alert(resData.error || 'Failed to update');
      }
    } catch (e) {
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const addAssociateSlab = () => {
    setData(prev => ({
      ...prev,
      associateSlabs: [...prev.associateSlabs, { vintage: '', upgrade_pct: '0.00', recovery_pct: '0.00' }]
    }));
  };

  const removeAssociateSlab = (idx: number) => {
    setData(prev => ({
      ...prev,
      associateSlabs: prev.associateSlabs.filter((_, i) => i !== idx)
    }));
  };

  const updateAssociateSlab = (idx: number, field: keyof AssociateSlab, val: string) => {
    setData(prev => {
      const newSlabs = [...prev.associateSlabs];
      newSlabs[idx] = { ...newSlabs[idx], [field]: val };
      return { ...prev, associateSlabs: newSlabs };
    });
  };

  const addLeaderSlab = (type: 'tlSlabs' | 'amSlabs') => {
    setData(prev => ({
      ...prev,
      [type]: [...prev[type], { level: 'New Tier', avg_min: '', avg_max: '', upgrade_pct: '0.00', recovery_pct: '0.00' }]
    }));
  };

  const removeLeaderSlab = (type: 'tlSlabs' | 'amSlabs', idx: number) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== idx)
    }));
  };

  const updateLeaderSlab = (type: 'tlSlabs' | 'amSlabs', idx: number, field: keyof LeaderSlab, val: string) => {
    setData(prev => {
      const newSlabs = [...prev[type]];
      newSlabs[idx] = { ...newSlabs[idx], [field]: val };
      return { ...prev, [type]: newSlabs };
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Master Grid 5...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/40">
      <Grid5Header isSaving={isSaving} onSave={handleSave} />

      <Grid5Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'associate' ? (
        <Grid5AssociateTable
          slabs={data.associateSlabs}
          onAdd={addAssociateSlab}
          onUpdate={updateAssociateSlab}
          onRemove={removeAssociateSlab}
        />
      ) : activeTab === 'tl' ? (
        <Grid5LeaderTable
          title="Team Leader (TL) Upgrade & Recovery Slabs"
          slabs={data.tlSlabs}
          onAdd={() => addLeaderSlab('tlSlabs')}
          onUpdate={(idx, f, v) => updateLeaderSlab('tlSlabs', idx, f, v)}
          onRemove={(idx) => removeLeaderSlab('tlSlabs', idx)}
        />
      ) : (
        <Grid5LeaderTable
          title="Assistant Manager (AM) Upgrade & Recovery Slabs"
          slabs={data.amSlabs}
          onAdd={() => addLeaderSlab('amSlabs')}
          onUpdate={(idx, f, v) => updateLeaderSlab('amSlabs', idx, f, v)}
          onRemove={(idx) => removeLeaderSlab('amSlabs', idx)}
        />
      )}
    </div>
  );
}
