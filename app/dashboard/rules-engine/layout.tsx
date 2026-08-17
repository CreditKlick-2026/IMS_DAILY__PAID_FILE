"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, MapPin, Briefcase, AlertTriangle, Grid3X3, Sliders } from 'lucide-react';

export default function RulesEngineLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', sublabel: 'Analytics & Health', path: '/dashboard/rules-engine', icon: Activity },
    { label: 'Locations', sublabel: 'Delhi, Pune, Gurugram', path: '/dashboard/rules-engine/locations', icon: MapPin },
    { label: 'Clients', sublabel: 'Process & Portfolios', path: '/dashboard/rules-engine/clients', icon: Briefcase },
    { label: 'Master Grid 1', sublabel: 'Live Operations Cockpit', path: '/dashboard/rules-engine/master-grids', icon: Grid3X3 },
    { label: 'Master Grid 2', sublabel: 'Multi-Tier Slabs', path: '/dashboard/rules-engine/master-grids-2', icon: Grid3X3 },
    { label: 'Master Grid 3', sublabel: 'Custom Operations', path: '/dashboard/rules-engine/master-grids-3', icon: Grid3X3 },
    { label: 'Master Grid 4', sublabel: 'Collections Matrix', path: '/dashboard/rules-engine/master-grids-4', icon: Grid3X3 },
    { label: 'Master Grid 5', sublabel: 'Incentive Slabs', path: '/dashboard/rules-engine/master-grids-5', icon: Grid3X3 },
    { label: 'Master Grid 6', sublabel: 'Leadership Rules', path: '/dashboard/rules-engine/master-grids-6', icon: Grid3X3 },
    { label: 'Master Grid 7', sublabel: 'Special Tiers', path: '/dashboard/rules-engine/master-grids-7', icon: Grid3X3 },
    { label: 'Master Grid 8', sublabel: 'Enterprise Rules', path: '/dashboard/rules-engine/master-grids-8', icon: Grid3X3 },
    { label: 'Special Exceptions', sublabel: 'High Collection Cases', path: '/dashboard/rules-engine/special-exceptions', icon: AlertTriangle },
  ];

  return (
    <div className="flex h-full min-h-[calc(100vh-60px)]">
      <div className="w-48 border-r border-slate-200 bg-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-2.5 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-blue-600" />
            <h2 className="font-bold text-xs text-slate-900 leading-tight">Rules Engine</h2>
          </div>
          <p className="text-[9.5px] text-slate-500 mt-0.5">Configuration & Grids</p>
        </div>
        <div className="p-1 flex-1 overflow-y-auto space-y-0.5 hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-2 py-1 transition-all text-left whitespace-nowrap border ${
                  isActive 
                    ? 'bg-blue-50/70 border-blue-400 shadow-2xs font-bold' 
                    : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300 font-medium'
                }`}
              >
                <div
                  className={`p-1 shrink-0 flex items-center justify-center transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-[11px] tracking-tight ${isActive ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                    {item.label}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate">{item.sublabel}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/40">
        {children}
      </div>
    </div>
  );
}
