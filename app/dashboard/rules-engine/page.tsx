import React from 'react';
import Link from 'next/link';
import { 
  MapPin, Briefcase, Grid3X3, AlertTriangle, 
  Users, Sliders, ShieldCheck 
} from 'lucide-react';

export default function RulesEnginePage() {
  const cards = [
    { title: 'Locations', desc: 'Geographical sites & operational centers', path: '/dashboard/rules-engine/locations', icon: MapPin },
    { title: 'Clients', desc: 'Client portfolios & bank processes', path: '/dashboard/rules-engine/clients', icon: Briefcase },
    { title: 'Users & Access', desc: 'Manage role-based access control', path: '/dashboard/rules-engine/users', icon: Users },
    { title: 'Master Grid 1', desc: 'Live operations & incentive workstation', path: '/dashboard/rules-engine/master-grids', icon: Grid3X3, isLive: true },
    { title: 'Master Grid 2', desc: 'Multi-tier slabs & collection matrices', path: '/dashboard/rules-engine/master-grids-2', icon: Grid3X3 },
    { title: 'Master Grid 3', desc: 'Custom operations & targets matrix', path: '/dashboard/rules-engine/master-grids-3', icon: Grid3X3 },
    { title: 'Master Grid 4', desc: 'Process-specific collections matrix', path: '/dashboard/rules-engine/master-grids-4', icon: Grid3X3 },
    { title: 'Master Grid 5', desc: 'Incentive slabs & tenure tiers', path: '/dashboard/rules-engine/master-grids-5', icon: Grid3X3 },
    { title: 'Master Grid 6', desc: 'Leadership & management rules', path: '/dashboard/rules-engine/master-grids-6', icon: Grid3X3 },
    { title: 'Master Grid 7', desc: 'Specialized collection tiers', path: '/dashboard/rules-engine/master-grids-7', icon: Grid3X3 },
    { title: 'Master Grid 8', desc: 'Enterprise rule specifications', path: '/dashboard/rules-engine/master-grids-8', icon: Grid3X3 },
    { title: 'Special Exceptions', desc: 'High collection overrides & exception cases', path: '/dashboard/rules-engine/special-exceptions', icon: AlertTriangle },
  ];

  return (
    <div className="p-4 md:p-6 w-full space-y-6">
      {/* Cockpit Overview Header */}
      <div className="bg-white p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-none">
        <div>
          <div className="flex items-center gap-3">
            <Sliders className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Rules Engine Overview</h1>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-mono font-bold px-2 py-0.5 border border-blue-200 rounded-none flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> {cards.length} Modules Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise rule matrices, operational locations, client portfolios, and database configurations.
          </p>
        </div>
      </div>

      {/* Grid Modules Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link 
              key={index} 
              href={card.path}
              className="group p-3.5 bg-white border border-slate-200 shadow-2xs hover:border-blue-400 hover:bg-blue-50/30 transition-all flex items-start gap-3 rounded-none relative"
            >
              <div className="p-2.5 bg-slate-100 border border-slate-200 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shrink-0 rounded-none">
                <Icon size={18} />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h2 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors tracking-tight">
                    {card.title}
                  </h2>
                  {card.isLive && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      Live
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {card.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
