"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid, Users, UploadCloud, BarChart2, Settings,
  LineChart, Database, LogOut, Network, ShieldCheck,
  FileSpreadsheet, Sliders, Building2, UserCheck
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  user: any;
  isMobileOpen?: boolean;
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
  logout?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', link: '/dashboard', Icon: LayoutGrid },
  { id: 'live-records', label: 'Live Records', link: '/dashboard/live-records', Icon: FileSpreadsheet },
  { id: 'upload', label: 'Upload Data', link: '/dashboard/upload', Icon: UploadCloud, roles: ['admin', 'user'] },
  { id: 'duplicate', label: 'Duplicates', link: '/dashboard/duplicate', Icon: ShieldCheck },
  { id: 'admin', label: 'Admin', link: '/dashboard/admin', Icon: Settings, roles: ['admin'] },
  { id: 'rules-engine', label: 'Rules Engine', link: '/dashboard/rules-engine', Icon: Sliders, roles: ['admin'] },
  { id: 'incentive-gurugram', label: 'Gurugram', link: '/dashboard/incentive/gurugram', Icon: Building2 },
  { id: 'incentive-uttam-nagar', label: 'Uttam N', link: '/dashboard/incentive/uttam-nagar', Icon: Building2 },
  { id: 'incentive-pune', label: 'Pune', link: '/dashboard/incentive/pune', Icon: Building2 },
  { id: 'incentive-delhi', label: 'Delhi', link: '/dashboard/incentive/delhi', Icon: Building2 },
  { id: 'incentive-dashboard', label: 'Incentives', link: '/dashboard/incentive-dashboard', Icon: BarChart2 },
  { id: 'audit', label: 'Audit Logs', link: '/dashboard/audit', Icon: LineChart, roles: ['admin'] },
  { id: 'keka-master', label: 'Employees', link: '/dashboard/keka-master', Icon: Users, roles: ['admin'] }
];

export default function Sidebar({
  activePage,
  setActivePage,
  user,
  isMobileOpen,
  logout
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const visibleItems = navItems.filter(i => !i.roles || i.roles.includes(user?.role));

  return (
    <aside
      className={`h-[calc(100vh-60px)] w-[84px] bg-[#024e4d] flex-shrink-0 flex flex-col justify-between py-3 transition-transform duration-200 z-30 select-none ${
        isMobileOpen ? 'translate-x-0 fixed left-0 top-[60px]' : '-translate-x-full lg:translate-x-0 relative'
      }`}
    >
      {/* Navigation Items List */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center gap-4 px-1 py-1">
        {visibleItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.Icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.link) router.push(item.link);
                else setActivePage(item.id);
              }}
              className="group flex flex-col items-center justify-center w-full focus:outline-none cursor-pointer transition-all duration-150"
              title={item.label}
            >
              {/* Icon Container: Active items get a crisp white circular badge */}
              <div
                className={`w-11 h-11 flex items-center justify-center transition-all duration-150 ${
                  isActive
                    ? 'bg-white rounded-full text-[#024e4d] shadow-md scale-105'
                    : 'text-emerald-100/90 group-hover:text-white group-hover:bg-white/10 rounded-xl'
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-[#024e4d] stroke-[2.4]' : 'stroke-[1.8]'}
                />
              </div>

              {/* Text Label Underneath */}
              <span
                className={`text-[10px] tracking-tight mt-1 text-center font-medium leading-tight max-w-[76px] truncate transition-colors ${
                  isActive ? 'text-white font-bold' : 'text-emerald-100/80 group-hover:text-white'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Logout Action */}
      {logout && (
        <div className="pt-2 border-t border-emerald-900/40 flex flex-col items-center px-1">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) logout();
            }}
            className="group flex flex-col items-center justify-center w-full py-1 text-emerald-200 hover:text-red-300 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-xl group-hover:bg-red-500/20 text-emerald-200 group-hover:text-red-300">
              <LogOut size={17} strokeWidth={2} />
            </div>
            <span className="text-[9.5px] font-semibold text-emerald-200/80 group-hover:text-red-300 mt-0.5">
              Logout
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}
