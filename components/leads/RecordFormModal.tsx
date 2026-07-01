"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import SButton from '../SButton';
import { ButtonGroup, Button } from '@shopify/polaris';
import { DISPOSITION_LOGIC, CONNECT_STATUS_COLORS, PAGE_SIZE } from './constants';

const RecordFormModal = ({ mode, record, onClose, onSave }: { mode: 'add' | 'edit', record?: any, onClose: () => void, onSave: () => void }) => {
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
      const method = mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg2, #ffffff)', width: '600px', maxWidth: '90%', maxHeight: '90vh', borderRadius: 12, display: 'flex', flexDirection: 'column', border: '1px solid var(--bdr)' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 16, color: 'var(--txt)' }}>{mode === 'add' ? 'Add New Record' : 'Edit Record'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--txt)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: 16, flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="ff"><label>Account Number *</label><input required className="finp" name="account_no" value={formData.account_no} onChange={handleChange} /></div>
          <div className="ff"><label>Customer Name *</label><input required className="finp" name="name" value={formData.name} onChange={handleChange} /></div>
          <div className="ff"><label>Money_Collected *</label><input required type="number" className="finp" name="outstanding" value={formData.outstanding} onChange={handleChange} /></div>
          <div className="ff"><label>Product Type</label><input className="finp" name="product" value={formData.product} onChange={handleChange} /></div>
          <div className="ff"><label>Emp Code</label><input className="finp" name="employee_code" value={formData.employee_code} onChange={handleChange} /></div>
          <div className="ff"><label>Client</label><input className="finp" name="client" value={formData.client} onChange={handleChange} /></div>
          <div className="ff"><label>Bucket</label><input className="finp" name="bucket" value={formData.bucket} onChange={handleChange} /></div>
          <div className="ff"><label>Location</label><input className="finp" name="location" value={formData.location} onChange={handleChange} /></div>
          <div className="ff"><label>Payment Mode</label><input className="finp" name="payment_mode" value={formData.payment_mode} onChange={handleChange} /></div>
          <div className="ff"><label>TL Name</label><input className="finp" name="tl_name" value={formData.tl_name} onChange={handleChange} /></div>
          <div className="ff"><label>Agent Name</label><input className="finp" name="agent" value={formData.agent} onChange={handleChange} /></div>
          <div className="ff"><label>APH</label><input className="finp" name="aph" value={formData.aph} onChange={handleChange} /></div>
          <div className="ff"><label>PH</label><input className="finp" name="ph" value={formData.ph} onChange={handleChange} /></div>
          <div className="ff"><label>Mobile No</label><input className="finp" name="mobile_no" value={formData.mobile_no} onChange={handleChange} /></div>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button type="submit" className="btn pr" disabled={loading}>{loading ? 'Saving...' : 'Save Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordFormModal;
