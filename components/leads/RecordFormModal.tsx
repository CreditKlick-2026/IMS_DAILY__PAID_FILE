"use client";
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Building2 } from 'lucide-react';

interface RecordFormModalProps {
  mode: 'add' | 'edit';
  record?: any;
  onClose: () => void;
  onSave: () => void;
}

export function RecordFormModal({ mode, record, onClose, onSave }: RecordFormModalProps) {
  const [formData, setFormData] = useState({
    account_no: record?.account_no || '',
    employee_code: record?.employee_code || '',
    name: record?.name || record?.employee_name || '',
    client: record?.client || '',
    product: record?.product || '',
    bucket: record?.bucket || '',
    location: record?.location || '',
    outstanding: record?.outstanding || record?.money_collected || '',
    payment_mode: record?.payment_mode || '',
    tl_name: record?.tl_name || '',
    agent: record?.agent || record?.am || '',
    aph: record?.aph || '',
    ph: record?.ph || '',
    mobile_no: record?.mobile_no || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useApp();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === 'add' ? '/api/leads' : `/api/leads/${record.id}`;
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast(`Record ${mode === 'add' ? 'added' : 'updated'} successfully`);
        onSave();
        onClose();
      } else {
        toast(data.error || 'Operation failed');
      }
    } catch (err) {
      toast('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col rounded-none max-h-[90vh]">
        <div className="px-5 py-3 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">{mode === 'add' ? 'Add New Collection Record' : 'Edit Collection Record'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 grid grid-cols-2 gap-3 text-xs">
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Account Number *</label><input required className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500 font-mono" name="account_no" value={formData.account_no} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Customer Name *</label><input required className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500" name="name" value={formData.name} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Money Collected *</label><input required type="number" className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500 font-mono text-emerald-700 font-bold" name="outstanding" value={formData.outstanding} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Product Type</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500" name="product" value={formData.product} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Emp Code</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500 font-mono" name="employee_code" value={formData.employee_code} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Client</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500" name="client" value={formData.client} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Bucket</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500 font-mono" name="bucket" value={formData.bucket} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Location</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500" name="location" value={formData.location} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Payment Mode</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500" name="payment_mode" value={formData.payment_mode} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">TL Name</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500" name="tl_name" value={formData.tl_name} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Agent / AM</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500" name="agent" value={formData.agent} onChange={handleChange} /></div>
          <div><label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Mobile No</label><input className="w-full px-2.5 py-1.5 border border-slate-300 rounded-none outline-none focus:border-blue-500 font-mono" name="mobile_no" value={formData.mobile_no} onChange={handleChange} /></div>

          <div className="col-span-2 flex justify-end gap-2 pt-3 border-t mt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-none">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-none shadow-2xs cursor-pointer">{loading ? 'Saving...' : 'Save Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
