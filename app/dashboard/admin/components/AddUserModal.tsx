"use client";
import React from 'react';
import { X, UserPlus } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEmployeeId: string;
  setNewEmployeeId: (s: string) => void;
  newUsername: string;
  setNewUsername: (s: string) => void;
  newEmail: string;
  setNewEmail: (s: string) => void;
  newPassword: string;
  setNewPassword: (s: string) => void;
  newRole: string;
  setNewRole: (s: string) => void;
  newLocation: string;
  setNewLocation: (s: string) => void;
  locationOptions: any[];
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  newEmployeeId,
  setNewEmployeeId,
  newUsername,
  setNewUsername,
  newEmail,
  setNewEmail,
  newPassword,
  setNewPassword,
  newRole,
  setNewRole,
  newLocation,
  setNewLocation,
  locationOptions,
  isSubmitting,
  onSubmit
}: AddUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col rounded-none">
        <div className="px-5 py-3.5 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-[#024e4d]" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Create New Operator / Admin</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
            <input
              type="text"
              placeholder="e.g. EMP1042"
              className="w-full px-3 py-1.5 border border-slate-300 outline-none focus:border-teal-600 rounded-none font-mono"
              value={newEmployeeId}
              onChange={e => setNewEmployeeId(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name / Username *</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              className="w-full px-3 py-1.5 border border-slate-300 outline-none focus:border-teal-600 rounded-none"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="john@creditklick.com"
              className="w-full px-3 py-1.5 border border-slate-300 outline-none focus:border-teal-600 rounded-none"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-1.5 border border-slate-300 outline-none focus:border-teal-600 rounded-none"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Role *</label>
            <select
              className="w-full px-3 py-1.5 border border-slate-300 bg-white outline-none focus:border-teal-600 rounded-none font-semibold text-slate-800"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
            >
              <option value="user">User (Standard Operator)</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          {newRole === 'user' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Hub Location</label>
              <select
                className="w-full px-3 py-1.5 border border-slate-300 bg-white outline-none focus:border-teal-600 rounded-none font-semibold text-slate-800"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
              >
                <option value="">Select Location</option>
                {locationOptions.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !newUsername.trim() || !newPassword.trim()}
            className="px-4 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold rounded-none shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
