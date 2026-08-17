"use client";
import React from 'react';
import { Users, UserPlus, KeyRound, Trash2 } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';

interface AdminUserManagementProps {
  users: any[];
  loading: boolean;
  onOpenAddUser: () => void;
  onEditPassword: (id: number, username: string) => void;
  onDeleteUser: (id: number, username: string) => void;
}

export function AdminUserManagement({
  users,
  loading,
  onOpenAddUser,
  onEditPassword,
  onDeleteUser
}: AdminUserManagementProps) {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90">
      <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#024e4d] text-white shrink-0 rounded-none shadow-2xs">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">User Management</h1>
              <span className="bg-teal-50 text-teal-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-teal-200">
                {users.length} Users
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Manage operator credentials, roles, and location assignments.</p>
          </div>
        </div>

        <button
          onClick={onOpenAddUser}
          className="h-8 bg-[#024e4d] hover:bg-[#036261] text-white px-3 text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 rounded-none cursor-pointer"
        >
          <UserPlus size={14} /> Add User
        </button>
      </div>

      <div className="border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col flex-1 rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-2 w-20">Emp ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <TableRowSkeleton cols={8} rows={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No active user accounts found.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 font-mono text-[11px] font-bold text-slate-700">{u.employee_id || '—'}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{u.name || u.username}</td>
                    <td className="px-4 py-2 text-slate-600 font-mono text-[11px]">{u.username}</td>
                    <td className="px-4 py-2 text-slate-500">{u.email || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase font-mono ${
                        u.role === 'admin' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{u.location || 'All Hubs'}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold font-mono">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditPassword(u.id, u.username)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                          title="Change Password"
                        >
                          <KeyRound size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteUser(u.id, u.username)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-none transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
