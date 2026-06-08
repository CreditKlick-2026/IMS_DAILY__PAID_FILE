"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { 
  Users, Activity, Shield, Trash2, Settings, MoreVertical, Database, 
  CheckCircle2, AlertCircle, Edit3, XCircle, Search, Menu, LogOut, FileSpreadsheet, Loader2, UserPlus 
} from "lucide-react";

export default function AdminPage() {
  const [activeItem, setActiveItem] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excels, setExcels] = useState<any[]>([]);
  const [excelsLoading, setExcelsLoading] = useState(false);
  
  const [trackerMonth, setTrackerMonth] = useState(new Date().getMonth() + 1);
  const [trackerYear, setTrackerYear] = useState(new Date().getFullYear());
  const [trackerData, setTrackerData] = useState<any[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [deleteMonth, setDeleteMonth] = useState(new Date().getMonth() + 1);
  const [deleteYear, setDeleteYear] = useState(new Date().getFullYear());
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    // If not admin, redirect or show nothing
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);


  const fetchExcels = () => {
    setExcelsLoading(true);
    fetch(`/api/admin/excels?month=${deleteMonth}&year=${deleteYear}`)
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
    fetch(`/api/admin/tracker?month=${trackerMonth}&year=${trackerYear}`)
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
    } else if (activeItem === 'excels') {
      fetchExcels();
    } else if (activeItem === 'tracker') {
      fetchTrackerData();
    }
  }, [activeItem, trackerMonth, trackerYear, deleteMonth, deleteYear]);

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
        body: JSON.stringify({ employee_id: newEmployeeId, name: newName, username: newUsername, email: newEmail, password: newPassword, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        alert('User created successfully!');
        setShowAddUserModal(false);
        setNewEmployeeId('');
        setNewName('');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('user');
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

  const adminModules = [
    { id: 'tracker', title: 'Daily Tracker', subtitle: 'Date-wise matrix of uploaded files', icon: <Activity size={20} className="text-emerald-500" /> },
    { id: 'users', title: 'User Management', subtitle: 'Manage user roles, access, and profiles', icon: <Users size={20} className="text-blue-500" /> },
    { id: 'excels', title: 'Uploaded Excels', subtitle: 'View who uploaded which excel and manage them', icon: <FileSpreadsheet size={20} className="text-indigo-500" /> },
  ];

  const renderContent = () => {
    switch(activeItem) {
      case 'tracker':
        const daysInMonth = new Date(trackerYear, trackerMonth, 0).getDate();
        const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const today = new Date();
        const isCurrentMonth = today.getMonth() + 1 === trackerMonth && today.getFullYear() === trackerYear;
        const currentDay = today.getDate();

        return (
          <div className="flex flex-col gap-6 p-8 max-w-full mx-auto h-full relative">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
              <div>
                <h2 className="text-2xl font-black tracking-tight bg-gradient-to-br from-slate-800 to-slate-500 bg-clip-text text-transparent flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  Daily Upload Tracker
                </h2>
                <p className="text-xs text-slate-500 font-medium ml-10 mt-0.5">Real-time compliance monitoring matrix</p>
              </div>
              <div className="flex gap-3">
                <select 
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 outline-none transition-colors cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
                  value={trackerMonth}
                  onChange={(e) => setTrackerMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
                <select 
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 outline-none transition-colors cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
                  value={trackerYear}
                  onChange={(e) => setTrackerYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Premium Legend */}
            <div className="flex flex-wrap items-center gap-4 px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Legend:</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span className="text-[11px] font-bold text-emerald-700">User Upload</span></div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100"><Shield className="w-3.5 h-3.5 text-purple-600" /><span className="text-[11px] font-bold text-purple-700">Admin Proxy</span></div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100"><Trash2 className="w-3.5 h-3.5 text-orange-600" /><span className="text-[11px] font-bold text-orange-700">Admin Deleted</span></div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100"><XCircle className="w-3.5 h-3.5 text-red-600" /><span className="text-[11px] font-bold text-red-700">Pending</span></div>
            </div>
            
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="overflow-x-auto no-scrollbar pb-2">
                <table className="w-full text-sm text-center border-collapse">
                  <thead className="whitespace-nowrap sticky top-0 z-20">
                    <tr>
                      <th className="px-5 py-4 font-bold text-slate-700 text-left border-r border-b border-slate-200 bg-slate-50/95 backdrop-blur shadow-[2px_0_10px_-3px_rgba(0,0,0,0.05)] sticky left-0 z-30">
                        Agent / User
                      </th>
                      {daysArray.map(day => (
                        <th key={day} className={`px-2 py-4 font-bold border-r border-b border-slate-100 min-w-[42px] transition-colors ${isCurrentMonth && day === currentDay ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'bg-white text-slate-500'}`}>
                          {day}
                        </th>
                      ))}
                      <th className="px-5 py-4 font-bold text-slate-700 border-l border-b border-slate-200 bg-slate-50/95 backdrop-blur sticky right-0 z-30 shadow-[-2px_0_10px_-3px_rgba(0,0,0,0.05)]">
                        Missing
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trackerLoading ? (
                      <tr><td colSpan={daysInMonth + 2} className="px-4 py-12 text-center text-slate-400 font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" /> Loading matrix...</td></tr>
                    ) : trackerData.length === 0 ? (
                      <tr><td colSpan={daysInMonth + 2} className="px-4 py-12 text-center text-slate-400 font-medium">No agents found for this period.</td></tr>
                    ) : (
                      trackerData.map((u: any, idx: number) => {
                        let pendingCount = 0;
                        return (
                          <tr key={u.employee_id || u.username} className={`group hover:bg-slate-50/80 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                            <td className="px-5 py-3.5 text-left border-r border-slate-200 sticky left-0 bg-white group-hover:bg-slate-50/95 transition-colors z-10 shadow-[2px_0_10px_-3px_rgba(0,0,0,0.05)]">
                              <p className="font-bold text-slate-800">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{u.employee_id}</p>
                            </td>
                            {daysArray.map(day => {
                              const dateStr = `${trackerYear}-${String(trackerMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                              const cellStatus = u.uploads[dateStr];
                              const isUploaded = !!cellStatus;
                              const isFuture = isCurrentMonth && day > currentDay;
                              
                              if (!isUploaded && !isFuture) pendingCount++;

                              return (
                                <td key={day} className={`p-1.5 border-r border-slate-100 transition-colors ${isCurrentMonth && day === currentDay ? 'bg-indigo-50/30' : ''}`}>
                                  <div className="flex items-center justify-center w-full h-full min-h-[32px]">
                                    {!isUploaded ? (
                                      isFuture ? <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> : 
                                      <div title="Pending" className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 shadow-sm"><XCircle className="w-4 h-4 text-red-500" /></div>
                                    ) : (
                                      cellStatus === 'DELETED_BY_ADMIN' ? <div title="Uploaded but Deleted by Admin" className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200 flex items-center justify-center shadow-sm cursor-help hover:scale-110 transition-transform"><Trash2 className="w-3.5 h-3.5 text-orange-600" /></div> :
                                      cellStatus === 'UPLOADED_BY_ADMIN' ? <div title="Proxy Upload by Admin" className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center shadow-sm cursor-help hover:scale-110 transition-transform"><Shield className="w-3.5 h-3.5 text-purple-600" /></div> :
                                      cellStatus === 'FAILED' ? <div title="Failed Upload" className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-100 to-red-50 border border-red-200 flex items-center justify-center shadow-sm cursor-help hover:scale-110 transition-transform"><AlertCircle className="w-4 h-4 text-red-600" /></div> :
                                      <div title="Uploaded by User" className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-md shadow-emerald-500/20 flex items-center justify-center cursor-help hover:scale-110 transition-transform"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="px-5 py-3.5 font-black text-lg border-l border-slate-200 sticky right-0 z-10 bg-white group-hover:bg-slate-50/95 transition-colors shadow-[-2px_0_10px_-3px_rgba(0,0,0,0.05)] text-center">
                              {pendingCount > 0 ? (
                                <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-red-100 text-red-600 border border-red-200">{pendingCount}</span>
                              ) : (
                                <span className="inline-flex items-center justify-center min-w-[32px] h-8 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100">0</span>
                              )}
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
          <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto h-full relative">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Uploaded Excels</h2>
                <p className="text-muted-foreground">View who uploaded which excel and manage records.</p>
              </div>
              <div className="flex gap-4">
                <select 
                  className="border rounded-md px-3 py-2 outline-none bg-white"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
                <select 
                  className="border rounded-md px-3 py-2 outline-none bg-white"
                  value={deleteYear}
                  onChange={(e) => setDeleteYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-xl bg-card overflow-hidden space-y-4">
              {excelsLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading excels...</div>
              ) : excels.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-xl">No excels found for this month.</div>
              ) : (
                (() => {
                  const groupedExcels = excels.reduce((acc: any, job: any) => {
                    const user = job.uploaded_by_name || job.uploaded_by_employee_id || 'Unknown User';
                    if (!acc[user]) acc[user] = [];
                    acc[user].push(job);
                    return acc;
                  }, {});

                  return Object.keys(groupedExcels).map(user => (
                    <div key={user} className="border rounded-xl overflow-hidden shadow-sm">
                      <div 
                        className="px-5 py-4 bg-slate-50/80 cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors"
                        onClick={() => setExpandedUser(expandedUser === user ? null : user)}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-500" />
                          <span className="font-bold text-lg">{user}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-sm font-medium bg-white px-3 py-1 rounded-full border">{groupedExcels[user].length} Files Uploaded</span>
                          <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedUser === user ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      
                      {expandedUser === user && (
                        <div className="border-t">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-white text-muted-foreground border-b">
                              <tr>
                                <th className="px-5 py-3 font-medium">Uploaded Date</th>
                                <th className="px-5 py-3 font-medium">File Name</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium">Rows (Processed / Total)</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                              {groupedExcels[user].map((job: any) => {
                                const fileName = job.file_path ? job.file_path.split(/[\/\\]/).pop().split('_').slice(1).join('_') || job.file_path : 'Unknown';
                                return (
                                  <tr key={job.id} className="hover:bg-slate-50/50">
                                    <td className="px-5 py-3 font-medium">
                                      {job.upload_at ? new Date(job.upload_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                      <span className="block text-xs text-muted-foreground font-normal">Sys: {new Date(job.created_at).toLocaleString()}</span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-600 font-medium max-w-[200px] truncate" title={fileName}>{fileName}</td>
                                    <td className="px-5 py-3 text-muted-foreground">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : job.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {job.status}
                                      </span>
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground font-medium">{job.processed_rows} / {job.total_rows}</td>
                                    <td className="px-5 py-3 text-right">
                                      <div className="flex items-center justify-end gap-2">

                                        {job.status !== 'DELETED_BY_ADMIN' ? (
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteExcel(job.id); }}
                                            className="text-xs bg-red-50 hover:bg-red-500 hover:text-white text-red-600 font-bold px-3 py-2 rounded-lg border border-red-200 hover:border-red-500 transition-all shadow-sm"
                                          >
                                            Delete File
                                          </button>
                                        ) : (
                                          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">Deleted</span>
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
          <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto h-full relative">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                <p className="text-muted-foreground">Manage system access and roles.</p>
              </div>
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                <UserPlus size={16} />
                Add User
              </button>
            </div>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Emp ID</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No users found.</td></tr>
                  ) : (
                    users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-muted-foreground">{u.employee_id || '-'}</td>
                        <td className="px-4 py-3 font-medium">{u.name || '-'}</td>
                        <td className="px-4 py-3 font-medium">{u.username}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email || '-'}</td>
                        <td className="px-4 py-3 capitalize">{u.role}</td>
                        <td className="px-4 py-3 text-green-600">Active</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditPassword(u.id, u.username)}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
                            >
                              Edit Password
                            </button>
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md border border-red-200 transition-colors"
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

            {/* ADD USER MODAL */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Add New User</h3>
                    <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
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
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input 
                        type="text" 
                        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                        placeholder="Enter Employee Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
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
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Settings size={48} className="opacity-20 mb-4" />
            <h2 className="text-xl font-medium">{adminModules.find(m => m.id === activeItem)?.title}</h2>
            <p className="text-sm">Configuration section under development.</p>
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
      <div className="w-[220px] lg:w-[240px] flex-shrink-0 flex flex-col border-r border-border bg-background">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Settings size={16} />
            </div>
            Admin Panel
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button className="hover:text-foreground transition-colors"><Search size={18} /></button>
            <button className="hover:text-foreground transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col pb-4">
            {adminModules.map((mod) => (
              <div 
                key={mod.id}
                onClick={() => setActiveItem(mod.id)}
                className={`flex items-start gap-3 px-4 py-2 border-b border-border cursor-pointer transition-colors ${
                  activeItem === mod.id ? 'bg-primary/5 border-l-4 border-l-primary pl-3' : 'hover:bg-muted/30 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {mod.icon}
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-[14px] font-semibold text-foreground">{mod.title}</span>
                  <span className="text-[12px] text-muted-foreground mt-0.5 leading-tight line-clamp-2">{mod.subtitle}</span>
                </div>
              </div>
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
