"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { CheckCircle2, XCircle, Upload, FileSpreadsheet, Info, ArrowRight, Loader2, Trash2, Activity, Calendar, Clock, Lock, AlertCircle, ChevronDown } from "lucide-react";
import { ButtonGroup, Button as PolarisButton } from '@shopify/polaris';
import { ValidationTable } from '@/components/ValidationTable';
import { useApp } from '@/context/AppContext';



const PremiumSelect = ({ label, options, value, onChange, placeholder, disabled = false, isAdminProxy = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-[200px]" ref={dropdownRef}>
      <span className={`text-[10px] font-bold uppercase tracking-widest pl-2 ${isAdminProxy ? 'text-primary' : 'text-slate-400'}`}>
        {label}
      </span>
      <div className="relative w-full">
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer border ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200' :
            isAdminProxy ? 'bg-primary/5 border-primary/20 text-primary hover:border-primary/40' : 
            'bg-slate-50 border-slate-200/60 text-slate-700 hover:border-primary/30 hover:bg-white'
          } ${isOpen ? 'ring-2 ring-primary/30 border-primary/50 bg-white' : ''}`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isAdminProxy ? 'text-primary' : 'text-slate-400'}`} />
        </div>
        
        {isOpen && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1 max-h-[300px] overflow-y-auto no-scrollbar">
            <div 
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-50 ${value === '' ? 'bg-primary/5 text-primary' : 'text-slate-500'}`}
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </div>
            {options.map((opt: any, i: number) => (
              <div 
                key={i}
                className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-50 ${value === opt.value ? 'bg-primary/5 text-primary' : 'text-slate-700'}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function UploadPage() {
  const { user } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // New State for Full Row Validation
  const [validatedData, setValidatedData] = useState<{valid: any[], invalid: any[]}|null>(null);
  const [validationView, setValidationView] = useState<'summary'|'valid'|'invalid'>('summary');
  
  const [message, setMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [needsPassword, setNeedsPassword] = useState(false);
  const [filePassword, setFilePassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    missingHeaders: string[];
    foundHeaders: string[];
    rowCount: number;
    sheetName?: string;
  } | null>(null);

  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [globalDate, setGlobalDate] = useState<string>('');
  const [globalDateObj, setGlobalDateObj] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
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
  
  const selectedClient = React.useMemo(() => {
    if (!selectedClientName || !selectedProductType) return '';
    const client = clientsList.find(c => c.name === selectedClientName && c.product_type === selectedProductType);
    return client ? String(client.id) : '';
  }, [clientsList, selectedClientName, selectedProductType]);
  
  const activeHeaders = React.useMemo(() => {
    const currentClientData = clientsList.find(c => String(c.id) === String(selectedClient));
    const locName = locationsList.find(l => String(l.id) === String(selectedLocation))?.name || '';

    if (currentClientData?.required_columns) {
      let parsed = currentClientData.required_columns;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch(e) { parsed = []; }
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        const standardKeys = masterColumns.map(h => h.key);
        const keysList = parsed.map((p: any) => p.key || p);
        const active = masterColumns.filter(h => keysList.includes(h.key));
        const customKeys = keysList.filter((k: string) => !standardKeys.includes(k));
        const customHeaders = customKeys.map((key: string) => ({
           key,
           labels: [key, key.toLowerCase(), key.toUpperCase()],
           display: key
        }));
        if (active.length > 0 || customHeaders.length > 0) {
          return [...active, ...customHeaders];
        }
      }
    }
    return masterColumns;
  }, [clientsList, selectedClient, locationsList, selectedLocation, masterColumns]);

  useEffect(() => {
    let url = '/api/universal/clients';
    const params = new URLSearchParams();
    if (user?.role === 'admin' && targetEmployeeId) {
      params.append('proxyUserId', targetEmployeeId);
    }
    if (selectedLocation) {
      params.append('location_id', selectedLocation);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    fetch(url).then(r => r.json()).then(d => {
      if (d.success) {
        setClientsList(d.data);
        // Clear selected process if it's not available for the new proxy user or location
        if (selectedClientName && selectedProductType && !d.data.find((p: any) => p.name === selectedClientName && p.product_type === selectedProductType)) {
          setSelectedClientName('');
          setSelectedProductType('');
        }
      }
    });
  }, [user, targetEmployeeId, selectedLocation]);

  useEffect(() => {
    fetch('/api/universal/locations').then(r => r.json()).then(d => {
      if (d.success) setLocationsList(d.data);
    });
    fetch('/api/admin/columns').then(r => r.json()).then(d => {
      if (d.success) setMasterColumns(d.data);
    });
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/users').then(r => r.json()).then(d => {
        if (d.users) {
          const phs = d.users.filter((u: any) => u.role === 'user');
          setUsersList(phs);
        }
      });
    }
  }, [user]);

  // Fetch global internet date (not system clock)
  useEffect(() => {
    const fetchGlobalDate = async () => {
      let dt: Date | null = null;
      try {
        const res = await fetch('/api/time');
        const data = await res.json();
        dt = new Date(data.datetime);
      } catch {
        console.warn("Time API failed, falling back to local system time.");
        dt = new Date();
      }
      if (dt) {
        setGlobalDateObj(dt);
        setGlobalDate(dt.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
        // Set default selected date to yesterday (day-1)
        const yesterday = new Date(dt.getTime() - 86400000);
        setSelectedDate(yesterday.toISOString().split('T')[0]);
        setSelectedYear(dt.getFullYear());
        // Calculate offset between global time and local system time
        setGlobalTimeOffset(dt.getTime() - Date.now());
      }
    };
    fetchGlobalDate();
  }, []);

  // Live countdown to midnight IST (based on global time offset)
  useEffect(() => {
    if (!globalDateObj) return;
    const interval = setInterval(() => {
      const nowReal = Date.now() + globalTimeOffset;
      // IST is UTC + 5:30
      const nowIST = new Date(nowReal + 5.5 * 3600000);
      
      const msSinceMidnightIST = 
        (nowIST.getUTCHours() * 3600000) + 
        (nowIST.getUTCMinutes() * 60000) + 
        (nowIST.getUTCSeconds() * 1000) + 
        nowIST.getUTCMilliseconds();
        
      const diff = (24 * 3600000) - msSinceMidnightIST;
      
      if (diff <= 0) {
        setCountdown('00:00:00');
        // Ideally reload date here, but for now just stop
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [globalTimeOffset, globalDateObj]);

  // Compute last 2 days before current date (e.g. 28th → show 27th & 26th)
  const dateOptions = globalDateObj ? (() => {
    const day1 = new Date(globalDateObj.getTime() - 86400000);      // yesterday
    const day2 = new Date(globalDateObj.getTime() - 86400000 * 2);  // day before yesterday
    return [
      {
        label: day1.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        value: day1.toISOString().split('T')[0],
        display: day1.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      },
      {
        label: day2.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        value: day2.toISOString().split('T')[0],
        display: day2.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    ];
  })() : [];

  // Year options: current year and previous year
  const yearOptions = globalDateObj ? [
    globalDateObj.getFullYear(),
    globalDateObj.getFullYear() - 1
  ] : [new Date().getFullYear(), new Date().getFullYear() - 1];

  // SSE for real-time job progress
  useEffect(() => {
    if (!activeJob?.id || activeJob.status === 'COMPLETED' || activeJob.status === 'FAILED') return;

    const eventSource = new EventSource(`/api/jobs/stream?jobId=${activeJob.id}`);

    eventSource.onmessage = (event) => {
      const updatedJob = JSON.parse(event.data);
      setActiveJob(updatedJob);
      
      if (updatedJob.status === 'COMPLETED' || updatedJob.status === 'FAILED') {
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [activeJob?.id]);

  const normalize = (s: string) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  const validateFile = async (providedPassword?: string) => {
    if (!file) return;
    setIsValidating(true);
    setMessage("");
    setValidationResult(null);
    setActiveJob(null); // Reset active job when new file selected
    setNeedsPassword(false);
    
    const currentPassword = providedPassword || filePassword;

    const processWorkbook = (workbook: any) => {
      let bestResult: any = null;
      let maxTotalMatches = -1;

      // Scan all sheets to find the best one
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        if (!rows || rows.length === 0) continue;

        let currentSheetMaxMatches = 0;
        let currentSheetHeaderIndex = 0;

        // Scan first 50 rows of this sheet
        for (let i = 0; i < Math.min(50, rows.length); i++) {
          const row = rows[i];
          if (!row || !Array.isArray(row)) continue;
          
          const normalizedRow = row.map(k => normalize(String(k)));
          let matches = 0;
          activeHeaders.forEach((req: any) => {
            if (req.labels && req.labels.some((label: string) => normalizedRow.includes(normalize(label)))) {
              matches++;
            }
          });

          if (matches > currentSheetMaxMatches) {
            currentSheetMaxMatches = matches;
            currentSheetHeaderIndex = i;
          }
        }

        if (currentSheetMaxMatches > maxTotalMatches) {
          maxTotalMatches = currentSheetMaxMatches;
          
          const headerRow = rows[currentSheetHeaderIndex].map(k => normalize(String(k)));
          const missing: string[] = [];
          const found: string[] = [];

          activeHeaders.forEach((req: any) => {
            if (req.labels && req.labels.some((label: string) => headerRow.includes(normalize(label)))) found.push(req.display);
            else missing.push(req.display);
          });

          bestResult = {
            isValid: missing.length === 0,
            missingHeaders: missing,
            foundHeaders: found,
            rowCount: rows.length - (currentSheetHeaderIndex + 1),
            sheetName: sheetName,
            headerIndex: currentSheetHeaderIndex
          };
        }
      }

      if (!bestResult || maxTotalMatches === 0) {
        setValidationResult({
          isValid: false,
          missingHeaders: activeHeaders.map((r: any) => r.display),
          foundHeaders: [],
          rowCount: 0
        });
        setMessage("Error: No matching headers found in any sheet. Please check your column names.");
        setValidatedData(null);
      } else {
        setValidationResult(bestResult);
        
        if (!bestResult.isValid) {
          setMessage(`Found some headers in sheet "${bestResult.sheetName}", but ${bestResult.missingHeaders.length} are missing.`);
          setValidatedData(null);
        } else {
          // Perform Full Row Validation since headers are valid
          const sheet = workbook.Sheets[bestResult.sheetName];
          const allData = XLSX.utils.sheet_to_json(sheet, { range: bestResult.headerIndex }) as any[];
          
          const validRows: any[] = [];
          const invalidRows: any[] = [];

          allData.forEach((row: any, idx: number) => {
            const get = (keys: string[]) => {
              for (const k of keys) {
                const target = normalize(k);
                const foundKey = Object.keys(row).find(r => normalize(r) === target);
                if (foundKey !== undefined && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
              }
              return null;
            };

            const accNo = get(['Account_No', 'Account No', 'LAN', 'Loan No']);
            const location = get(['Location', 'location', 'City']);
            const client = get(['Client', 'client', 'Customer']);
            let money = get(['Money_Collected', 'Money Collected', 'Amount']);
            if (typeof money === 'string') money = parseFloat(money.replace(/,/g, ''));

            const errors = [];
            const isRequired = (key: string) => activeHeaders.some((h: any) => h.key === key);
            
            if (isRequired('account_no') && !accNo) errors.push("Missing Account No");
            if (isRequired('location') && !location) errors.push("Missing Location");
            if (isRequired('client') && !client) errors.push("Missing Process");
            if (isRequired('money_collected') && (money === null || isNaN(money))) errors.push("Missing/Invalid Amount");
            
            if (errors.length > 0) {
              invalidRows.push({ _rowIndex: idx + 2, _errors: errors, ...row });
            } else {
              validRows.push({ _rowIndex: idx + 2, ...row });
            }
          });

          setValidatedData({ valid: validRows, invalid: invalidRows });
          setValidationView('summary');
        }
      }
    };

    try {
      if (currentPassword && needsPassword) {
        // Vercel Serverless Bypass: We cannot decrypt files in the browser or on Vercel without Python.
        // We assume it's valid and let the local worker handle decryption and validation.
        setValidationResult({ isValid: true, missingHeaders: [], foundHeaders: activeHeaders.map((h: any) => h.display), rowCount: 0 });
        setValidatedData(null);
        setNeedsPassword(false); // Hide password prompt
        setFilePassword(currentPassword);
        setIsValidating(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          processWorkbook(workbook);
        } catch (err: any) {
          if (err?.message?.includes("password-protected")) {
            setNeedsPassword(true);
            setMessage("File is password-protected.");
          } else {
            console.error("Parse error:", err);
            setMessage("Error parsing Excel file.");
          }
        }
        setIsValidating(false);
      };
      reader.onerror = () => {
        setMessage("Error reading file.");
        setIsValidating(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setMessage("Error processing file.");
      setIsValidating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationResult(null);
      setValidatedData(null);
      setMessage("");
      setNeedsPassword(false);
      setFilePassword("");
    }
  };

  const handleUpload = async () => {
    if (!file || (validationResult && !validationResult.isValid)) return;
    
    if (!selectedClient) {
      setMessage("Error: Please select a Client from the dropdown before uploading!");
      return;
    }
    
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append('file', file);
    if (filePassword) {
      formData.append('password', filePassword);
    }
    if (selectedDate) {
      formData.append('upload_at', selectedDate);
    }
    if (selectedClient) {
      formData.append('client_id', selectedClient);
    }
    // Always use admin-selected product type (not from Excel)
    if (selectedProductType) {
      formData.append('product_type', selectedProductType);
    }
    // Send selected location so worker can use it
    if (selectedLocation) {
      formData.append('location_id', selectedLocation);
    }
    if (user?.employee_id) formData.append('employee_id', user.employee_id);
    if (user?.name) formData.append('name', user.name);
    if (targetEmployeeId) formData.append('target_employee_id', targetEmployeeId);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: File uploaded! Tracking progress below.`);
        setFile(null);
        setValidationResult(null);
        setValidatedData(null);
        setActiveJob({ id: data.jobId, status: 'PENDING', processed_rows: 0, total_rows: 0 });
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch { setMessage("Upload failed. Please try again."); }
    setUploading(false);
  };

  const progressPercent = activeJob?.total_rows > 0 ? Math.round((activeJob.processed_rows / activeJob.total_rows) * 100) : 0;

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar bg-slate-50/30">
      <div className="w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
        
        {/* Global Page Filters - Premium Floating Bar */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-sm border border-slate-200/60">
          {user?.role === 'admin' && (
            <PremiumSelect 
              label="Location"
              placeholder="All Locations"
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={locationsList.map(l => ({ label: l.name, value: l.id }))}
            />
          )}

          <PremiumSelect 
            label="Client"
            placeholder="Select Client"
            value={selectedClientName}
            onChange={(val: string) => {
              setSelectedClientName(val);
              setSelectedProductType('');
            }}
            options={Array.from(new Set(clientsList.map(p => p.name))).sort().map(name => ({ label: name as string, value: name as string }))}
          />

          <PremiumSelect 
            label="Product"
            placeholder="Select Product"
            value={selectedProductType}
            onChange={setSelectedProductType}
            disabled={!selectedClientName}
            options={clientsList.filter(c => c.name === selectedClientName).map(p => ({ label: p.product_type, value: p.product_type }))}
          />

          {user?.role === 'admin' && (
            <PremiumSelect 
              label="Admin Proxy"
              placeholder="Select Target User"
              value={targetEmployeeId}
              onChange={setTargetEmployeeId}
              isAdminProxy={true}
              options={usersList.map(u => ({ label: `${u.name} (${u.employee_id})`, value: u.employee_id }))}
            />
          )}
        </div>

        <div className="flex flex-col lg:flex-row-reverse gap-8">
          
          {/* RIGHT SIDE: Validation Sidebar */}
          <div className="w-full lg:w-[380px] flex-shrink-0 space-y-6">
            <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3.5 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-bold text-slate-800 text-base">Column Validation</span>
                </CardTitle>
                <CardDescription className="text-xs font-medium mt-1">
                  {selectedClient ? `${activeHeaders.length} required headers checked.` : 'Select a client to view required columns.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {isValidating ? (
                  <div className="flex flex-col items-center py-16 text-slate-400 gap-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                    <p className="text-sm font-semibold tracking-wide">Analyzing structure...</p>
                  </div>
                ) : !validationResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border flex items-center gap-4 bg-slate-50/80 border-slate-100 shadow-inner">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-white border border-slate-200 text-slate-500">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Required Columns</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {selectedClient ? 'Must match exactly' : 'Select a client first'}
                        </p>
                      </div>
                    </div>
                    {selectedClient && (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                        {activeHeaders.map((req: any) => (
                          <div key={req.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100/60">
                            <span className="text-xs font-semibold text-slate-700">{req.display}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Required</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl border flex items-center gap-4 ${validationResult.isValid ? 'bg-emerald-50 border-emerald-100 shadow-inner' : 'bg-red-50 border-red-100 shadow-inner'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${validationResult.isValid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {validationResult.isValid ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className={`text-base font-black ${validationResult.isValid ? 'text-emerald-700' : 'text-red-700'}`}>
                          {validationResult.isValid ? 'Ready to Upload' : 'Errors Found'}
                        </p>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">{validationResult.foundHeaders.length}/{activeHeaders.length} matched perfectly</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                      {activeHeaders.map((req: any) => {
                        const found = validationResult.foundHeaders.includes(req.display);
                        return (
                          <div key={req.key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100/60">
                            <span className={`text-xs font-bold ${found ? 'text-slate-800' : 'text-slate-400'}`}>{req.display}</span>
                            {found ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Badge variant="destructive" className="text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded-md">Missing</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!validationResult.isValid && (
                      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex gap-3 shadow-inner">
                        <Info className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-900 leading-relaxed font-medium">
                          <span className="font-bold block mb-1">Action Required</span> Rename the missing columns in your Excel sheet to match the list exactly.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* LEFT SIDE: Main Upload Workspace */}
          <div className="flex-1 space-y-6">
            
            {/* Main Upload Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              
              {/* Header inside Upload Card */}
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div className="space-y-1.5">
                  <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm">
                      <Upload className="w-6 h-6 text-white" style={{ strokeWidth: 2.5 }} />
                    </div>
                    Data Upload
                  </h2>
                  <p className="text-sm text-slate-500 font-medium ml-[2.75rem]">Drag & drop your files securely into the workspace.</p>
                </div>
                
                {/* Timers & Date Info */}
                <div className="flex flex-col sm:items-end gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {globalDate && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">{globalDate}</span>
                      </div>
                    )}
                    {countdown && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm">
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span className="text-xs font-black text-amber-700 tabular-nums tracking-wide">{countdown}</span>
                        <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest ml-1 hidden sm:inline">left</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Selection Bar */}
              {dateOptions.length > 0 && (
                <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-4">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Date</span>
                   <div className="flex bg-slate-50 border border-slate-200/60 rounded-2xl p-1 shadow-inner">
                     {dateOptions.map((opt) => (
                       <button
                         key={opt.value}
                         onClick={() => setSelectedDate(opt.value)}
                         className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedDate === opt.value ? 'bg-white shadow-sm border border-slate-200/50 text-primary scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                       >
                         {opt.display}
                       </button>
                     ))}
                   </div>
                   {user?.role === 'admin' && (
                     <input 
                       type="date" 
                       className="bg-white border border-slate-200/60 rounded-2xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all"
                       value={selectedDate}
                       onChange={(e) => setSelectedDate(e.target.value)}
                     />
                   )}
                </div>
              )}

              {/* Dropzone Area */}
              <div className="p-5 flex flex-col flex-1">
                <label
                  className={`group relative flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 flex-1 min-h-[200px]
                    ${isDragOver ? 'border-primary bg-primary/5 scale-[1.01] shadow-[0_0_40px_rgba(79,125,255,0.1)]' : file ? 'border-primary/40 bg-gradient-to-b from-primary/5 to-transparent' : 'border-slate-300 bg-slate-50/50 hover:border-primary/50 hover:bg-slate-100/50 hover:shadow-xl hover:-translate-y-1'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDragOver(false); 
                    if (e.dataTransfer.files[0]) {
                      setFile(e.dataTransfer.files[0]);
                      setValidationResult(null);
                      setMessage("");
                      setNeedsPassword(false);
                      setFilePassword("");
                    }
                  }}
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    className="sr-only" 
                    onChange={handleFileChange} 
                  />

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${file ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/40 scale-110' : 'bg-white border border-slate-200 text-slate-400 shadow-sm group-hover:scale-110 group-hover:text-primary group-hover:border-primary/30 group-hover:shadow-xl'}`}>
                    {file ? <FileSpreadsheet className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  </div>

                  {file ? (
                    <div className="text-center px-4">
                      <p className="text-lg font-black text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-1 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB <span className="mx-2">•</span> {validationResult?.rowCount || 0} rows found</p>
                      <Button variant="ghost" size="sm" onClick={(e) => { 
                        e.preventDefault(); 
                        setFile(null); 
                        setValidationResult(null);
                        setValidatedData(null);
                        setMessage("");
                        setNeedsPassword(false);
                        setFilePassword("");
                        setIsValidating(false);
                        setUploading(false);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }} className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs h-9 px-4 rounded-xl">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <p className="text-lg font-black text-slate-800">Drag & Drop your file here</p>
                      <p className="text-sm text-slate-400 mt-2 font-medium">or click to browse from your computer</p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                         <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">.XLSX</span>
                         <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">.XLS</span>
                         <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">.CSV</span>
                      </div>
                    </div>
                  )}
                </label>

                {/* Password Prompt */}
                {needsPassword && (
                  <div className="mt-6 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-3xl p-6 flex flex-col gap-4 shadow-sm animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 text-amber-800">
                      <div className="w-6 h-6 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <span className="text-sm font-black block">Protected File</span>
                        <span className="text-xs font-medium opacity-80">Enter password to decrypt and read contents</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="password" 
                        placeholder="Enter file password" 
                        className="flex-1 rounded-2xl border border-amber-300 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                        value={filePassword}
                        onChange={(e) => setFilePassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && validateFile()}
                      />
                      <Button
                        onClick={() => validateFile()}
                        disabled={!filePassword || isValidating}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 h-auto rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                      >
                        {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Decrypt & Verify'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => validateFile()}
                    disabled={!file || !selectedClient || isValidating || uploading}
                    className="flex-1 py-4 rounded-xl text-sm font-bold shadow-sm transition-all border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:-translate-y-0.5"
                    size="lg"
                    variant="outline"
                  >
                    {isValidating ? (
                      <><Loader2 className="w-5 h-5 mr-3 animate-spin text-primary" /> Scanning Document...</>
                    ) : (
                      <>Validate Data Format</>
                    )}
                  </Button>

                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading || !validationResult?.isValid || !selectedDate || !selectedClient}
                    className={`flex-[2] py-4 rounded-xl text-sm font-black shadow-sm transition-all duration-300 ${
                      (validationResult?.isValid && selectedDate && selectedClient) 
                        ? 'bg-gradient-to-r from-primary to-blue-600 hover:shadow-[0_12px_40px_rgba(37,99,235,0.3)] text-white hover:-translate-y-1 border-none' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none'
                    }`}
                    size="lg"
                  >
                    {uploading ? (
                      <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing Upload...</>
                    ) : (
                      <>Upload & Process <ArrowRight className="w-5 h-5 ml-3 opacity-70" /></>
                    )}
                  </Button>
                </div>

                {message && (
                  <div className={`mt-6 flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold border ${message.includes('Error') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {message.includes('Error') ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {message}
                  </div>
                )}

              </div>
            </div>

            {/* Validation Data Results */}
            {validatedData && (
              <div className="animate-in slide-in-from-bottom-4 space-y-6">
                {validationView === 'summary' && (
                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => setValidationView('valid')}
                      className="flex flex-col items-center justify-center p-5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all shadow-sm group hover:-translate-y-1"
                    >
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-3xl font-black text-emerald-700">{validatedData.valid.length}</span>
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-2">Valid Rows</span>
                    </button>
                    
                    <button 
                      onClick={() => setValidationView('invalid')}
                      className="flex flex-col items-center justify-center p-5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition-all shadow-sm group hover:-translate-y-1"
                    >
                      <AlertCircle className="w-6 h-6 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-3xl font-black text-red-700">{validatedData.invalid.length}</span>
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest mt-2">Error Rows</span>
                    </button>
                  </div>
                )}
                
                {validationView === 'valid' && (
                  <ValidationTable 
                    data={validatedData.valid} 
                    type="valid" 
                    onClose={() => setValidationView('summary')} 
                  />
                )}
                
                {validationView === 'invalid' && (
                  <ValidationTable 
                    data={validatedData.invalid} 
                    type="invalid" 
                    onClose={() => setValidationView('summary')} 
                  />
                )}
              </div>
            )}

            {/* Live Progress Card */}
            {activeJob && (
              <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom-8 duration-500 mt-6 bg-white">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-5 px-8">
                  <CardTitle className="text-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                         <Activity className="w-4 h-4 text-primary animate-pulse" />
                       </div>
                       <span className="font-black text-slate-800">Live Progress</span>
                     </div>
                     <Badge variant="outline" className="bg-white font-bold text-[10px] px-3 py-1 rounded-full border-slate-200">
                       Job ID: {activeJob.id.slice(0, 8)}
                     </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {activeJob.status === 'COMPLETED' ? 'Done' : 'Processing Records...'}
                      </p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">
                        {activeJob.processed_rows.toLocaleString()} <span className="text-xl font-bold text-slate-300">/ {activeJob.total_rows.toLocaleString()}</span>
                      </p>
                    </div>
                    <p className="text-3xl font-black text-primary tracking-tighter">{progressPercent}%</p>
                  </div>

                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${activeJob.status === 'FAILED' ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-blue-400'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      {activeJob.status === 'PROCESSING' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                      <span className="text-slate-400">Status:</span> 
                      <span className={activeJob.status === 'COMPLETED' ? 'text-emerald-500' : activeJob.status === 'FAILED' ? 'text-red-500' : 'text-primary'}>{activeJob.status}</span>
                    </div>
                  </div>

                  {/* Show Error / Warning Details */}
                  {activeJob.error_log && (
                    <div className="mt-4 p-5 rounded-2xl text-xs font-semibold border bg-slate-50 border-slate-200">
                      {(() => {
                        let parsed: any = activeJob.error_log;
                        if (typeof parsed === 'string') {
                          try { parsed = JSON.parse(parsed); } catch {}
                        }
                        
                        if (typeof parsed === 'string') {
                          return <div className="text-red-600 flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> <span>{parsed}</span></div>;
                        } else if (parsed && typeof parsed === 'object') {
                          return (
                            <div className="flex flex-col gap-3 text-slate-600">
                              {parsed.duplicates_found > 0 && (
                                <div className="text-amber-600 flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                  <AlertCircle className="w-5 h-5" />
                                  <span>Marked <strong>{parsed.duplicates_found} records</strong> as duplicate.</span>
                                </div>
                              )}
                              {parsed.failed_count > 0 && (
                                <div className="text-red-600 flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                                  <XCircle className="w-5 h-5" />
                                  <span>Failed to insert <strong>{parsed.failed_count} records</strong>.</span>
                                </div>
                              )}
                              {parsed.last_error && <div className="text-red-600 mt-2 flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> Error: {parsed.last_error}</div>}
                              {parsed.details && Array.isArray(parsed.details) && parsed.details.length > 0 && (
                                <div className="mt-3 max-h-40 overflow-y-auto rounded-xl bg-red-50 p-4 border border-red-100 no-scrollbar shadow-inner">
                                  <p className="text-[10px] font-black text-red-800 mb-2 uppercase tracking-widest">Error Details (Upload Cancelled):</p>
                                  <ul className="list-disc pl-5 space-y-1.5">
                                    {parsed.details.map((err: string, i: number) => (
                                      <li key={i} className="text-xs font-semibold text-red-700 leading-tight">{err}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {(!parsed.duplicates_found && !parsed.failed_count && !parsed.last_error && !parsed.details) && (
                                <div className="text-emerald-600 flex items-start gap-3"><CheckCircle2 className="w-5 h-5 shrink-0" /> <span>{parsed.status || 'Success'}</span></div>
                              )}
                            </div>
                          );
                        } else {
                          return <div className="text-red-600 flex items-start gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> <span>{String(parsed)}</span></div>;
                        }
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}
