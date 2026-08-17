"use client";
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export function useAuditData() {
  const date = new Date();
  const [month, setMonth] = useState((date.getMonth() + 1).toString());
  const [year, setYear] = useState(date.getFullYear().toString());
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeDetailLog, setActiveDetailLog] = useState<any | null>(null);

  const [kpi, setKpi] = useState({
    totalEvents: 0,
    uploadEvents: 0,
    deleteEvents: 0,
    securityEvents: 0,
    kekaEvents: 0
  });

  const { user } = useApp();
  const router = useRouter();

  const months = [
    { v: '0', l: 'All Months' },
    { v: '1', l: 'January' }, { v: '2', l: 'February' }, { v: '3', l: 'March' }, { v: '4', l: 'April' },
    { v: '5', l: 'May' }, { v: '6', l: 'June' }, { v: '7', l: 'July' }, { v: '8', l: 'August' },
    { v: '9', l: 'September' }, { v: '10', l: 'October' }, { v: '11', l: 'November' }, { v: '12', l: 'December' }
  ];
  const years = ['2024', '2025', '2026', '2027'];

  useEffect(() => {
    if (user && user.role !== 'admin') router.push('/dashboard');
  }, [user, router]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    let url = `/api/audit?month=${month}&year=${year}&page=${page}&limit=50`;
    if (actionFilter !== 'ALL') url += `&action=${encodeURIComponent(actionFilter)}`;
    if (entityFilter !== 'ALL') url += `&entity_type=${encodeURIComponent(entityFilter)}`;
    if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;

    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setLogs(d.logs || []);
          setTotalPages(d.totalPages || 1);
          setTotalRecords(d.total || 0);
          if (d.kpi) setKpi(d.kpi);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [month, year, actionFilter, entityFilter, debouncedSearch, page]);

  useEffect(() => {
    if (user && user.role === 'admin') fetchLogs();
  }, [user, fetchLogs]);

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [month, year, actionFilter, entityFilter, debouncedSearch]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map(l => l.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSingle = async (id: number) => {
    try {
      const res = await fetch(`/api/audit?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(prev => prev.filter(i => i !== id));
        fetchLogs();
      } else {
        alert(data.error || 'Failed to delete log');
      }
    } catch {
      alert('Error occurred while deleting audit record.');
    }
  };

  const handleDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} selected audit records?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/audit?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]);
        fetchLogs();
      } else {
        alert(data.error || 'Failed to delete selected logs');
      }
    } catch {
      alert('Error occurred while deleting logs');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMonth = async () => {
    const periodLabel = month === '0' ? `all of year ${year}` : `${months.find(m => m.v === month)?.l} ${year}`;
    if (!confirm(`CAUTION: Permanently PURGE all audit records for ${periodLabel}? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/audit?month=${month}&year=${year}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]);
        fetchLogs();
      } else {
        alert(data.error || 'Failed to purge audit records');
      }
    } catch {
      alert('Error occurred during purge operation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadExcel = () => {
    if (logs.length === 0) {
      alert('No audit logs available to export for this view.');
      return;
    }
    const data = logs.map(log => ({
      Log_ID: log.id,
      Timestamp: new Date(log.created_at).toLocaleString(),
      Action: log.action,
      Entity_Type: log.entity_type || log.entity || '',
      Entity_ID: log.entity_id || '',
      Changed_By: log.changed_by || 'System',
      Emp_ID: log.details?.action_by_emp_id || log.details?.employee_id || '—',
      Payload_Details: typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Trail Report');
    XLSX.writeFile(workbook, `Detailed_Audit_Report_${month}_${year}.xlsx`);
  };

  const handleResetFilters = () => {
    setMonth((date.getMonth() + 1).toString());
    setYear(date.getFullYear().toString());
    setActionFilter('ALL');
    setEntityFilter('ALL');
    setSearchQuery('');
  };

  return {
    user, month, setMonth, year, setYear, actionFilter, setActionFilter, entityFilter, setEntityFilter,
    searchQuery, setSearchQuery, page, setPage, totalPages, totalRecords, logs, loading, isDeleting,
    selectedIds, activeDetailLog, setActiveDetailLog, kpi, months, years,
    handleToggleSelectAll, handleToggleSelect, handleDeleteSingle, handleDeleteBulk, handleDeleteMonth,
    handleDownloadExcel, handleResetFilters, fetchLogs
  };
}
