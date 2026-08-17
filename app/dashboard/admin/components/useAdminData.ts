"use client";
import { useState, useEffect } from 'react';
import { parseAndValidateKekaWorkbook } from './kekaWorkbookValidator';

export function useAdminData() {
  const [activeItem, setActiveItem] = useState('tracker');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const [deleteMonth, setDeleteMonth] = useState(new Date().getMonth() + 1);
  const [deleteYear, setDeleteYear] = useState(new Date().getFullYear());
  const [kekaExcelMonth, setKekaExcelMonth] = useState(new Date().getMonth() + 1);
  const [kekaExcelYear, setKekaExcelYear] = useState(new Date().getFullYear());
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [kekaFile, setKekaFile] = useState<File | null>(null);
  const [uploadingKeka, setUploadingKeka] = useState(false);
  const [isValidatingKeka, setIsValidatingKeka] = useState(false);
  const [kekaValidationResult, setKekaValidationResult] = useState<any>(null);
  const [kekaMessage, setKekaMessage] = useState("");
  const [activeKekaJob, setActiveKekaJob] = useState<any | null>(null);
  const [kekaMonth, setKekaMonth] = useState((new Date().getMonth() + 1).toString());
  const [kekaYear, setKekaYear] = useState(new Date().getFullYear().toString());
  const [kekaColumns, setKekaColumns] = useState<any[]>([]);

  const fetchKekaColumns = async () => {
    try {
      const res = await fetch('/api/admin/keka-columns');
      const data = await res.json();
      if (data.success) setKekaColumns(data.data);
    } catch (err) {
      console.error("Failed to fetch keka columns", err);
    }
  };

  useEffect(() => {
    fetch('/api/public/locations').then(r => r.json()).then(d => { if (d.success) setLocationOptions(d.data); });
    fetchKekaColumns();
  }, []);

  useEffect(() => {
    let url = '/api/universal/clients';
    if (filterLocation && locationOptions.length > 0) {
      const loc = locationOptions.find(l => l.name === filterLocation);
      if (loc) url += `?location_id=${loc.id}`;
    }
    fetch(url).then(r => r.json()).then(d => {
      if (d.success) {
        setClientOptions(d.data);
        if (filterClient && !d.data.find((p: any) => p.name === filterClient)) setFilterClient('');
      }
    });
  }, [filterLocation, locationOptions]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } finally { setLoading(false); }
  };

  const fetchExcels = async () => {
    setExcelsLoading(true);
    const isKeka = activeItem === 'keka-excels';
    const m = isKeka ? kekaExcelMonth : deleteMonth;
    const y = isKeka ? kekaExcelYear : deleteYear;
    let url = `/api/admin/excels?month=${m}&year=${y}`;
    if (isKeka) {
      url += `&job_type=KEKA`;
    } else {
      url += `&job_type=DPF`;
    }
    if (filterLocation) url += `&location=${encodeURIComponent(filterLocation)}`;
    if (filterClient) url += `&client_name=${encodeURIComponent(filterClient)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setExcels(data.success ? (data.jobs || data.data || []) : []);
    } catch { setExcels([]); } finally { setExcelsLoading(false); }
  };

  const fetchTrackerData = async () => {
    setTrackerLoading(true);
    let url = `/api/admin/tracker?month=${trackerMonth}&year=${trackerYear}`;
    if (filterLocation) url += `&location=${encodeURIComponent(filterLocation)}`;
    if (filterClient) url += `&client_name=${encodeURIComponent(filterClient)}`;
    if (filterProduct) url += `&product_type=${encodeURIComponent(filterProduct)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setTrackerData(data.data);
    } finally { setTrackerLoading(false); }
  };

  useEffect(() => {
    if (activeItem === 'users') fetchUsers();
    if (activeItem === 'excels' || activeItem === 'keka-excels') fetchExcels();
    if (activeItem === 'tracker') fetchTrackerData();
    if (activeItem === 'keka' || activeItem === 'keka-columns') fetchKekaColumns();
  }, [activeItem, filterLocation, filterClient, filterProduct, trackerMonth, trackerYear, deleteMonth, deleteYear, kekaExcelMonth, kekaExcelYear]);

  useEffect(() => {
    if (!activeKekaJob?.id || activeKekaJob.status === 'COMPLETED' || activeKekaJob.status === 'FAILED') return;
    const es = new EventSource(`/api/jobs/stream?jobId=${activeKekaJob.id}`);
    es.onmessage = (e) => {
      const u = JSON.parse(e.data);
      setActiveKekaJob(u);
      if (u.status === 'COMPLETED' || u.status === 'FAILED') {
        es.close();
        fetchExcels();
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [activeKekaJob?.id]);

  const validateKekaFile = () => {
    if (!kekaFile) return;
    setIsValidatingKeka(true); setKekaMessage(""); setKekaValidationResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        setKekaValidationResult(parseAndValidateKekaWorkbook(data, kekaColumns));
      } finally { setIsValidatingKeka(false); }
    };
    reader.readAsArrayBuffer(kekaFile);
  };

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: newEmployeeId, username: newUsername, email: newEmail, password: newPassword, role: newRole, location: newLocation })
      });
      if (res.ok) {
        setShowAddUserModal(false); setNewEmployeeId(''); setNewUsername(''); setNewEmail(''); setNewPassword('');
        fetchUsers();
      }
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteUser = async (id: number, uname: string) => {
    if (!confirm(`Delete user ${uname}?`)) return;
    await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleEditPassword = async (id: number, uname: string) => {
    const p = prompt(`New password for ${uname}:`);
    if (p) await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id, newPassword: p }) });
  };

  const handleDeleteExcel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this upload record and its database entries?')) return;
    await fetch(`/api/admin/excels?id=${id}`, { method: 'DELETE' });
    fetchExcels();
  };

  const handleKekaUpload = async () => {
    if (!kekaFile) return;
    setUploadingKeka(true);
    try {
      const formData = new FormData();
      formData.append('file', kekaFile);
      formData.append('month', kekaMonth);
      formData.append('year', kekaYear);
      const res = await fetch('/api/admin/employees/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setKekaMessage('Success: Company-wide Keka Master batch queued for processing.');
        setKekaFile(null); setKekaValidationResult(null);
        setActiveKekaJob({ id: data.jobId, status: 'PENDING', processed_rows: 0, total_rows: 0 });
      } else { setKekaMessage('Error: ' + data.error); }
    } finally { setUploadingKeka(false); }
  };

  const kekaProgressPercent = activeKekaJob?.total_rows > 0 ? Math.round((activeKekaJob.processed_rows / activeKekaJob.total_rows) * 100) : 0;

  return {
    activeItem, setActiveItem, isSidebarOpen, setIsSidebarOpen, users, loading, showAddUserModal, setShowAddUserModal,
    newEmployeeId, setNewEmployeeId, newUsername, setNewUsername, newEmail, setNewEmail, newPassword, setNewPassword,
    newRole, setNewRole, newLocation, setNewLocation, isSubmitting, excels, excelsLoading, filterLocation, setFilterLocation,
    filterClient, setFilterClient, filterProduct, setFilterProduct, locationOptions, clientOptions, trackerMonth, setTrackerMonth,
    trackerYear, setTrackerYear, trackerData, trackerLoading, deleteMonth, setDeleteMonth, deleteYear, setDeleteYear,
    kekaExcelMonth, setKekaExcelMonth, kekaExcelYear, setKekaExcelYear,
    expandedUser, setExpandedUser, kekaFile, setKekaFile, uploadingKeka, isValidatingKeka, kekaValidationResult,
    kekaMessage, activeKekaJob, kekaMonth, setKekaMonth, kekaYear, setKekaYear, kekaColumns, kekaProgressPercent,
    validateKekaFile, handleAddUser, handleDeleteUser, handleEditPassword, handleDeleteExcel, handleKekaUpload, fetchKekaColumns
  };
}
