"use client";
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export function useIncentiveLocationData(defaultLocation: string) {
  const { user } = useApp();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [uiConfig, setUiConfig] = useState<{ columns: string[], filters: string[] }>({ columns: [], filters: [] });
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 100;
  
  const [filterMonth, setFilterMonth] = useState("");
  const [filterLocation] = useState(defaultLocation);
  const [filterClient, setFilterClient] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [clientOptions, setClientOptions] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<any[]>([]);
  const [productOptions, setProductOptions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/universal/clients'),
      fetch('/api/universal/locations'),
      fetch('/api/universal/products')
    ]).then(async ([c, l, p]) => {
      const clients = await c.json();
      const locations = await l.json();
      const products = await p.json();
      setClientOptions(clients.success ? clients.data : []);
      setLocationOptions(locations.success ? locations.data : []);
      setProductOptions(products.success ? products.data : []);
    });
  }, []);

  const fetchData = async () => {
    if (!filterClient || !filterProduct) {
      setData([]); setLoading(false); return;
    }
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('groupBy', 'employee_code');
      if (filterMonth) queryParams.append('month', filterMonth);
      if (filterYear) queryParams.append('year', filterYear);
      if (filterClient) queryParams.append('client', filterClient);
      if (filterProduct) queryParams.append('product', filterProduct);
      queryParams.append('location', defaultLocation);

      const [kekaRes, incRes] = await Promise.all([
        fetch('/api/keka', { cache: 'no-store' }),
        fetch(`/api/incentives?${queryParams.toString()}`, { cache: 'no-store' })
      ]);
      
      const kekaResult = await kekaRes.json();
      const incResult = await incRes.json();
      
      if (kekaResult.success) {
        const kekaData = kekaResult.data;
        const incData = incResult.success ? incResult.data : [];
        setUiConfig(incResult.ui_config || { columns: [], filters: [] });
        
        const baseKeka = kekaData.filter((emp: any) => {
          const locMatch = !filterLocation || emp.location === filterLocation;
          const clientMatch = !filterClient || emp.client === filterClient;
          const productMatch = !filterProduct || emp.product === filterProduct;
          return locMatch && clientMatch && productMatch;
        });
        
        const mergedData = baseKeka.map((emp: any) => {
          const match = incData.find((inc: any) => inc.employee_id === emp.employee_id) || {};
          return {
            ...emp, ...match,
            employee_code: emp.employee_id,
            employee_name: match.name || emp.name || emp.employee_id,
            name: match.name || emp.name || emp.employee_id,
            money_collected: match.total_collection ?? 0,
            total_collection: match.total_collection ?? 0,
            final_incentive: match.incentive ?? 0,
            incentive: match.incentive ?? 0,
            am: match.am_name || match.am || emp.am_name || '—',
            am_name: match.am_name || match.am || emp.am_name || '—',
            tl_name: match.tl_name || emp.tl_name || '—',
            aph: match.aph || emp.aph || '—',
            ph: match.ph || emp.ph || '—',
            bucket: match.bucket || emp.bucket || '—',
            payment_mode: match.payment_mode || emp.payment_mode || '—',
            designation: match.designation || emp.designation || '—'
          };
        });
        setData(mergedData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') { router.push('/dashboard'); return; }
    if (user) fetchData();
  }, [user, filterMonth, filterYear, filterLocation, filterClient, filterProduct]);

  const uniqueFilterValues = useMemo(() => {
    const filtersObj: Record<string, string[]> = {};
    if (!uiConfig.filters) return filtersObj;
    uiConfig.filters.forEach(key => {
      filtersObj[key] = Array.from(new Set(data.map(d => {
        const val = d[key] || d[key.toLowerCase()];
        return typeof val === 'string' ? val : '';
      }).filter(x => x && x !== '—'))).sort();
    });
    return filtersObj;
  }, [data, uiConfig.filters]);

  const filteredData = useMemo(() => {
    return data.filter(r => {
      for (const [key, selectedVal] of Object.entries(activeFilters)) {
        if (selectedVal && selectedVal !== "All") {
          const rowVal = r[key] || r[key.toLowerCase()];
          if (rowVal !== selectedVal) return false;
        }
      }
      return !search || (
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
        r.designation?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, activeFilters, search]);

  const totalCount = filteredData.length;
  const paginatedData = useMemo(() => filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredData, page]);
  const totalIncentives = useMemo(() => filteredData.reduce((sum, r) => sum + (r.final_incentive || 0), 0), [filteredData]);
  const totalColl = useMemo(() => filteredData.reduce((sum, r) => sum + (r.total_collection || 0), 0), [filteredData]);

  const downloadExcel = () => {
    if (!filteredData.length) { alert("No valid data to download."); return; }
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incentives");
    XLSX.writeFile(wb, `Incentives_${defaultLocation}_${filterMonth || 'All'}_${filterYear || 'All'}.xlsx`);
  };

  return {
    data, loading, search, setSearch, activeFilters, setActiveFilters, uiConfig,
    selectedRecord, setSelectedRecord, page, setPage, PAGE_SIZE, filterMonth, setFilterMonth,
    filterClient, setFilterClient, filterProduct, setFilterProduct, filterYear, setFilterYear,
    clientOptions, productOptions, uniqueFilterValues, filteredData, totalCount, paginatedData,
    totalIncentives, totalColl, downloadExcel
  };
}
