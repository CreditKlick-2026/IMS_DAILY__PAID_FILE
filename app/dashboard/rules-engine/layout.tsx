"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, MapPin, Briefcase, Settings, Database, FileSpreadsheet, AlertTriangle, Grid3X3 } from 'lucide-react';

export default function RulesEngineLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', path: '/dashboard/rules-engine', icon: Activity },
    { label: 'Locations', path: '/dashboard/rules-engine/locations', icon: MapPin },
    { label: 'Clients', path: '/dashboard/rules-engine/clients', icon: Briefcase },
    { label: 'Master Grid 1', path: '/dashboard/rules-engine/master-grids', icon: Grid3X3 },
    { label: 'Master Grid 2', path: '/dashboard/rules-engine/master-grids-2', icon: Grid3X3 },
    { label: 'Special Exceptions', path: '/dashboard/rules-engine/special-exceptions', icon: AlertTriangle },
  ];

  return (
    <div className="flex h-full min-h-[calc(100vh-60px)]">
      {/* Secondary Sidebar */}
      <div className="w-64 border-r border-slate-200 bg-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-bold text-lg text-slate-800">Rules Engine</h2>
          <p className="text-xs text-slate-500 mt-1">Configuration Menu</p>
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        {children}
      </div>
    </div>
  );
}
