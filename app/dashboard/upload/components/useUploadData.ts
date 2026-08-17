"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { parseAndValidateWorkbook } from './uploadWorkbookValidator';

export function useUploadData() {
  const { user } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validatedData, setValidatedData] = useState<{valid: any[], invalid: any[]}|null>(null);
  const [validationView, setValidationView] = useState<'summary'|'valid'|'invalid'>('summary');
  const [message, setMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [filePassword, setFilePassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [globalDate, setGlobalDate] = useState<string>('');
  const [globalDateObj, setGlobalDateObj] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');
  const [globalTimeOffset, setGlobalTimeOffset] = useState<number>(0);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('');
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [locationsList, setLocationsList] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [masterColumns, setMasterColumns] = useState<any[]>([]);

  const selectedClient = useMemo(() => {
    if (!selectedClientName || !selectedProductType) return '';
    const client = clientsList.find(c => c.name === selectedClientName && c.product_type === selectedProductType);
    return client ? String(client.id) : '';
  }, [clientsList, selectedClientName, selectedProductType]);

  const activeHeaders = useMemo(() => {
    const currentClientData = clientsList.find(c => String(c.id) === String(selectedClient));
    if (currentClientData?.required_columns) {
      let parsed = currentClientData.required_columns;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { parsed = []; }
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        const standardKeys = masterColumns.map(h => h.key);
        const keysList = parsed.map((p: any) => p.key || p);
        const active = masterColumns.filter(h => keysList.includes(h.key));
        const customHeaders = keysList.filter((k: string) => !standardKeys.includes(k)).map((key: string) => ({
          key, labels: [key, key.toLowerCase(), key.toUpperCase()], display: key
        }));
        if (active.length > 0 || customHeaders.length > 0) return [...active, ...customHeaders];
      }
    }
    return masterColumns;
  }, [clientsList, selectedClient, masterColumns]);

  useEffect(() => {
    let url = '/api/universal/clients';
    const params = new URLSearchParams();
    if (user?.role === 'admin' && targetEmployeeId) params.append('proxyUserId', targetEmployeeId);
    if (selectedLocation) params.append('location_id', selectedLocation);
    if (params.toString()) url += `?${params.toString()}`;
    fetch(url).then(r => r.json()).then(d => { if (d.success) setClientsList(d.data); });
  }, [user, targetEmployeeId, selectedLocation]);

  useEffect(() => {
    fetch('/api/universal/locations').then(r => r.json()).then(d => { if (d.success) setLocationsList(d.data); });
    fetch('/api/admin/columns').then(r => r.json()).then(d => { if (d.success) setMasterColumns(d.data); });
    if (user?.role === 'admin') {
      fetch('/api/users').then(r => r.json()).then(d => { if (d.users) setUsersList(d.users.filter((u: any) => u.role === 'user')); });
    }
    fetch('/api/time').then(r => r.json()).then(data => {
      const dt = new Date(data.datetime);
      setGlobalDateObj(dt);
      setGlobalDate(dt.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
      setSelectedDate(new Date(dt.getTime() - 86400000).toISOString().split('T')[0]);
      setGlobalTimeOffset(dt.getTime() - Date.now());
    }).catch(() => {
      const dt = new Date();
      setGlobalDateObj(dt);
      setGlobalDate(dt.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
      setSelectedDate(new Date(dt.getTime() - 86400000).toISOString().split('T')[0]);
    });
  }, [user]);

  // Midnight IST countdown
  useEffect(() => {
    if (!globalDateObj) return;
    const interval = setInterval(() => {
      const nowIST = new Date(Date.now() + globalTimeOffset + 5.5 * 3600000);
      const ms = (nowIST.getUTCHours() * 3600000) + (nowIST.getUTCMinutes() * 60000) + (nowIST.getUTCSeconds() * 1000) + nowIST.getUTCMilliseconds();
      const diff = (24 * 3600000) - ms;
      if (diff <= 0) { setCountdown('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [globalTimeOffset, globalDateObj]);

  // SSE Stream
  useEffect(() => {
    if (!activeJob?.id || activeJob.status === 'COMPLETED' || activeJob.status === 'FAILED') return;
    const es = new EventSource(`/api/jobs/stream?jobId=${activeJob.id}`);
    es.onmessage = (e) => {
      const updated = JSON.parse(e.data);
      setActiveJob(updated);
      if (updated.status === 'COMPLETED' || updated.status === 'FAILED') es.close();
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [activeJob?.id]);

  const dateOptions = useMemo(() => {
    if (!globalDateObj) return [];
    const d1 = new Date(globalDateObj.getTime() - 86400000);
    const d2 = new Date(globalDateObj.getTime() - 86400000 * 2);
    return [
      { label: d1.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), value: d1.toISOString().split('T')[0], display: d1.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
      { label: d2.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), value: d2.toISOString().split('T')[0], display: d2.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
    ];
  }, [globalDateObj]);

  const validateFile = async (providedPassword?: string) => {
    if (!file) return;
    setIsValidating(true); setMessage(""); setValidationResult(null); setActiveJob(null); setNeedsPassword(false);
    const currentPassword = providedPassword || filePassword;

    try {
      if (currentPassword && needsPassword) {
        setValidationResult({ isValid: true, missingHeaders: [], foundHeaders: activeHeaders.map((h: any) => h.display), rowCount: 0 });
        setValidatedData(null); setNeedsPassword(false); setFilePassword(currentPassword); setIsValidating(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const { validationResult: res, validatedData: vData, errorMessage } = parseAndValidateWorkbook(data, activeHeaders);
          setValidationResult(res);
          if (vData) setValidatedData(vData);
          if (errorMessage) setMessage(errorMessage);
        } catch (err: any) {
          if (err?.message?.includes("password-protected")) setNeedsPassword(true);
          else setMessage("Error reading file");
        } finally { setIsValidating(false); }
      };
      reader.readAsArrayBuffer(file);
    } catch { setIsValidating(false); }
  };

  useEffect(() => { if (file) validateFile(); }, [file, activeHeaders]);

  const handleUpload = async () => {
    if (!file || !validationResult?.isValid) return;
    setUploading(true); setMessage("Starting ingestion...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("date", selectedDate);
    if (selectedClient) formData.append("clientId", selectedClient);
    if (selectedLocation) formData.append("locationId", selectedLocation);
    if (filePassword) formData.append("password", filePassword);
    if (user?.role === 'admin' && targetEmployeeId) formData.append("proxyUserId", targetEmployeeId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.jobId) {
        setMessage("File submitted. Ingestion processing in background...");
        setFile(null); setValidationResult(null); setValidatedData(null);
        setActiveJob({ id: data.jobId, status: 'PENDING', processed_rows: 0, total_rows: 0 });
      } else { setMessage(`Error: ${data.error}`); }
    } catch { setMessage("Upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  const progressPercent = activeJob?.total_rows > 0 ? Math.round((activeJob.processed_rows / activeJob.total_rows) * 100) : 0;

  return {
    user, file, setFile, uploading, validatedData, validationView, setValidationView, message,
    isDragOver, setIsDragOver, needsPassword, filePassword, setFilePassword, fileInputRef,
    isValidating, validationResult, activeJob, globalDate, selectedDate, setSelectedDate,
    countdown, usersList, targetEmployeeId, setTargetEmployeeId, clientsList, selectedClientName,
    setSelectedClientName, selectedProductType, setSelectedProductType, locationsList,
    selectedLocation, setSelectedLocation, selectedClient, activeHeaders, dateOptions,
    validateFile, handleUpload, progressPercent
  };
}
