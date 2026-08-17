"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DISPOSITION_LOGIC } from './constants';

export function EditLeadModal({ lead, onDone }: { lead: any; onDone: () => void }) {
  const { user, closeModal, toast } = useApp();
  const [loading, setLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState('');
  const [disposition, setDisposition] = useState('');
  const [subDisposition, setSubDisposition] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [settlement, setSettlement] = useState('');
  const [callDrop, setCallDrop] = useState('No');
  const [altNumber, setAltNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  const dispositions = connectStatus && DISPOSITION_LOGIC[connectStatus] ? Object.keys(DISPOSITION_LOGIC[connectStatus]) : [];
  const subDispositions = connectStatus && disposition && DISPOSITION_LOGIC[connectStatus][disposition] ? DISPOSITION_LOGIC[connectStatus][disposition] : [];
  const activeLogic = subDispositions.find((s: any) => s.name === subDisposition) || {};

  useEffect(() => { setDisposition(''); setSubDisposition(''); }, [connectStatus]);
  useEffect(() => { setSubDisposition(''); }, [disposition]);

  const handleSubmit = async () => {
    const isSubReq = subDispositions.length > 0;
    const isDateReq = !!activeLogic.date;
    const isAmtReq = !!activeLogic.amount;

    if (!connectStatus || !disposition || (isSubReq && !subDisposition) || (isDateReq && !date) || (isAmtReq && !amount) || !remarks) {
      toast('Please fill all required fields');
      return;
    }
    if (showAltNumber && !altNumber) {
      toast('Please provide an alternate number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/disposition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          connectStatus,
          disposition,
          subDisposition,
          date,
          amount,
          settlement,
          callDrop,
          altNumber,
          remarks
        })
      });
      if (res.ok) {
        toast('Lead disposition updated successfully');
        closeModal();
        onDone();
      } else {
        toast('Failed to update disposition');
      }
    } catch (e) {
      toast('Error updating disposition');
    } finally {
      setLoading(false);
    }
  };

  const showAltNumber = ['Right Party Connect', 'Third Party Connect', 'Wrong Party Connect'].includes(connectStatus);

  return (
    <div className="p-4 space-y-3.5 text-xs">
      <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-none text-blue-950 font-medium">
        Updating Disposition for: <strong>{lead?.name}</strong> • <strong>{(lead?.account_no || '').replace(/LN-|-/g, '')}</strong>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Connect Status *</label>
          <select className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-semibold text-slate-800" value={connectStatus} onChange={e => setConnectStatus(e.target.value)}>
            <option value="">— Select —</option>
            {Object.keys(DISPOSITION_LOGIC).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Disposition *</label>
          <select className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-semibold text-slate-800" value={disposition} onChange={e => setDisposition(e.target.value)} disabled={!dispositions.length}>
            <option value="">— Select —</option>
            {dispositions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Sub Disposition {subDispositions.length > 0 ? '*' : ''}</label>
          <select className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-semibold text-slate-800" value={subDisposition} onChange={e => setSubDisposition(e.target.value)} disabled={!subDispositions.length}>
            <option value="">— Select —</option>
            {subDispositions.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {activeLogic.date && (
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Action Date *</label>
            <input className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        )}
        {activeLogic.amount && (
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Amount (₹) *</label>
            <input className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-mono text-xs" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        )}
        {showAltNumber && (
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Alternate Number *</label>
            <input className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs" placeholder="Enter alternate mobile..." value={altNumber} onChange={e => setAltNumber(e.target.value)} />
          </div>
        )}
      </div>

      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[10px]">Remarks / Call Notes *</label>
        <textarea className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs" rows={3} placeholder="Enter detailed interaction notes..." value={remarks} onChange={e => setRemarks(e.target.value)} />
      </div>

      <button 
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none shadow-2xs cursor-pointer transition-colors"
        onClick={handleSubmit} 
        disabled={loading}
      >
        {loading ? 'Saving...' : '✓ Save Disposition'}
      </button>
    </div>
  );
}
