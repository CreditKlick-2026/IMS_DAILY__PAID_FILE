"use client";
import React, { useState } from 'react';
import { LogOut } from 'lucide-react';

interface ProfileDropdownProps {
  user: any;
  logout: () => void;
}

export function ProfileDropdown({ user, logout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = user?.initials || user?.name?.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer rounded-full"
        title="Account Profile"
      >
        {initials}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-300 shadow-2xl z-50 rounded-none animate-in fade-in duration-150">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'System Admin'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || user?.username || 'admin@creditklick.com'}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="bg-teal-50 text-teal-800 text-[9px] font-mono font-bold px-1.5 py-0.2 border border-teal-200">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
                {user?.location && (
                  <span className="bg-slate-100 text-slate-700 text-[9px] font-mono font-bold px-1.5 py-0.2 border border-slate-200">
                    {user.location}
                  </span>
                )}
              </div>
            </div>
            <div className="p-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-none cursor-pointer transition-colors"
                onClick={() => {
                  if (confirm('Are you sure you want to logout?')) logout();
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
