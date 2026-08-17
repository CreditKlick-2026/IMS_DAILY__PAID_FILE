"use client";
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export function RecordLeadPaymentModal({ lead, onDone }: { lead: any; onDone: () => void }) {
  const { user, closeModal, toast } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    mode: 'NEFT',
    ref: '',
    date: '',
    remarks: '',
    upgradeFlag: '',
    upgradeType: '',
    upgradeReason: '',
    status: ''
  });
  const [dupWarning, setDupWarning] = useState<{ type: string; message: string } | null>(null);

  const handleRefChange = (val: string) => {
    setForm({ ...form, ref: val });
    setDupWarning(null);
  };

  const handleSubmit = async (force = false) => {
    if (!form.amount || !form.date || !form.mode || !form.ref || !form.status || !form.remarks) {
      toast('Please fill all required fields: Amount, Mode, Date, Ref No, Status, and Remarks');
      return;
    }
    if (lead.eligible_upgrade === 'Y' || lead.eligible_for_update === 'Y') {
      if (!form.upgradeFlag) { toast('Please select an Upgrade Flag'); return; }
      if (form.upgradeFlag === 'Upgraded' && !form.upgradeType) { toast('Please select an Upgrade Type'); return; }
      if (form.upgradeFlag === 'Pending For Upgrade' && !form.upgradeReason) { toast('Please select an Upgrade Reason'); return; }
    }
    setLoading(true);
    setDupWarning(null);
    try {
      const payRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: lead.id,
          amount: form.amount,
          mode: form.mode,
          ref: form.ref,
          date: form.date,
          remarks: form.remarks,
          agentId: user?.id,
          upgradeFlag: form.upgradeFlag,
          upgradeType: form.upgradeType,
          upgradeReason: form.upgradeReason,
          confirmDuplicate: force
        })
      });

      if (payRes.status === 409) {
        const dupData = await payRes.json();
        setDupWarning({ type: dupData.type === 'ref_duplicate' ? 'hard' : 'soft', message: dupData.message });
        setLoading(false);
        return;
      }

      if (!payRes.ok) {
        toast((await payRes.json()).message || 'Error recording payment');
        setLoading(false);
        return;
      }

      if (form.status && form.status !== lead.status) {
        await fetch(`/api/leads/${lead.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: form.status })
        });
      }

      toast('Payment recorded successfully ✓');
      closeModal();
      onDone();
    } catch (e) {
      toast('Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-3 text-xs">
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-2 text-slate-800 font-semibold rounded-none">
          <span className="block text-[9px] text-slate-400 uppercase">Outstanding</span>
          ₹{Number(lead.outstanding || 0).toLocaleString('en-IN')}
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2 text-slate-800 font-semibold rounded-none">
          <span className="block text-[9px] text-slate-400 uppercase">Min Due</span>
          ₹{Number(lead.min_amt_due || 0).toLocaleString('en-IN')}
        </div>
        <div className="bg-blue-50 border border-blue-200 p-2 text-blue-900 font-bold rounded-none">
          <span className="block text-[9px] text-blue-500 uppercase">Principle</span>
          ₹{Number(lead.principle_outstanding || 0).toLocaleString('en-IN')}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Amount (₹) *</label>
          <input className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-mono text-xs" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment Mode *</label>
          <select className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-semibold text-xs" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
            {['NEFT', 'IMPS', 'UPI', 'Cash', 'Cheque', 'Payment Recieved'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment Date *</label>
          <input className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Reference No. (UTR) *</label>
          <input className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-mono text-xs" value={form.ref} onChange={e => handleRefChange(e.target.value)} placeholder="UTR / Ref number" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Update Status *</label>
          <select className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none font-semibold text-xs text-blue-900" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="">— Select Status —</option>
            {['Rollback', 'Rollforward', 'Normilization', 'STAB'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Remarks / Notes *</label>
        <textarea className="w-full px-2.5 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs" rows={2} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Payment notes..." />
      </div>

      {dupWarning && (
        <div className={`p-2.5 text-xs border rounded-none ${dupWarning.type === 'hard' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
          <p className="font-bold">{dupWarning.message}</p>
          {dupWarning.type === 'soft' && (
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleSubmit(true)} className="px-3 py-1 bg-amber-600 text-white font-bold rounded-none">Submit Anyway</button>
              <button onClick={() => setDupWarning(null)} className="px-3 py-1 bg-white border border-slate-300 rounded-none font-semibold">Cancel</button>
            </div>
          )}
        </div>
      )}

      <button
        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-none shadow-2xs cursor-pointer transition-colors disabled:opacity-50"
        onClick={() => handleSubmit(false)}
        disabled={loading || dupWarning?.type === 'hard'}
      >
        {loading ? 'Processing...' : '💳 Submit Payment for Approval'}
      </button>
    </div>
  );
}
