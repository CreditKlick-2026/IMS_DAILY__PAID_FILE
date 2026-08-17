"use client";
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { buildTableCols, exportRecordsToExcel } from './helpers';

export function useLeadsData(duplicateOnly?: boolean) {
  const { user, toast } = useApp();
  const [leads, setLeads] = useState<any[]>([]);
  const [leadColumns, setLeadColumns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filterTab, setFilterTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [exporting, setExporting] = useState(false);
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [masterLocationsList, setMasterLocationsList] = useState<any[]>([]);
  const [masterClientsList, setMasterClientsList] = useState<any[]>([]);
  const [masterColumns, setMasterColumns] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    employee_code: [], product: [], bucket: [], location: [],
    aph: [], ph: [], client: [], tl_name: [], employee_name: []
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetch('/api/metadata?t=' + Date.now()).then(r => r.json()).then(d => {
      if (d.leadColumns) setLeadColumns(d.leadColumns);
    }).catch(console.error);
    fetch('/api/universal/locations').then(r => r.json()).then(d => { if (d.success) setMasterLocationsList(d.data || []); });
    fetch('/api/universal/clients').then(r => r.json()).then(d => { if (d.success) setMasterClientsList(d.data || []); });
    fetch('/api/admin/columns').then(r => r.json()).then(d => { if (d.success) setMasterColumns(d.data || []); });
  }, []);

  const filtersReady = user?.role === 'admin'
    ? !!(filterLocation && filterClient && filterProduct)
    : !!(filterClient && filterProduct);

  const fetchLeads = async () => {
    if (!filtersReady) {
      setLeads([]); setSelectedLead(null); setTotalCount(0); setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams({ q: search, searchType: filterTab, userId: user?.id || '' });
      if (filterMonth) query.append('month', filterMonth);
      if (filterYear) query.append('year', filterYear);
      if (filterLocation) query.append('location', filterLocation);
      if (filterClient) query.append('client', filterClient);
      if (filterProduct) query.append('product', filterProduct);
      Object.entries(filters).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(val => query.append(k, val));
        else if (v) query.append(k, v as string);
      });
      query.append('paginate', 'true');
      query.append('page', page.toString());
      query.append('limit', limit.toString());
      if (duplicateOnly) query.append('duplicateOnly', 'true');

      const queryString = query.toString();
      fetch(`/api/leads/filters?${queryString}`).then(r => r.json()).then(d => { if (d.success) setFilterOptions(d.filters); }).catch(console.error);

      const res = await fetch(`/api/leads?${queryString}`, { cache: 'no-store' });
      const data = await res.json();
      const leadsData = Array.isArray(data.leads) ? data.leads : (Array.isArray(data) ? data : []);
      setLeads(leadsData);
      setTotalCount(data.total || leadsData.length);
      if (leadsData.length > 0 && (!selectedLead || !leadsData.find((l: any) => l.id === selectedLead.id))) {
        setSelectedLead(leadsData[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { fetchLeads(); }, 300);
    return () => clearTimeout(timer);
  }, [search, filterTab, filterMonth, filterYear, filterLocation, filterClient, filterProduct, page, limit, JSON.stringify(filters)]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const query = new URLSearchParams({ q: search, export: 'true' });
      if (filterLocation) query.append('location', filterLocation);
      if (filterClient) query.append('client', filterClient);
      if (filterProduct) query.append('product', filterProduct);
      const res = await fetch(`/api/leads?${query.toString()}`);
      const data = await res.json();
      const records = Array.isArray(data.leads) ? data.leads : (Array.isArray(data) ? data : []);
      exportRecordsToExcel(records);
    } finally {
      setExporting(false);
    }
  };

  const handleApproveDuplicates = async () => {
    if (!confirm('Approve all duplicate records for this selection?')) return;
    const res = await fetch('/api/leads/approve-duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: filterMonth, year: filterYear })
    });
    const d = await res.json();
    if (d.success) { toast?.(`Approved ${d.count} records`); fetchLeads(); }
  };

  const tableCols = buildTableCols(masterClientsList, filterClient, filterProduct, masterColumns, leadColumns);

  return {
    user, toast, leads, leadColumns, search, setSearch, loading, selectedLead, setSelectedLead,
    filterTab, setFilterTab, showFilters, setShowFilters, filterMonth, setFilterMonth, filterYear, setFilterYear,
    filterLocation, setFilterLocation, filterClient, setFilterClient, filterProduct, setFilterProduct,
    exporting, filterOptions, masterLocationsList, masterClientsList, filters, setFilters,
    page, setPage, limit, setLimit, totalCount, filtersReady, fetchLeads, handleExport, handleApproveDuplicates, tableCols
  };
}
