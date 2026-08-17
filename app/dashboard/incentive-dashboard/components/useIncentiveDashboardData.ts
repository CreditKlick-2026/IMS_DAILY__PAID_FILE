"use client";
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import * as XLSX from 'xlsx';

export function useIncentiveDashboardData() {
  const { user } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterLocation, setFilterLocation] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [clientOptions, setClientOptions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/public/locations')
      .then(r => r.json())
      .then(d => { if (d.success) setLocationOptions(d.data); });
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
        if (!d.data.find((p: any) => String(p.id) === String(filterClient))) {
          setFilterClient('');
        }
      }
    });
  }, [filterLocation, locationOptions]);

  useEffect(() => {
    if (user) {
      if (!filterClient) {
        setData([]);
        setLoading(false);
        return;
      }
      fetchData();
    }
  }, [user, filterMonth, filterYear, filterClient, clientOptions]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filterMonth) queryParams.append('month', filterMonth);
      if (filterYear) queryParams.append('year', filterYear);
      if (filterClient) {
        const clientName = clientOptions.find(c => String(c.id) === String(filterClient))?.name;
        if (clientName) queryParams.append('client', clientName);
      }

      const res = await fetch(`/api/universal/dashboard?${queryParams.toString()}`);
      const result = await res.json();
      if (result.success) setData(result.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = data.length;
  const eligibleEmployees = data.filter(d => d.final_incentive > 0).length;
  const totalCollection = data.reduce((sum, d) => sum + (d.total_collection || 0), 0);
  const totalPayout = data.reduce((sum, d) => sum + (d.final_incentive || 0), 0);
  const avgIncentive = eligibleEmployees > 0 ? totalPayout / eligibleEmployees : 0;

  const desigPayout = data.reduce((acc, d) => {
    if (d.final_incentive > 0) {
      const desig = d.designation || 'Unknown';
      acc[desig] = (acc[desig] || 0) + d.final_incentive;
    }
    return acc;
  }, {} as Record<string, number>);
  const desigChartData = Object.entries(desigPayout).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value);

  const locPayout = data.reduce((acc, d) => {
    if (d.final_incentive > 0) {
      const loc = d.location || 'Unknown';
      acc[loc] = (acc[loc] || 0) + d.final_incentive;
    }
    return acc;
  }, {} as Record<string, number>);
  const locChartData = Object.entries(locPayout).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value);

  const topEarners = [...data]
    .filter(d => d.final_incentive > 0)
    .sort((a, b) => b.final_incentive - a.final_incentive)
    .slice(0, 10);

  const handleClearFilters = () => {
    setFilterMonth((new Date().getMonth() + 1).toString());
    setFilterYear(new Date().getFullYear().toString());
    setFilterLocation("");
    setFilterClient("");
  };

  const handleDownloadExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard");
    XLSX.writeFile(wb, `IncentiveDashboard_${filterMonth || 'All'}_${filterYear || 'All'}.xlsx`);
  };

  return {
    user, data, loading, filterMonth, setFilterMonth, filterYear, setFilterYear,
    filterLocation, setFilterLocation, filterClient, setFilterClient, locationOptions,
    clientOptions, totalEmployees, eligibleEmployees, totalCollection, totalPayout,
    avgIncentive, desigChartData, locChartData, topEarners, handleClearFilters, handleDownloadExcel
  };
}
