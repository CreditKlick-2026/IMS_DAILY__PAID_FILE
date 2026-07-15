import React from 'react';
import { MapPin, Briefcase, Settings, Grid3X3, AlertTriangle, Database, FileSpreadsheet, Users } from 'lucide-react';

export default function RulesEnginePage() {
  const cards = [
    { title: 'Locations', desc: 'Geographical sites', path: '/dashboard/rules-engine/locations', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Clients', desc: 'Client portfolios', path: '/dashboard/rules-engine/clients', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Users & Access', desc: 'Manage access control', path: '/dashboard/rules-engine/users', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Keka Columns', desc: 'Configure column mappings', path: '/dashboard/rules-engine/keka-columns', icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Master Grid 1', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Master Grid 2', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids-2', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Master Grid 3', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids-3', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Master Grid 4', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids-4', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Master Grid 5', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids-5', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Master Grid 6', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids-6', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Master Grid 7', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids-7', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Master Grid 8', desc: 'Manage dynamic matrices', path: '/dashboard/rules-engine/master-grids-8', icon: Grid3X3, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Special Exceptions', desc: 'Exception toggles', path: '/dashboard/rules-engine/special-exceptions', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Rules Engine</h1>
        <p className="text-slate-500 mt-2">Manage Locations and Clients dynamically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <a 
              key={index} 
              href={card.path}
              className="group block p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-slate-300 relative overflow-hidden"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.bg} ${card.color}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-0.5 group-hover:text-blue-600 transition-colors">{card.title}</h2>
              <p className="text-xs text-slate-500">{card.desc}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
