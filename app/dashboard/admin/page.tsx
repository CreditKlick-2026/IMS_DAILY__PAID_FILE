"use client";
import React, { useState, useEffect } from 'react';
import { ButtonGroup, Button } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import {
  Users, Activity, Shield, Trash2, Settings, MoreVertical, Database,
  CheckCircle2, AlertCircle, Edit3, XCircle, Search, Menu, LogOut, FileSpreadsheet, FileText, Loader2, UserPlus, Layers, Info, Upload, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ValidationTable } from '@/components/ValidationTable';

export default function AdminPage() {
  const [activeItem, setActiveItem] = useState('tracker');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newLocation, setNewLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excels, setExcels] = useState<any[]>([]);
  const [excelsLoading, setExcelsLoading] = useState(false);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [locationOptions, setLocationOptions] = useState<{ id: number, name: string }[]>([]);
  const [clientOptions, setClientOptions] = useState<any[]>([]);

  const [trackerMonth, setTrackerMonth] = useState(new Date().getMonth() + 1);
  const [trackerYear, setTrackerYear] = useState(new Date().getFullYear());
  const [trackerData, setTrackerData] = useState<any[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [deleteMonth, setDeleteMonth] = useState(0); // 0 means All Months
  const [deleteYear, setDeleteYear] = useState(new Date().getFullYear());
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [kekaFile, setKekaFile] = useState<File | null>(null);
  const [uploadingKeka, setUploadingKeka] = useState(false);
  const [isValidatingKeka, setIsValidatingKeka] = useState(false);
  const [kekaValidationResult, setKekaValidationResult] = useState<any>(null);
  const [kekaValidatedData, setKekaValidatedData] = useState<{ valid: any[], invalid: any[] } | null>(null);
  const [kekaValidationView, setKekaValidationView] = useState<'summary' | 'valid' | 'invalid'>('summary');
  const [kekaMessage, setKekaMessage] = useState("");
  const [activeKekaJob, setActiveKekaJob] = useState<any | null>(null);

  const [kekaLocation, setKekaLocation] = useState('');
  const [kekaClientName, setKekaClientName] = useState('');
  const [kekaProductType, setKekaProductType] = useState('');


  const [specialEmployees, setSpecialEmployees] = useState<any[]>([]);
  const [specialSearch, setSpecialSearch] = useState('');
  const [specialLoading, setSpecialLoading] = useState(false);
  const [specialPage, setSpecialPage] = useState(1);
  const [specialTotal, setSpecialTotal] = useState(0);
  const [specialLimit] = useState(50);

  const [specialGrid, setSpecialGrid] = useState<any[]>([]);
  const [specialGridLoading, setSpecialGridLoading] = useState(false);
  const [isSavingGrid, setIsSavingGrid] = useState(false);

  const [kekaColumns, setKekaColumns] = useState<any[]>([]);

  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    let url = '/api/admin/keka-columns';
    const kekaClientObj = clientOptions.find(c => c.name === kekaClientName && c.product_type === kekaProductType);
    if (kekaLocation && kekaClientObj && kekaProductType) {
      url += `?location_id=${kekaLocation}&client_id=${kekaClientObj.id}&product_type=${kekaProductType}`;
      fetch(url).then(res => res.json()).then(data => {
        if (data.success) {
          setKekaColumns(data.data);
        }
      }).catch(console.error);
    } else {
      setKekaColumns([]);
    }
  }, [kekaLocation, kekaClientName, kekaProductType, clientOptions]);

  useEffect(() => {
    if (!activeKekaJob?.id || activeKekaJob.status === 'COMPLETED' || activeKekaJob.status === 'FAILED') return;

    const eventSource = new EventSource(`/api/jobs/stream?jobId=${activeKekaJob.id}`);

    eventSource.onmessage = (event) => {
      const updatedJob = JSON.parse(event.data);
      setActiveKekaJob(updatedJob);

      if (updatedJob.status === 'COMPLETED' || updatedJob.status === 'FAILED') {
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [activeKekaJob?.id]);

  const kekaProgressPercent = activeKekaJob?.total_rows > 0 ? Math.round((activeKekaJob.processed_rows / activeKekaJob.total_rows) * 100) : 0;

  useEffect(() => {
    // If not admin, redirect or show nothing
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);


  useEffect(() => {
    fetch('/api/public/locations').then(r => r.json()).then(d => { if (d.success) setLocationOptions(d.data); });
  }, []);

  useEffect(() => {
    let url = '/api/universal/clients';
    if (filterLocation && locationOptions.length > 0) {
      const loc = locationOptions.find(l => l.name === filterLocation);
      if (loc) {
        url += `?location_id=${loc.id}`;
      }
    }
    fetch(url).then(r => r.json()).then(d => {
      if (d.success) {
        setClientOptions(d.data);
        if (filterClient && !d.data.find((p: any) => p.name === filterClient)) {
          setFilterClient('');
        }
      }
    });
  }, [filterLocation, locationOptions]);

  const fetchExcels = () => {
    setExcelsLoading(true);
    let url = `/api/admin/excels?month=${deleteMonth}&year=${deleteYear}`;
    if (filterLocation) url += `&location=${encodeURIComponent(filterLocation)}`;
    if (filterClient) url += `&client_name=${encodeURIComponent(filterClient)}`;
    if (filterProduct) url += `&product_type=${encodeURIComponent(filterProduct)}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setExcels(d.jobs);
          if (d.jobs && d.jobs.length > 0) {
            const firstUser = d.jobs[0].uploaded_by_name || d.jobs[0].uploaded_by_employee_id || 'Unknown User';
            setExpandedUser(firstUser);
          } else {
            setExpandedUser(null);
          }
        }
        setExcelsLoading(false);
      })
      .catch(() => setExcelsLoading(false));
  };

  const fetchTrackerData = () => {
    setTrackerLoading(true);
    let url = `/api/admin/tracker?month=${trackerMonth}&year=${trackerYear}`;
    if (filterLocation) url += `&location=${encodeURIComponent(filterLocation)}`;
    if (filterClient) url += `&client_name=${encodeURIComponent(filterClient)}`;
    if (filterProduct) url += `&product_type=${encodeURIComponent(filterProduct)}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success) setTrackerData(d.data);
        setTrackerLoading(false);
      })
      .catch(() => setTrackerLoading(false));
  };

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        if (d.users) setUsers(d.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (activeItem === 'users') {
      fetchUsers();
    } else if (activeItem === 'excels' || activeItem === 'keka-excels') {
      fetchExcels();
    } else if (activeItem === 'tracker') {
      fetchTrackerData();
    } else if (activeItem === 'special') {
      fetchSpecialEmployees(specialSearch, specialPage);
      fetchSpecialGrid();
    }
  }, [activeItem, trackerMonth, trackerYear, deleteMonth, deleteYear, filterLocation, filterClient, filterProduct]);

  const fetchSpecialEmployees = (search = '', page = 1) => {
    setSpecialLoading(true);
    fetch(`/api/admin/special?search=${encodeURIComponent(search)}&page=${page}&limit=${specialLimit}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSpecialEmployees(d.employees);
          setSpecialTotal(d.total || 0);
        }
        setSpecialLoading(false);
      })
      .catch(() => setSpecialLoading(false));
  };

  const fetchSpecialGrid = () => {
    setSpecialGridLoading(true);
    fetch(`/api/admin/special-grid`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSpecialGrid(d.data);
        setSpecialGridLoading(false);
      })
      .catch(() => setSpecialGridLoading(false));
  };



  const handleSaveGrid = async () => {
    setIsSavingGrid(true);
    try {
      const res = await fetch('/api/admin/special-grid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid: specialGrid })
      });
      if (res.ok) {
        alert('Grid updated successfully');
        fetchSpecialGrid();
      } else {
        alert('Failed to update grid');
      }
    } catch (e) {
      alert("Error updating grid");
    } finally {
      setIsSavingGrid(false);
    }
  };

  const handleToggleSpecial = async (empId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/special', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empId, is_special: !currentStatus })
      });
      if (res.ok) fetchSpecialEmployees(specialSearch);
    } catch (e) {
      alert("Error updating special status");
    }
  };



  const handleAddUser = async () => {
    if (!newUsername || !newPassword) {
      alert("Please enter username and password");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: newEmployeeId, name: newUsername, username: newUsername, email: newEmail, password: newPassword, role: newRole, location_id: newRole === 'user' ? newLocation : null })
      });
      const data = await res.json();
      if (data.success) {
        alert('User created successfully!');
        setShowAddUserModal(false);
        setNewEmployeeId('');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('user');
        setNewLocation('');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while creating the user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${username}?`)) return;

    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while deleting the user');
    }
  };

  const handleEditPassword = async (userId: number, username: string) => {
    const newPassword = window.prompt(`Enter new password for user ${username}:`);
    if (!newPassword) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        alert('Password updated successfully!');
      } else {
        alert(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while updating the password');
    }
  };

  const handleDeleteExcel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this excel file?')) return;
    try {
      const res = await fetch(`/api/admin/excels?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchExcels();
    } catch (e) {
      alert("Error deleting excel.");
    }
  };

  const handleEditExcel = async (id: string) => {
    if (!confirm('Mark this file as edited by admin?')) return;
    try {
      const res = await fetch('/api/admin/excels/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchExcels();
    } catch (e) { console.error(e); }
  };

  const normalize = (s: string) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  const validateKekaFile = async () => {
    if (!kekaFile) return;
    setIsValidatingKeka(true);
    setKekaMessage("");
    setKekaValidationResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        let bestResult: any = null;
        let maxTotalMatches = -1;

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

          if (!rows || rows.length === 0) continue;

          let currentSheetMaxMatches = 0;
          let currentSheetHeaderIndex = 0;

          for (let i = 0; i < Math.min(50, rows.length); i++) {
            const row = rows[i];
            if (!row || !Array.isArray(row)) continue;

            const normalizedRow = row.map(k => normalize(String(k)));
            let matches = 0;
            kekaColumns.forEach(req => {
              if (req.labels.some((label: string) => normalizedRow.includes(normalize(label)))) {
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

            kekaColumns.forEach(req => {
              if (req.labels.some((label: string) => headerRow.includes(normalize(label)))) found.push(req.display);
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
          setKekaValidationResult({
            isValid: false,
            missingHeaders: kekaColumns.map(r => r.display),
            foundHeaders: [],
            rowCount: 0
          });
          setKekaMessage("Error: No matching headers found in any sheet.");
          setKekaValidatedData(null);
        } else {
          setKekaValidationResult(bestResult);

          if (!bestResult.isValid) {
            setKekaMessage(`Found some headers, but ${bestResult.missingHeaders.length} are missing.`);
            setKekaValidatedData(null);
          } else {
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

              const empCode = get(['Employee_Code', 'Employee Code', 'EmpCode', 'EMP CODE']);

              const errors = [];
              if (!empCode) errors.push("Missing Employee Code");

              if (errors.length > 0) {
                invalidRows.push({ _rowIndex: idx + 2, _errors: errors, ...row });
              } else {
                validRows.push({ _rowIndex: idx + 2, ...row });
              }
            });

            setKekaValidatedData({ valid: validRows, invalid: invalidRows });
            setKekaValidationView('summary');
          }
        }
      } catch (err) {
        setKekaMessage("Error parsing Excel file.");
      }
      setIsValidatingKeka(false);
    };
    reader.onerror = () => {
      setKekaMessage("Error reading file.");
      setIsValidatingKeka(false);
    };
    reader.readAsArrayBuffer(kekaFile);
  };

  const handleKekaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKekaFile(e.target.files[0]);
      setKekaValidationResult(null);
      setKekaValidatedData(null);
      setKekaMessage("");
    }
  };

  const handleKekaUpload = async () => {
    if (!kekaFile || !kekaValidationResult?.isValid) return;
    setUploadingKeka(true);
    try {
      const formData = new FormData();
      formData.append('file', kekaFile);
      if (user?.employee_id) formData.append('employee_id', user.employee_id);
      if (user?.name) formData.append('name', user.name);

      const kekaClientObj = clientOptions.find(c => c.name === kekaClientName && c.product_type === kekaProductType);
      if (kekaLocation) formData.append('location_id', kekaLocation);
      if (kekaClientObj) formData.append('client_id', String(kekaClientObj.id));
      if (kekaProductType) formData.append('product_type', kekaProductType);

      const res = await fetch('/api/admin/employees/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setKekaMessage('Success: Keka data securely uploaded and queued for background processing.');
        setKekaFile(null);
        setKekaValidationResult(null);
        setKekaValidatedData(null);
        setActiveKekaJob({ id: data.jobId, status: 'PENDING', processed_rows: 0, total_rows: 0 });
      } else {
        setKekaMessage('Error: ' + (data.error || 'Upload failed'));
      }
    } catch (e) {
      setKekaMessage('Error: Upload failed');
    } finally {
      setUploadingKeka(false);
    }
  };

  const adminModules = [
    { id: 'tracker', title: 'Daily Tracker', subtitle: 'Date-wise matrix of uploaded files', icon: <Activity size={20} /> },
    { id: 'users', title: 'User Management', subtitle: 'Manage user roles, access, and profiles', icon: <Users size={20} /> },
    { id: 'excels', title: 'Uploaded Excels', subtitle: 'View who uploaded which excel and manage them', icon: <FileSpreadsheet size={20} /> },
    { id: 'keka', title: 'Keka Upload', subtitle: 'Upload and manage Master Employee Data', icon: <Database size={20} /> },
    { id: 'keka-excels', title: 'Keka Excels', subtitle: 'View and manage uploaded Keka files', icon: <FileText size={20} /> },
  ];

  const renderContent = () => {
    switch (activeItem) {

      case 'tracker':
        const daysInMonth = new Date(trackerYear, trackerMonth, 0).getDate();
        const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const today = new Date();
        const isCurrentMonth = today.getMonth() + 1 === trackerMonth && today.getFullYear() === trackerYear;
        const currentDay = today.getDate();

        return (
          <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-y-auto no-scrollbar bg-slate-50/50 relative gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  Daily Upload Tracker
                </h2>
                <p className="text-sm text-slate-500 font-medium ml-13 mt-1">Real-time compliance monitoring matrix</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[160px] truncate"
                  value={filterLocation}
                  onChange={(e) => { setFilterLocation(e.target.value); setFilterClient(''); setFilterProduct(''); }}
                >
                  <option value="">All Locations</option>
                  {locationOptions.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[160px] truncate"
                  value={filterClient}
                  onChange={(e) => { setFilterClient(e.target.value); setFilterProduct(''); }}
                >
                  <option value="">All Processes</option>
                  {Array.from(new Set(clientOptions.filter(c => {
                    if (!filterLocation) return true;
                    const locName = locationOptions.find((l: any) => l.name === filterLocation)?.name;
                    return locName && c.location_names?.includes(locName);
                  }).map(p => p.name))).sort().map((name: any) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[160px] truncate"
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                >
                  <option value="">All Products</option>
                  {Array.from(new Set(clientOptions.filter((c: any) => !filterClient || c.name === filterClient).map((c: any) => c.product_type).filter(Boolean))).sort().map((p: any) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
                  value={trackerMonth}
                  onChange={(e) => setTrackerMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
                  value={trackerYear}
                  onChange={(e) => setTrackerYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {(filterLocation || filterClient || filterProduct || trackerMonth !== (new Date().getMonth() + 1) || trackerYear !== new Date().getFullYear()) && (
                  <button
                    onClick={() => {
                      setFilterLocation('');
                      setFilterClient('');
                      setFilterProduct('');
                      setTrackerMonth(new Date().getMonth() + 1);
                      setTrackerYear(new Date().getFullYear());
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center rounded-xl hover:bg-red-50"
                    title="Clear Filters"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Clean Legend */}
            <div className="flex flex-wrap items-center gap-3 px-2 mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Legend:</span>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> User Upload</div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600"><Shield className="w-3.5 h-3.5" /> Admin Proxy</div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600"><Trash2 className="w-3.5 h-3.5" /> Admin Deleted</div>
              <div className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle className="w-3.5 h-3.5" /> Pending</div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-xs text-center border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100 whitespace-nowrap sticky top-0 z-20">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-r border-slate-100 sticky left-0 z-30 bg-slate-50/50">
                        Agent / User
                      </th>
                      {daysArray.map(day => (
                        <th key={day} className={`px-1.5 py-3 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 min-w-[28px] transition-colors ${isCurrentMonth && day === currentDay ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
                          {day}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-b border-slate-100 sticky right-0 z-30 bg-slate-50/50">
                        Missing
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trackerLoading ? (
                      <tr><td colSpan={daysInMonth + 2} className="px-4 py-12 text-center text-muted-foreground font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" /> Loading matrix...</td></tr>
                    ) : trackerData.length === 0 ? (
                      <tr><td colSpan={daysInMonth + 2} className="px-4 py-12 text-center text-muted-foreground font-medium">No agents found for this period.</td></tr>
                    ) : (
                      trackerData.map((u: any, idx: number) => {
                        let pendingCount = 0;
                        return (
                          <tr key={u.employee_id || u.username} className="group hover:bg-muted/30 transition-colors bg-card">
                            <td className="px-4 py-2 text-left border-r border-border sticky left-0 bg-card group-hover:bg-muted/30 transition-colors z-10 whitespace-nowrap">
                              <p className="font-semibold text-foreground text-xs">{u.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{u.employee_id}</p>
                            </td>
                            {daysArray.map(day => {
                              const dateStr = `${trackerYear}-${String(trackerMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const cellStatus = u.uploads[dateStr];
                              const isUploaded = !!cellStatus;
                              const isFuture = isCurrentMonth && day > currentDay;

                              if (!isUploaded && !isFuture) pendingCount++;

                              return (
                                <td key={day} className={`p-0.5 transition-colors ${isCurrentMonth && day === currentDay ? 'bg-primary/5' : ''}`}>
                                  <div className="flex items-center justify-center w-full h-full min-h-[28px]">
                                    {!isUploaded ? (
                                      isFuture ? <span className="w-1.5 h-1.5 rounded-full bg-border"></span> :
                                        <div title="Pending" className="flex items-center justify-center"><XCircle className="w-3.5 h-3.5 text-destructive/70" /></div>
                                    ) : (
                                      cellStatus === 'DELETED_BY_ADMIN' ? <div title="Uploaded but Deleted by Admin" className="flex items-center justify-center cursor-help hover:scale-110 transition-transform"><Trash2 className="w-3.5 h-3.5 text-orange-500" /></div> :
                                        cellStatus === 'UPLOADED_BY_ADMIN' ? <div title="Proxy Upload by Admin" className="flex items-center justify-center cursor-help hover:scale-110 transition-transform"><Shield className="w-3.5 h-3.5 text-blue-500" /></div> :
                                          cellStatus === 'FAILED' ? <div title="Failed Upload" className="flex items-center justify-center cursor-help hover:scale-110 transition-transform"><AlertCircle className="w-3.5 h-3.5 text-destructive" /></div> :
                                            <div title="Uploaded by User" className="flex items-center justify-center cursor-help hover:scale-110 transition-transform"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-3 py-1.5 border-l border-border sticky right-0 bg-card group-hover:bg-muted/30 transition-colors z-10 text-center">
                              <span className={`font-black text-[11px] ${pendingCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {pendingCount > 0 ? pendingCount : '0'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'excels':
        return (
          <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-y-auto no-scrollbar bg-slate-50/50 relative gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  Uploaded Excels
                </h2>
                <p className="text-sm text-slate-500 font-medium ml-13 mt-1">View who uploaded which excel and manage records.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[120px] truncate"
                  value={filterLocation}
                  onChange={(e) => { setFilterLocation(e.target.value); setFilterClient(''); setFilterProduct(''); }}
                >
                  <option value="">All Locations</option>
                  {locationOptions.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[120px] truncate"
                  value={filterClient}
                  onChange={(e) => { setFilterClient(e.target.value); setFilterProduct(''); }}
                >
                  <option value="">All Processes</option>
                  {Array.from(new Set(clientOptions.filter(c => {
                    if (!filterLocation) return true;
                    const locName = locationOptions.find((l: any) => l.name === filterLocation)?.name;
                    return locName && c.location_names?.includes(locName);
                  }).map(p => p.name))).sort().map((name: any) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[120px] truncate"
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                >
                  <option value="">All Products</option>
                  {Array.from(new Set(clientOptions.filter((c: any) => !filterClient || c.name === filterClient).map((c: any) => c.product_type).filter(Boolean))).sort().map((p: any) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[100px]"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(parseInt(e.target.value))}
                >
                  <option value={0}>All Months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'short' })}</option>
                  ))}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[90px]"
                  value={deleteYear}
                  onChange={(e) => setDeleteYear(parseInt(e.target.value))}
                >
                  <option value={0}>All Years</option>
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {(filterLocation || filterClient || filterProduct || deleteMonth !== 0 || deleteYear !== 0) && (
                  <button
                    onClick={() => {
                      setFilterLocation('');
                      setFilterClient('');
                      setFilterProduct('');
                      setDeleteMonth(0);
                      setDeleteYear(0);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center rounded-lg shadow-sm border border-red-200 hover:border-red-500"
                    title="Clear Filters"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden space-y-4">
              {excelsLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading excels...</div>
              ) : excels.filter((j: any) => j.job_type !== 'KEKA' && j.status !== 'DELETED_BY_ADMIN').length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-xl">No excels found for this month.</div>
              ) : (
                (() => {
                  const groupedExcels = excels.filter((j: any) => j.job_type !== 'KEKA' && j.status !== 'DELETED_BY_ADMIN').reduce((acc: any, job: any) => {
                    const user = job.uploaded_by_name || job.uploaded_by_employee_id || 'Unknown User';
                    if (!acc[user]) acc[user] = [];
                    acc[user].push(job);
                    return acc;
                  }, {});

                  return Object.keys(groupedExcels).map(user => (
                    <div key={user} className="border rounded-xl overflow-hidden shadow-sm">
                      <div
                        className="px-4 py-3 bg-slate-50/80 cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors"
                        onClick={() => setExpandedUser(expandedUser === user ? null : user)}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-[15px]">{user}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-xs font-medium bg-white px-2.5 py-1 rounded-full border">{groupedExcels[user].length} Files Uploaded</span>
                          <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedUser === user ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>

                      {expandedUser === user && (
                        <div className="border-t">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                              <tr>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uploaded Date</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Process</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Type</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bucket</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">File Name</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rows (Processed / Total)</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                              {groupedExcels[user].map((job: any) => {
                                const fileName = job.file_path ? job.file_path.split(/[\/\\]/).pop().split('_').slice(1).join('_') || job.file_path : 'Unknown';
                                return (
                                  <tr key={job.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-2.5 text-[11px] font-medium text-slate-700">
                                      {job.upload_at ? new Date(job.upload_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      <span className="block text-[9px] text-muted-foreground mt-0.5">Sys: {new Date(job.created_at).toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-[11px] text-slate-700 font-medium whitespace-nowrap">{job.location_name || '-'}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-slate-700 font-medium whitespace-nowrap">{job.client_name || '-'}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-slate-700 font-medium whitespace-nowrap">{job.product_type || '-'}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-slate-700 font-medium whitespace-nowrap">{job.buckets || '-'}</td>
                                    <td className="px-4 py-2.5 text-[11px] text-slate-600 font-medium max-w-[180px] truncate" title={fileName}>{fileName}</td>
                                    <td className="px-4 py-2.5 text-muted-foreground">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : job.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {job.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-[11px] text-muted-foreground font-medium">{job.processed_rows} / {job.total_rows}</td>
                                    <td className="px-4 py-2.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">

                                        {job.status !== 'DELETED_BY_ADMIN' ? (
                                          <>
                                            {job.file_path && (
                                              <a
                                                href={`/${job.file_path.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[10px] bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 font-bold px-2 py-1 rounded border border-blue-200 hover:border-blue-500 transition-all shadow-sm flex items-center justify-center gap-1"
                                                download
                                              >
                                                Download
                                              </a>
                                            )}
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleDeleteExcel(job.id); }}
                                              className="text-[10px] bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold px-2 py-1 rounded border border-red-200 hover:border-red-500 transition-all shadow-sm"
                                            >
                                              Delete File
                                            </button>
                                          </>
                                        ) : (
                                          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Deleted</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-y-auto no-scrollbar bg-slate-50/50 relative gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  User Management
                </h2>
                <p className="text-sm text-slate-500 font-medium ml-13 mt-1">Manage system access and roles.</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserPlus size={14} />
                Add User
              </button>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emp ID</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">Loading users...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">No users found.</td></tr>
                    ) : (
                      users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-4 py-2.5 text-[11px] text-slate-500 font-medium">{u.employee_id || '-'}</td>
                          <td className="px-4 py-2.5 text-xs font-semibold text-slate-800">{u.name || '-'}</td>
                          <td className="px-4 py-2.5 text-xs font-medium text-slate-700">{u.username}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{u.email || '-'}</td>
                          <td className="px-4 py-2.5 capitalize">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-xs font-medium text-slate-600">{u.location || '-'}</td>
                          <td className="px-4 py-2.5"><span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded">Active</span></td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditPassword(u.id, u.username)}
                                className="text-[10px] bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded border border-slate-200 transition-colors shadow-sm"
                              >
                                Edit Pass
                              </button>
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="text-[10px] bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold px-2 py-1 rounded border border-red-200 transition-colors shadow-sm"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD USER MODAL */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-full overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Add New User</h3>
                    <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Employee ID</label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        value={newEmployeeId}
                        onChange={e => setNewEmployeeId(e.target.value)}
                        placeholder="Enter Employee ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Username / Name</label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Role</label>
                      <select
                        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white"
                        value={newRole}
                        onChange={e => setNewRole(e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    {newRole === 'user' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <select
                          className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white"
                          value={newLocation}
                          onChange={e => setNewLocation(e.target.value)}
                        >
                          <option value="">Select Location</option>
                          {locationOptions.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 border rounded-md hover:bg-slate-100 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddUser}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      {isSubmitting ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'keka':
        return (
          <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-y-auto no-scrollbar bg-slate-50/50 relative gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  Keka Upload
                </h2>
                <p className="text-sm text-slate-500 font-medium ml-13 mt-1">Upload and manage Master Employee Data.</p>
              </div>

              {/* Keka Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[140px] truncate"
                  value={kekaLocation}
                  onChange={e => {
                    setKekaLocation(e.target.value);
                    setKekaClientName('');
                    setKekaProductType('');
                  }}
                >
                  <option value="">-- Select Location --</option>
                  {locationOptions.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>

                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[140px] truncate"
                  value={kekaClientName}
                  onChange={e => {
                    const val = e.target.value;
                    setKekaClientName(val);
                    const locName = kekaLocation ? locationOptions.find(l => String(l.id) === String(kekaLocation))?.name : undefined;
                    const matchingClients = clientOptions.filter(c => c.name === val && (locName ? c.location_names?.includes(locName) : true));
                    if (matchingClients.length === 1 && matchingClients[0].product_type) {
                      setKekaProductType(matchingClients[0].product_type);
                    } else {
                      setKekaProductType('');
                    }
                  }}
                >
                  <option value="">-- Select Client --</option>
                  {Array.from(new Set(clientOptions.filter(c => {
                    const locName = kekaLocation ? locationOptions.find(l => String(l.id) === String(kekaLocation))?.name : undefined;
                    return locName ? c.location_names?.includes(locName) : true;
                  }).map(p => p.name))).sort().map(name => (
                    <option key={name as string} value={name as string}>{name as string}</option>
                  ))}
                </select>

                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[140px] truncate"
                  value={kekaProductType}
                  onChange={e => setKekaProductType(e.target.value)}
                  disabled={!kekaClientName}
                >
                  <option value="">-- Select Product --</option>
                  {clientOptions.filter(c => {
                    if (c.name !== kekaClientName) return false;
                    const locName = kekaLocation ? locationOptions.find(l => String(l.id) === String(kekaLocation))?.name : undefined;
                    return locName ? c.location_names?.includes(locName) : true;
                  }).map(p => (
                    <option key={p.id} value={p.product_type}>{p.product_type}</option>
                  ))}
                </select>

                {(kekaLocation || kekaClientName || kekaProductType) && (
                  <button
                    onClick={() => {
                      setKekaLocation('');
                      setKekaClientName('');
                      setKekaProductType('');
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center rounded-lg shadow-sm border border-red-200 hover:border-red-500"
                    title="Clear Filters"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5">
              {/* Left Side: Validation Status */}
              <div className="w-full lg:w-[260px] flex-shrink-0">
                <Card className="h-full border-slate-200/80 shadow-sm rounded-xl">
                  <CardHeader className="border-b py-2 px-4 bg-slate-50/50">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold">Column Validation</span>
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-0.5 font-medium">
                      {(kekaLocation && kekaClientName && kekaProductType)
                        ? `${kekaColumns.length} required headers checked.`
                        : 'Select a client to view required columns.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    {isValidatingKeka ? (
                      <div className="flex flex-col items-center py-12 text-slate-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                        <p className="text-xs font-medium">Analyzing...</p>
                      </div>
                    ) : !kekaValidationResult ? (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-lg border flex items-center gap-2.5 bg-slate-50 border-slate-100 shadow-sm">
                          <div className="w-7 h-7 rounded flex items-center justify-center bg-slate-200 text-slate-500">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 leading-tight">Required Columns</p>
                            <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                              {(kekaLocation && kekaClientName && kekaProductType) ? 'Must match exactly' : 'Select a client first'}
                            </p>
                          </div>
                        </div>
                        {(kekaLocation && kekaClientName && kekaProductType) && (
                          <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                            {kekaColumns.map(req => (
                              <div key={req.key} className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-slate-50/50 border border-slate-100/60">
                                <span className="text-[10px] font-semibold text-slate-700">{req.display}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Required</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 shadow-sm ${kekaValidationResult.isValid ? 'bg-emerald-50 border-emerald-100' : 'bg-destructive/5 border-destructive/10'}`}>
                          <div className={`w-7 h-7 rounded flex items-center justify-center ${kekaValidationResult.isValid ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'}`}>
                            {kekaValidationResult.isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className={`text-xs font-bold leading-tight ${kekaValidationResult.isValid ? 'text-emerald-700' : 'text-destructive'}`}>
                              {kekaValidationResult.isValid ? 'Ready' : 'Errors Found'}
                            </p>
                            <p className="text-[9px] text-slate-500 font-bold mt-0.5">{kekaValidationResult.foundHeaders.length}/{kekaColumns.length} matched</p>
                          </div>
                        </div>

                        <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                          {kekaColumns.map(req => {
                            const found = kekaValidationResult.foundHeaders.includes(req.display);
                            return (
                              <div key={req.key} className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-slate-50/50 border border-slate-100/60">
                                <span className={`text-[10px] font-semibold ${found ? 'text-slate-700' : 'text-slate-400'}`}>{req.display}</span>
                                {found ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Badge variant="destructive" className="text-[7px] uppercase tracking-tighter px-1 py-0">Missing</Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Side: Upload Area */}
              <div className="flex-1">
                <Card className="border border-slate-200/80 shadow-sm rounded-xl overflow-hidden h-full">
                  <CardContent className="p-4 flex flex-col h-full gap-3">
                    <label className={`group relative flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 min-h-[140px] ${kekaFile ? 'border-primary/50 bg-gradient-to-b from-primary/5 to-transparent' : 'border-slate-300 bg-slate-50/50 hover:border-primary/60 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(79,125,255,0.08)]'}`}>
                      <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={handleKekaFileChange} />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${kekaFile ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl shadow-primary/30 scale-105' : 'bg-primary/10 text-primary shadow-sm group-hover:scale-105 group-hover:bg-primary/20'}`}>
                        {kekaFile ? <FileSpreadsheet className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                      </div>
                      {kekaFile ? (
                        <div className="text-center px-4">
                          <p className="text-sm font-bold text-slate-900 leading-tight">{kekaFile.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{(kekaFile.size / 1024 / 1024).toFixed(2)} MB — {kekaValidationResult?.rowCount || 0} rows found</p>
                          <button onClick={(e) => { e.preventDefault(); setKekaFile(null); setKekaValidationResult(null); setKekaValidatedData(null); setKekaMessage(""); }} className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-[10px] flex items-center justify-center gap-1 mx-auto py-1 px-2 rounded-md transition-colors">
                            <Trash2 className="w-3 h-3" /> Clear File
                          </button>
                        </div>
                      ) : (
                        <div className="text-center px-4">
                          <p className="text-xs font-bold text-slate-700">Click to browse or drag & drop</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">XLSX, XLS, or CSV supported</p>
                        </div>
                      )}
                    </label>

                    {kekaValidatedData && (
                      <div className="animate-in slide-in-from-bottom-2">
                        {kekaValidationView === 'summary' && (
                          <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setKekaValidationView('valid')} className="flex flex-col items-center justify-center p-6 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all shadow-sm group">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                              <span className="text-3xl font-black text-emerald-700">{kekaValidatedData.valid.length}</span>
                              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Valid Rows</span>
                            </button>
                            <button onClick={() => setKekaValidationView('invalid')} className="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition-all shadow-sm group">
                              <AlertCircle className="w-8 h-8 text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                              <span className="text-3xl font-black text-red-700">{kekaValidatedData.invalid.length}</span>
                              <span className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1">Error Rows</span>
                            </button>
                          </div>
                        )}
                        {kekaValidationView === 'valid' && <ValidationTable data={kekaValidatedData.valid} type="valid" onClose={() => setKekaValidationView('summary')} />}
                        {kekaValidationView === 'invalid' && <ValidationTable data={kekaValidatedData.invalid} type="invalid" onClose={() => setKekaValidationView('summary')} />}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={validateKekaFile} disabled={!kekaFile || isValidatingKeka || uploadingKeka} className="flex-1 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 disabled:opacity-50">
                        {isValidatingKeka ? 'Checking...' : 'Validate Data'}
                      </button>
                      <button onClick={handleKekaUpload} disabled={!kekaFile || uploadingKeka || !kekaValidationResult?.isValid || !kekaLocation || !kekaClientName || !kekaProductType} className={`flex-[2] py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all ${(kekaValidationResult?.isValid && kekaLocation && kekaClientName && kekaProductType) ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-slate-100 text-slate-500 disabled:opacity-50'}`}>
                        {uploadingKeka ? 'Processing...' : 'Upload & Process'}
                      </button>
                    </div>

                    {kekaMessage && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold border ${kekaMessage.includes('Error') ? 'bg-destructive/5 text-destructive border-destructive/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {kekaMessage.includes('Error') ? <XCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        {kekaMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Live Progress Card */}
                {activeKekaJob && (
                  <Card className={`shadow-sm overflow-hidden animate-in zoom-in-95 duration-300 mt-3 border rounded-xl ${activeKekaJob.status === 'COMPLETED' ? 'border-emerald-200/60 bg-emerald-50/30' : activeKekaJob.status === 'FAILED' ? 'border-destructive/20 bg-destructive/5' : 'border-blue-200/60 bg-blue-50/30'}`}>
                    <CardContent className="p-4 space-y-3 relative overflow-hidden">
                      {/* Optional subtle background glow during processing */}
                      {activeKekaJob.status === 'PROCESSING' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-[length:200%_100%] animate-pulse" />
                      )}

                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {activeKekaJob.status === 'PROCESSING' ? (
                              <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            ) : activeKekaJob.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-destructive" />
                            )}
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              {activeKekaJob.status === 'COMPLETED' ? 'Upload Complete' : activeKekaJob.status === 'FAILED' ? 'Upload Failed' : 'Live Syncing...'}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                            Job ID: <span className="font-mono bg-white/60 px-1 py-0.5 rounded border border-slate-200/50">{activeKekaJob.id.slice(0, 8)}</span>
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className={`text-2xl font-black leading-none tracking-tight ${activeKekaJob.status === 'COMPLETED' ? 'text-emerald-600' : activeKekaJob.status === 'FAILED' ? 'text-destructive' : 'text-blue-600'}`}>
                            {kekaProgressPercent}%
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Progress
                          </p>
                        </div>
                      </div>

                      {/* Progress Details */}
                      <div className="flex items-end justify-between mt-2 mb-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-800">{activeKekaJob.processed_rows.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-slate-400">/ {activeKekaJob.total_rows.toLocaleString()} rows</span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${activeKekaJob.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : activeKekaJob.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {activeKekaJob.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out relative ${activeKekaJob.status === 'FAILED' ? 'bg-destructive' : activeKekaJob.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                          style={{ width: `${kekaProgressPercent}%` }}
                        >
                          {activeKekaJob.status === 'PROCESSING' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                          )}
                        </div>
                      </div>

                      {/* Show Error / Warning Details */}
                      {activeKekaJob.error_log && (
                        <div className="mt-3 bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-slate-50 border-b border-slate-100 px-3 py-1.5 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Execution Log</span>
                          </div>
                          <div className="p-3 text-[11px] font-medium font-mono text-slate-700 leading-relaxed max-h-[160px] overflow-y-auto no-scrollbar">
                            {(() => {
                              let parsed: any = activeKekaJob.error_log;
                              if (typeof parsed === 'string') {
                                try { parsed = JSON.parse(parsed); } catch { }
                              }

                              if (typeof parsed === 'string') {
                                return <div className="text-destructive flex items-start gap-2"><XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{parsed}</span></div>;
                              } else if (parsed && typeof parsed === 'object') {
                                return (
                                  <div className="flex flex-col gap-2">
                                    {parsed.failed_count > 0 && (
                                      <div className="text-destructive flex items-start gap-2 bg-red-50/50 p-1.5 rounded">
                                        <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>Failed to insert <strong>{parsed.failed_count}</strong> records.</span>
                                      </div>
                                    )}
                                    {parsed.duplicate_count > 0 && (
                                      <div className="text-orange-600 flex items-start gap-2 bg-orange-50/50 p-1.5 rounded">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                        <span>Ignored <strong>{parsed.duplicate_count}</strong> duplicate records (already exist).</span>
                                      </div>
                                    )}
                                    {parsed.last_error && <div className="text-destructive mt-1 flex items-start gap-2"><XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>Error: {parsed.last_error}</span></div>}
                                    {parsed.details && Array.isArray(parsed.details) && parsed.details.length > 0 && (
                                      <div className="mt-1 bg-red-50 p-2 rounded-lg border border-red-100">
                                        <p className="text-[9px] font-bold text-red-800 mb-1.5 uppercase tracking-widest">Error Trace:</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                          {parsed.details.map((err: string, i: number) => (
                                            <li key={i} className="text-[10px] font-medium text-red-700">{err}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {(!parsed.failed_count && !parsed.last_error && !parsed.details) && (
                                      <div className="text-emerald-600 flex items-start gap-2 bg-emerald-50/50 p-1.5 rounded"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{parsed.status || 'Successfully processed records.'}</span></div>
                                    )}
                                  </div>
                                );
                              } else {
                                return <div className="text-destructive flex items-start gap-2"><XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{String(parsed)}</span></div>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        );
      case 'keka-excels':
        return (
          <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-y-auto no-scrollbar bg-slate-50/50 relative gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  Keka Excels
                </h2>
                <p className="text-sm text-slate-500 font-medium ml-13 mt-1">View who uploaded which Keka Master data and manage records.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[120px]"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(parseInt(e.target.value))}
                >
                  <option value={0}>All Months</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthName = new Date(2000, i).toLocaleString('default', { month: 'short' });
                    return <option key={i + 1} value={i + 1}>{monthName}</option>;
                  })}
                </select>
                <select
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer w-[90px]"
                  value={deleteYear}
                  onChange={(e) => setDeleteYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {(deleteMonth !== 0 || deleteYear !== 0) && (
                  <button
                    onClick={() => {
                      setDeleteMonth(0);
                      setDeleteYear(0);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center rounded-lg shadow-sm border border-red-200 hover:border-red-500"
                    title="Clear Filters"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden space-y-4">
              {excelsLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading keka excels...</div>
              ) : excels.filter((j: any) => j.job_type === 'KEKA' && j.status !== 'DELETED_BY_ADMIN').length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-xl">No Keka excels found for this month.</div>
              ) : (
                (() => {
                  const groupedExcels = excels.filter((j: any) => j.job_type === 'KEKA' && j.status !== 'DELETED_BY_ADMIN').reduce((acc: any, job: any) => {
                    const user = job.uploaded_by_name || job.uploaded_by_employee_id || 'Unknown User';
                    if (!acc[user]) acc[user] = [];
                    acc[user].push(job);
                    return acc;
                  }, {});

                  return Object.keys(groupedExcels).map(user => (
                    <div key={user} className="border rounded-xl overflow-hidden shadow-sm">
                      <div
                        className="px-4 py-3 bg-card cursor-pointer flex justify-between items-center hover:bg-muted/50 transition-colors"
                        onClick={() => setExpandedUser(expandedUser === user ? null : user)}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="font-bold text-[15px] text-foreground">{user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary text-[11px] font-bold bg-background px-2.5 py-0.5 rounded-md border border-border shadow-sm">{groupedExcels[user].length} Files Uploaded</span>
                          <svg className={`w-4 h-4 text-muted-foreground transition-transform ${expandedUser === user ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>

                      {expandedUser === user && (
                        <div className="border-t border-border">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b">
                              <tr>
                                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Uploaded Date</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">File Name</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Rows (Processed/Total)</th>
                                <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                              {groupedExcels[user].map((job: any) => {
                                const fileName = job.file_path ? job.file_path.split(/[\/\\]/).pop().split('_').slice(1).join('_') || job.file_path : 'Unknown';
                                return (
                                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-2 text-[11px] font-semibold text-slate-700">
                                      {job.upload_at ? new Date(job.upload_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      <span className="block text-[9px] text-slate-400 font-medium">Sys: {new Date(job.created_at).toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-2 text-[11px] text-slate-600 font-semibold max-w-[180px] truncate" title={fileName}>{fileName}</td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm ${job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : job.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {job.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-[11px] text-slate-600 font-semibold">{job.processed_rows} / {job.total_rows}</td>
                                    <td className="px-4 py-2 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {job.status !== 'DELETED_BY_ADMIN' ? (
                                          <>
                                            {job.file_path && (
                                              <a
                                                href={`/${job.file_path.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[10px] bg-blue-50 hover:bg-blue-500 hover:text-white text-blue-600 font-bold px-2.5 py-1.5 rounded-md border border-blue-200 hover:border-blue-500 transition-all shadow-sm flex items-center justify-center gap-1"
                                                download
                                              >
                                                Download
                                              </a>
                                            )}
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleDeleteExcel(job.id); }}
                                              className="text-[10px] bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold px-2.5 py-1.5 rounded-md border border-red-200 hover:border-red-500 transition-all shadow-sm"
                                            >
                                              Delete File
                                            </button>
                                          </>
                                        ) : (
                                          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded shadow-sm border border-orange-100">Deleted</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 text-slate-400">
            <Settings size={48} className="opacity-20 mb-4 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-600">{adminModules.find(m => m.id === activeItem)?.title}</h2>
            <p className="text-sm font-medium mt-2">Configuration section under development.</p>
          </div>
        );

      case 'special':
        return (
          <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-y-auto no-scrollbar bg-slate-50/50 relative gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  Special Exceptions
                </h2>
                <p className="text-sm text-slate-500 font-medium ml-13 mt-1">Force employees into the Special Exceptions bucket (flat percentage logic) regardless of vintage/salary.</p>
              </div>
              <div className="flex gap-2 relative w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search Employee ID or Name"
                  className="pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors w-full md:w-[300px]"
                  value={specialSearch}
                  onChange={(e) => {
                    setSpecialSearch(e.target.value);
                    if (e.target.value.length >= 3 || e.target.value.length === 0) {
                      fetchSpecialEmployees(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSpecialEmployees(specialSearch)}
                />
                <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <button
                  onClick={() => fetchSpecialEmployees(specialSearch)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 w-full lg:max-w-md">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Dynamic Grid Rules</h3>
                  <button
                    disabled={isSavingGrid}
                    onClick={handleSaveGrid}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isSavingGrid ? 'Saving...' : 'Save Grid'}
                  </button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Target Collection (₹)</th>
                      <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Incentive (%)</th>
                      <th className="px-5 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {specialGridLoading ? (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">Loading Grid...</td></tr>
                    ) : (
                      specialGrid.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3">
                            <input
                              type="number"
                              value={row.target_collection}
                              onChange={(e) => {
                                const newGrid = [...specialGrid];
                                newGrid[idx].target_collection = e.target.value;
                                setSpecialGrid(newGrid);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 w-full text-sm font-bold text-slate-700"
                            />
                          </td>
                          <td className="px-5 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={row.incentive_percentage}
                              onChange={(e) => {
                                const newGrid = [...specialGrid];
                                newGrid[idx].incentive_percentage = e.target.value;
                                setSpecialGrid(newGrid);
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 w-full text-sm font-bold text-slate-700"
                            />
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => {
                                const newGrid = specialGrid.filter((_, i) => i !== idx);
                                setSpecialGrid(newGrid);
                              }}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    <tr>
                      <td colSpan={3} className="px-5 py-4 bg-slate-50/30">
                        <button
                          onClick={() => setSpecialGrid([...specialGrid, { target_collection: '', incentive_percentage: '' }])}
                          className="text-blue-600 hover:text-blue-800 text-sm font-black w-full text-left uppercase tracking-widest flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">+</span> Add New Rule
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Emp ID</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Designation</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Toggle Exception</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {specialLoading ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading...</td></tr>
                  ) : specialEmployees.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">{specialSearch ? "No results found." : "No special exceptions found. Use search to add one."}</td></tr>
                  ) : (
                    specialEmployees.map((emp: any) => (
                      <tr key={emp.employee_id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium">{emp.employee_id}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{emp.name}</td>
                        <td className="px-4 py-3 text-slate-500">{emp.designation || 'N/A'}</td>
                        <td className="px-4 py-3">
                          {emp.is_special ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-200">SPECIAL APPLIED</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-medium border">Normal Logic</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleSpecial(emp.employee_id, emp.is_special)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${emp.is_special
                                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                              }`}
                          >
                            {emp.is_special ? 'Remove Exception' : 'Mark as Special'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!specialLoading && specialTotal > specialLimit && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                  <span className="text-sm text-muted-foreground">
                    Showing {(specialPage - 1) * specialLimit + 1} to {Math.min(specialPage * specialLimit, specialTotal)} of {specialTotal} employees
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={specialPage === 1}
                      onClick={() => {
                        const newPage = specialPage - 1;
                        setSpecialPage(newPage);
                        fetchSpecialEmployees(specialSearch, newPage);
                      }}
                      className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      disabled={specialPage * specialLimit >= specialTotal}
                      onClick={() => {
                        const newPage = specialPage + 1;
                        setSpecialPage(newPage);
                        fetchSpecialEmployees(specialSearch, newPage);
                      }}
                      className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)] w-full bg-background overflow-hidden">

      {/* Left List Pane (Constraint Space) */}
      <div className={`${isSidebarOpen ? 'w-44' : 'w-[72px]'} flex-shrink-0 flex flex-col border-r border-border bg-background transition-all duration-300`}>

        <div className={`px-4 py-4 border-b border-border mb-3 flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && <h1 className="text-lg font-bold tracking-tight text-foreground">Admin</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>

        {/* Modules List - Polaris Vertical Buttons */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 px-2">
          <div className="flex flex-col gap-2 w-full mt-1">
            {adminModules.map((mod, index) => (
              <Button
                key={mod.id}
                pressed={activeItem === mod.id}
                onClick={() => {
                  if ((mod as any).link) window.location.href = (mod as any).link;
                  else setActiveItem(mod.id);
                }}
                fullWidth
                textAlign={isSidebarOpen ? "left" : "center"}
                size="large"
              >
                <div className={`flex items-center gap-3 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
                  <div className="flex-shrink-0 [&_svg]:!fill-transparent">
                    {React.cloneElement(mod.icon as React.ReactElement, {
                      color: '#2563eb', // All icons blue
                      size: 18,
                      style: { fill: 'none' } // Force fill to none to combat Polaris CSS
                    })}
                  </div>
                  {isSidebarOpen && (
                    <span className={`text-[13px] tracking-tight ${activeItem === mod.id ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {mod.title}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto bg-muted/10">
        {renderContent()}
      </div>

    </div>
  );
}
