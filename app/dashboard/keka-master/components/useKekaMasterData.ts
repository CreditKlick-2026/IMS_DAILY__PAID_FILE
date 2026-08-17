"use client";
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export function useKekaMasterData() {
  const { user } = useApp();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kekaColumns, setKekaColumns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const currentMonthStr = String(new Date().getMonth() + 1);
  const currentYearStr = String(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDesig, setSelectedDesig] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [backendLocations, setBackendLocations] = useState<any[]>([]);
  const [backendClients, setBackendClients] = useState<string[]>([]);

  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 500;

  useEffect(() => {
    setPage(1);
  }, [search, selectedMonth, selectedYear, selectedLocation, selectedDesig, selectedClient]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/keka', { cache: 'no-store' });
      const result = await res.json();
      if (result.success) setData(result.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchKekaColumns = async () => {
    try {
      const res = await fetch('/api/admin/keka-columns', { cache: 'no-store' });
      const d = await res.json();
      if (d.success && Array.isArray(d.data)) {
        setKekaColumns(d.data);
      }
    } catch (e) {
      console.error("Failed to load keka columns", e);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      fetchData();
      fetchKekaColumns();
    }

    fetch('/api/public/locations')
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data)) setBackendLocations(d.data); })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    let url = '/api/universal/clients';
    if (selectedLocation && selectedLocation !== "All" && backendLocations.length > 0) {
      const matchedLoc = backendLocations.find(l => l.name === selectedLocation);
      if (matchedLoc) url += `?location_id=${matchedLoc.id}`;
    }
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          const names = Array.from(new Set(d.data.map((c: any) => c.name))) as string[];
          setBackendClients(names);
          if (selectedClient && selectedClient !== "All" && !names.includes(selectedClient)) {
            setSelectedClient("");
          }
        }
      })
      .catch(() => {});
  }, [selectedLocation, backendLocations]);

  const uniqueLocations = Array.from(new Set([...backendLocations.map(l => l.name), ...data.map(d => d.location).filter(Boolean)])).sort();
  const uniqueClients = backendClients.length > 0
    ? backendClients.sort()
    : Array.from(new Set(data.map(d => d.client).filter(Boolean))).sort();
  const uniqueDesigs = Array.from(new Set(data.map(d => d.designation).filter(Boolean))).sort();

  const filteredData = data.filter(r => {
    const locMatch = !selectedLocation || selectedLocation === "All" || r.location === selectedLocation;
    const desigMatch = !selectedDesig || selectedDesig === "All" || r.designation === selectedDesig;
    const clientMatch = !selectedClient || selectedClient === "All" || r.client === selectedClient;

    let monthMatch = true;
    let yearMatch = true;
    
    // Priority: Upload/Updated date (when this data was uploaded/synced)
    const uploadDateVal = r.updated_at || r.created_at || r.upload_date;
    const dateObj = uploadDateVal ? new Date(uploadDateVal) : (r.doj ? new Date(r.doj) : null);

    if (selectedMonth !== "All" && dateObj && !isNaN(dateObj.getTime())) {
      monthMatch = (dateObj.getMonth() + 1).toString() === selectedMonth;
    }
    if (selectedYear !== "All" && dateObj && !isNaN(dateObj.getTime())) {
      yearMatch = dateObj.getFullYear().toString() === selectedYear;
    }

    const searchMatch = !search || (
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.agent_ohr?.toLowerCase().includes(search.toLowerCase()) ||
      r.tl_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.am_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase()) ||
      r.client?.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.toLowerCase().includes(search.toLowerCase()) ||
      r.designation?.toLowerCase().includes(search.toLowerCase())
    );

    return locMatch && desigMatch && clientMatch && monthMatch && yearMatch && searchMatch;
  });

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = (employee: any) => {
    setEditingEmployee({ ...employee });
  };

  const handleDelete = async (id: string) => {
    const targetEmpId = String(id || '').trim();
    if (!targetEmpId) return;
    if (!confirm(`Are you sure you want to delete employee record (${targetEmpId})?`)) return;
    try {
      const res = await fetch(`/api/keka/${encodeURIComponent(targetEmpId)}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setData(prev => prev.filter(item => {
          const itemEmpId = String(item.employee_id || item.id || '').trim();
          return itemEmpId !== targetEmpId;
        }));
      } else {
        alert("Failed to delete record: " + (result.error || "Unknown error"));
      }
    } catch {
      alert("Error deleting record.");
    }
  };

  const handleSaveEmployee = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!editingEmployee) return;
    const targetEmpId = String(editingEmployee.employee_id || editingEmployee.id || '').trim();
    if (!targetEmpId) {
      alert("Employee ID is missing.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/keka/${encodeURIComponent(targetEmpId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEmployee)
      });
      const result = await res.json();
      if (result.success) {
        setData(prev => prev.map(item => {
          const itemEmpId = String(item.employee_id || item.id || '').trim();
          if (itemEmpId && itemEmpId === targetEmpId) {
            return { ...item, ...editingEmployee, ...(result.data || {}) };
          }
          return item;
        }));
        setEditingEmployee(null);
      } else {
        alert("Failed to update: " + (result.error || "Unknown error"));
      }
    } catch {
      alert("Error updating record.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const exportRows = filteredData.map(r => {
      const rowObj: Record<string, any> = {};
      if (kekaColumns.length > 0) {
        kekaColumns.forEach(c => {
          rowObj[c.display] = r[c.key] ?? r.extra_data?.[c.key] ?? r.extra_data?.[c.display] ?? '';
        });
      } else {
        return r;
      }
      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KekaMaster");
    XLSX.writeFile(wb, `Keka_Master_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return {
    user, data, loading, kekaColumns, fetchKekaColumns, search, setSearch, selectedMonth, setSelectedMonth,
    selectedYear, setSelectedYear, selectedLocation, setSelectedLocation,
    selectedDesig, setSelectedDesig, selectedClient, setSelectedClient,
    editingEmployee, setEditingEmployee, saving, page, setPage, PAGE_SIZE,
    totalCount, totalPages, paginatedData, filteredData, uniqueLocations,
    uniqueClients, uniqueDesigs, handleEdit, handleDelete, handleSaveEmployee,
    handleUpdate: handleSaveEmployee, handleExport, downloadExcel: handleExport
  };
}
