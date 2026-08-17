"use client";
import { useState, useEffect } from 'react';
import { MasterGridData } from '../types';

const INITIAL_GRID_DATA: MasterGridData = {
  associateTenured: [],
  associateVintage: [],
  leadership: [],
  specialExceptions: [],
  grid1_mapping: { locations: [], clients: [], products: [] },
  column_mappings: {
    collection: 'total_money_collected',
    salary: 'ctc',
    doj: 'date_of_joining',
    designation: 'job_title',
    tl_name: 'tl_name',
    am_name: 'am_name',
    employee_code: 'employee_code',
    employee_name: 'employee_name'
  },
  tenured_salary_ranges: []
};

export function useMasterGrids() {
  const [masterGrids, setMasterGrids] = useState<MasterGridData>(INITIAL_GRID_DATA);
  const [masterGridsLoading, setMasterGridsLoading] = useState(false);
  const [isSavingMasterGrid, setIsSavingMasterGrid] = useState(false);
  const [excelDbData, setExcelDbData] = useState<{
    dpfRecords: any[];
    kekaEmployees: any[];
    masterGrids: any;
    liveCalculations: any[];
  } | null>(null);
  const [excelDbLoading, setExcelDbLoading] = useState(false);

  useEffect(() => {
    fetchMasterGrids();
    fetchExcelData();
  }, []);

  const fetchMasterGrids = () => {
    setMasterGridsLoading(true);
    fetch('/api/admin/master-grids')
      .then(r => r.json())
      .then(d => {
        if (d.success) setMasterGrids(d.data);
        setMasterGridsLoading(false);
      })
      .catch(() => setMasterGridsLoading(false));
  };

  const fetchExcelData = () => {
    setExcelDbLoading(true);
    fetch('/api/admin/master-grids/excel-data')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setExcelDbData(d.data);
          if (d.data.masterGrids) {
            setMasterGrids(prev => ({ ...prev, ...d.data.masterGrids }));
          }
        }
        setExcelDbLoading(false);
      })
      .catch(() => setExcelDbLoading(false));
  };

  const handleSaveGrid = async (gridName: string) => {
    setIsSavingMasterGrid(true);
    try {
      await fetch('/api/admin/master-grids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridName: 'grid1_mapping', data: masterGrids.grid1_mapping })
      });
      await fetch('/api/admin/master-grids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridName: 'column_mappings', data: masterGrids.column_mappings })
      });
      const dataToSave = JSON.parse(JSON.stringify(masterGrids[gridName as keyof MasterGridData]));
      const res = await fetch('/api/admin/master-grids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gridName, data: dataToSave })
      });
      const data = await res.json();
      if (!data.success) alert('Failed to save grid');
      else alert('Grid updated successfully!');
    } catch {
      alert('Error saving grid');
    } finally {
      setIsSavingMasterGrid(false);
    }
  };

  return {
    masterGrids,
    setMasterGrids,
    masterGridsLoading,
    isSavingMasterGrid,
    setIsSavingMasterGrid,
    excelDbData,
    excelDbLoading,
    handleSaveGrid
  };
}
