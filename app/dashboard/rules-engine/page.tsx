import React from 'react';
import { MapPin, Briefcase, Settings, Grid3X3, AlertTriangle, Database, FileSpreadsheet, Users } from 'lucide-react';

export default function RulesEnginePage() {
  const cards = [
    { title: 'Locations', desc: 'Geographical sites', path: '/dashboard/rules-engine/locations', icon: MapPin, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Clients', desc: 'Client portfolios', path: '/dashboard/rules-engine/clients', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Processes', desc: 'Mapped processes', path: '/dashboard/rules-engine/processes', icon: Settings, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Master Grid Builder', desc: 'Dynamic incentive matrix', path: '/dashboard/rules-engine/plans', icon: Grid3X3, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
    { title: 'Users & Access', desc: 'Manage access control', path: '/dashboard/rules-engine/users', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Special Exceptions', desc: 'Exception toggles', path: '/dashboard/rules-engine/special-exceptions', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Rules Engine</h1>
        <p className="text-slate-500 mt-2">Manage Locations, Clients, Processes, and Master Incentive Grids dynamically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <a 
              key={index} 
              href={card.path}
              className="group block p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-slate-300 relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg} ${card.color}`}>
                <Icon size={24} strokeWidth={2} />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{card.title}</h2>
              <p className="text-sm text-slate-500">{card.desc}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
