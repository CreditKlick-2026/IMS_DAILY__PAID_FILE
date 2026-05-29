"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Settings, 
  Shield, 
  Database,
  Activity,
  UserPlus,
  Search,
  MoreVertical,
  UploadCloud,
  FileText,
  Trash2
} from 'lucide-react';

export default function AdminPage() {
  const [activeItem, setActiveItem] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('agent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excels, setExcels] = useState<any[]>([]);
  const [excelsLoading, setExcelsLoading] = useState(false);
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
    fetch('/api/admin/excels')
      .then(r => r.json())
      .then(d => {
        if (d.success) setExcels(d.jobs);
        setExcelsLoading(false);
      })
      .catch(() => setExcelsLoading(false));
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
    } else if (activeItem === 'delete-excel') {
      fetchExcels();
    }
  }, [activeItem]);

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
        body: JSON.stringify({ employee_id: newEmployeeId, name: newName, username: newUsername, password: newPassword, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        alert('User created successfully!');
        setShowAddUserModal(false);
        setNewEmployeeId('');
        setNewName('');
        setNewUsername('');
        setNewPassword('');
        setNewRole('agent');
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
    if (!window.confirm("Are you sure you want to delete this Excel file and all of its associated records? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/excels?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert("Excel deleted successfully.");
        fetchExcels();
      } else {
        alert(data.error || "Failed to delete.");
      }
    } catch (e) {
      alert("Error deleting excel.");
    }
  };

  const adminModules = [
    { id: 'users', title: 'User Management', subtitle: 'Manage user roles, access, and profiles', icon: <Users size={20} className="text-blue-500" /> },
    { id: 'roles', title: 'Roles & Permissions', subtitle: 'Configure granular permissions for roles', icon: <Shield size={20} className="text-amber-500" /> },
    { id: 'delete-excel', title: 'Delete Excel', subtitle: 'Remove uploaded excels and their records', icon: <Trash2 size={20} className="text-red-500" /> },
    { id: 'system', title: 'System Settings', subtitle: 'Global application settings and defaults', icon: <Settings size={20} className="text-slate-500" /> },
    { id: 'portfolios', title: 'Portfolio Management', subtitle: 'Manage debt portfolios and imports', icon: <Database size={20} className="text-purple-500" /> },
    { id: 'audit', title: 'Audit Logs', subtitle: 'View system-wide activity logs', icon: <MoreVertical size={20} className="text-indigo-500" /> },
  ];

  const renderContent = () => {
    switch(activeItem) {
      case 'delete-excel':
        return (
          <div className="flex flex-col gap-6 p-8 max-w-6xl mx-auto h-full relative">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Delete Excel</h2>
              <p className="text-muted-foreground">Manage and permanently delete uploaded Excel batches.</p>
            </div>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Created At</th>
                    <th className="px-4 py-3 font-medium">Uploaded At</th>
                    <th className="px-4 py-3 font-medium">File Name</th>
                    <th className="px-4 py-3 font-medium">Uploaded By</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Rows</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {excelsLoading ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Loading excels...</td></tr>
                  ) : excels.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No excels found.</td></tr>
                  ) : (
                    excels.map((job: any) => {
                      const fileName = job.file_path ? job.file_path.split(/[\/\\]/).pop().split('_').slice(1).join('_') || job.file_path : 'Unknown';
                      return (
                        <tr key={job.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{new Date(job.created_at).toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium">{job.upload_at ? new Date(job.upload_at).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={fileName}>{fileName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{job.uploaded_by_name || job.uploaded_by_employee_id || '-'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{job.status}</td>
                          <td className="px-4 py-3 text-muted-foreground">{job.processed_rows} / {job.total_rows}</td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => handleDeleteExcel(job.id)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md border border-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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
                            <button 
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md border border-red-200 transition-colors"
                            >
                              Delete
                            </button>
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
                        <option value="agent">Agent</option>
                        <option value="hr">HR</option>
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
