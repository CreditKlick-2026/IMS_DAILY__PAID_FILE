"use client";
import React from 'react';
import { Activity, Users, FileSpreadsheet, UserPlus, FileText, Columns, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface AdminSidebarProps {
  activeItem: string;
  setActiveItem: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (b: boolean) => void;
}

export const ADMIN_MODULES = [
  { id: 'tracker', title: 'Daily Tracker', subtitle: 'Compliance matrix', icon: <Activity size={16} /> },
  { id: 'users', title: 'User Management', subtitle: 'Roles & access', icon: <Users size={16} /> },
  { id: 'excels', title: 'Uploaded Excels', subtitle: 'Collection files', icon: <FileSpreadsheet size={16} /> },
  { id: 'keka', title: 'Keka Upload', subtitle: 'Unified HR master', icon: <UserPlus size={16} /> },
  { id: 'keka-columns', title: 'Keka Columns', subtitle: 'HR schema rules', icon: <Columns size={16} /> },
  { id: 'keka-excels', title: 'Keka Excels', subtitle: 'HR upload logs', icon: <FileText size={16} /> },
];

export function AdminSidebar({
  activeItem,
  setActiveItem,
  isOpen,
  setIsOpen
}: AdminSidebarProps) {
  return (
    <div className={`${isOpen ? 'w-52' : 'w-16'} flex-shrink-0 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 select-none shadow-2xs`}>
      <div className={`p-3.5 border-b border-slate-200 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Admin Control</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer"
        >
          {isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </div>

      <div className="p-2 space-y-1 overflow-y-auto flex-1">
        {ADMIN_MODULES.map((mod) => {
          const isActive = activeItem === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveItem(mod.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold transition-colors cursor-pointer rounded-none text-left ${
                isActive
                  ? 'bg-[#024e4d] text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title={mod.title}
            >
              <div className={`shrink-0 ${isActive ? 'text-white' : 'text-[#024e4d]'}`}>
                {mod.icon}
              </div>
              {isOpen && <span className="truncate">{mod.title}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
