"use client";
import React from 'react';
import { Users, UserCheck, Award } from 'lucide-react';

interface Grid5TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'associate', label: 'Associate Slabs (Upgrade & Recovery)', icon: Users },
  { id: 'tl', label: 'Team Leader (TL) Slabs', icon: UserCheck },
  { id: 'am', label: 'Assistant Manager (AM) Slabs', icon: Award },
];

export function Grid5Tabs({ activeTab, onTabChange }: Grid5TabsProps) {
  return (
    <div className="bg-white p-1.5 border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto select-none rounded-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2.5 px-3.5 py-2 text-xs transition-all whitespace-nowrap cursor-pointer flex-1 min-w-[200px] border rounded-none ${
              isActive
                ? 'bg-blue-50/80 border-blue-400 text-blue-950 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
            }`}
          >
            <div
              className={`p-1.5 shrink-0 flex items-center justify-center rounded-none ${
                isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Icon size={14} />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
