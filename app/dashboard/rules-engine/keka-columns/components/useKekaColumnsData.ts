"use client";
import { useState, useEffect } from 'react';

export function useKekaColumnsData(onUpdated?: () => void) {
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addMode, setAddMode] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDisplay, setNewDisplay] = useState('');
  const [newLabels, setNewLabels] = useState('');

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDisplay, setEditDisplay] = useState('');
  const [editLabels, setEditLabels] = useState('');

  const coreKeys = ['location', 'employee_id', 'name', 'designation', 'agent_ohr', 'doj', 'doc', 'salary', 'tl_name', 'am_name', 'client', 'product'];

  const fetchColumns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/keka-columns');
      const json = await res.json();
      if (json.success) setColumns(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const saveToServer = async (newCols: any[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/keka-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: newCols })
      });
      if (res.ok) {
        setColumns(newCols);
        setAddMode(false);
        setEditingKey(null);
        setNewKey('');
        setNewDisplay('');
        setNewLabels('');
        if (onUpdated) onUpdated();
      } else {
        alert("Failed to save columns");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving columns");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (!newKey.trim() || !newDisplay.trim()) return;
    const labelsArr = newLabels.split(',').map(l => l.trim()).filter(Boolean);
    if (!labelsArr.includes(newDisplay.trim())) labelsArr.push(newDisplay.trim());
    if (!labelsArr.includes(newKey.trim())) labelsArr.push(newKey.trim());
    const updated = [...columns, { key: newKey.trim(), display: newDisplay.trim(), labels: labelsArr }];
    saveToServer(updated);
  };

  const handleEditSave = (key: string) => {
    const labelsArr = editLabels.split(',').map(l => l.trim()).filter(Boolean);
    if (!labelsArr.includes(editDisplay.trim())) labelsArr.push(editDisplay.trim());
    const updated = columns.map(c => c.key === key ? { ...c, display: editDisplay, labels: labelsArr } : c);
    saveToServer(updated);
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete column "${key}"? (Requires 0 active records in database)`)) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/keka-columns?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setColumns(prev => prev.filter(c => c.key !== key));
        if (onUpdated) onUpdated();
        alert(data.message || `Column "${key}" successfully deleted.`);
      } else {
        alert(`❌ Cannot Delete Column: ${data.error}`);
      }
    } catch (e: any) {
      alert("Error deleting column: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return {
    columns, loading, saving, addMode, setAddMode, newKey, setNewKey, newDisplay, setNewDisplay,
    newLabels, setNewLabels, editingKey, setEditingKey, editDisplay, setEditDisplay,
    editLabels, setEditLabels, coreKeys,
    fetchColumns, handleAdd, handleEditSave, handleDelete
  };
}
