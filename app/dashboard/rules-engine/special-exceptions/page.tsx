"use client";

import React, { useState, useEffect } from 'react';
import { SpecialHeader } from './components/SpecialHeader';
import { SpecialRateGridCard } from './components/SpecialRateGridCard';
import { SpecialEmployeeTable } from './components/SpecialEmployeeTable';

export default function SpecialExceptionsPage() {
  const [specialGrid, setSpecialGrid] = useState<any[]>([]);
  const [specialGridLoading, setSpecialGridLoading] = useState(false);
  const [isSavingGrid, setIsSavingGrid] = useState(false);

  const [specialEmployees, setSpecialEmployees] = useState<any[]>([]);
  const [specialLoading, setSpecialLoading] = useState(false);
  const [specialSearch, setSpecialSearch] = useState('');
  const [specialPage, setSpecialPage] = useState(1);
  const specialLimit = 10;
  const [specialTotal, setSpecialTotal] = useState(0);

  useEffect(() => {
    fetchSpecialGrid();
    fetchSpecialEmployees();
  }, []);

  const fetchSpecialGrid = () => {
    setSpecialGridLoading(true);
    fetch('/api/admin/special-grid')
      .then(r => r.json())
      .then(d => {
        if (d.success) setSpecialGrid(d.data);
        setSpecialGridLoading(false);
      })
      .catch(() => setSpecialGridLoading(false));
  };

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

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSpecialEmployees(specialSearch, specialPage);
    }, 250);
    return () => clearTimeout(handler);
  }, [specialSearch, specialPage]);

  const handleToggleSpecial = async (empId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/special', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: empId, is_special: !currentStatus })
      });
      if (res.ok) fetchSpecialEmployees(specialSearch, specialPage);
    } catch (e) {
      alert("Error updating special status");
    }
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
        alert('Special Grid updated successfully');
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

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-slate-50/40">
      <SpecialHeader />

      <SpecialRateGridCard
        specialGrid={specialGrid}
        setSpecialGrid={setSpecialGrid}
        isSavingGrid={isSavingGrid}
        onSaveGrid={handleSaveGrid}
      />

      <SpecialEmployeeTable
        employees={specialEmployees}
        loading={specialLoading}
        search={specialSearch}
        setSearch={setSpecialSearch}
        page={specialPage}
        setPage={setSpecialPage}
        total={specialTotal}
        limit={specialLimit}
        onToggleSpecial={handleToggleSpecial}
      />
    </div>
  );
}
