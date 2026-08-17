"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { GlobalSearchBar } from './topbar/GlobalSearchBar';
import { NotificationDropdown } from './topbar/NotificationDropdown';
import { ProfileDropdown } from './topbar/ProfileDropdown';

const STEFTO_LOGO_URL = "https://media.licdn.com/dms/image/v2/D560BAQGziVDQa-X8rg/company-logo_200_200/company-logo_200_200/0/1726028698359/stefto_logo?e=2147483647&v=beta&t=i4XdigJYfd4OeA_ZbwTlJbOTI1-kXiYcQevovHmsiyA";

interface TopbarProps {
  user: any;
  activePage?: string;
  logout: () => void;
  toggleMobileMenu?: () => void;
  toggleSidebar?: () => void;
}

export default function Topbar({ user, logout }: TopbarProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 flex items-center justify-between px-4 md:px-6 h-14 bg-white border-b border-slate-200 shrink-0 w-full z-50 select-none shadow-2xs">
      {/* 1. Left: Official Stefto Logo & Branding */}
      <div className="flex items-center gap-3">
        <img
          src={STEFTO_LOGO_URL}
          alt="Stefto Logo"
          className="w-8 h-8 object-contain rounded-full border border-slate-200 shadow-2xs bg-white"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-extrabold text-sm tracking-tight text-slate-900">Stefto</span>
            <span className="text-slate-300 font-light text-xs">/</span>
            <span className="font-bold text-xs tracking-wider text-[#024e4d] font-mono">IMS DPF</span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium tracking-wide">
            Collection Intelligence Engine
          </span>
        </div>
      </div>

      {/* 2. Center: Global Search Bar (Ctrl + K) */}
      <div className="flex-1 max-w-md mx-4 hidden md:flex justify-center">
        <GlobalSearchBar />
      </div>

      {/* 3. Right: Telemetry Status, Quick Action & Controls */}
      <div className="flex items-center gap-2.5">
        {/* System Health / Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span>LIVE ENGINE</span>
        </div>

        {/* Quick Ingest Action Button */}
        <button
          onClick={() => router.push('/dashboard/upload')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#024e4d] hover:bg-[#036261] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer rounded-none"
        >
          <UploadCloud size={13} />
          <span>Upload File</span>
        </button>

        {/* Notification Bell */}
        <NotificationDropdown userId={user?.id} />

        {/* User Profile Avatar */}
        <ProfileDropdown user={user} logout={logout} />
      </div>
    </div>
  );
}
