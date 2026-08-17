"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, LayoutDashboard, FileSpreadsheet, Database, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GlobalSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const QUICK_LINKS = [
    { title: 'Operations Dashboard', path: '/dashboard', icon: LayoutDashboard, tag: 'Analytics' },
    { title: 'Live DPF Records', path: '/dashboard/live-records', icon: FileSpreadsheet, tag: 'Accounts' },
    { title: 'Upload Daily File', path: '/dashboard/upload', icon: Zap, tag: 'Ingestion' },
    { title: 'Rules & Matrices', path: '/dashboard/rules-engine', icon: Database, tag: 'Formulas' },
    { title: 'Admin Console', path: '/dashboard/admin', icon: Shield, tag: 'Control' },
  ];

  const filteredLinks = QUICK_LINKS.filter(l =>
    l.title.toLowerCase().includes(query.toLowerCase()) || l.tag.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative hidden md:block" ref={searchRef}>
      {/* Search Input Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-500 rounded-none w-56 lg:w-72 transition-colors cursor-pointer justify-between"
      >
        <div className="flex items-center gap-2">
          <Search size={13} className="text-slate-400" />
          <span className="truncate">Search records, pages...</span>
        </div>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-white border border-slate-300 text-slate-500 shadow-2xs">
          Ctrl K
        </kbd>
      </button>

      {/* Quick Search Modal / Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-50" onClick={() => setIsOpen(false)} />
          <div className="absolute top-0 left-0 w-80 lg:w-96 bg-white border border-slate-300 shadow-2xl z-50 rounded-none animate-in fade-in duration-150">
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-200 bg-slate-50">
              <Search size={14} className="text-[#024e4d]" />
              <input
                autoFocus
                type="text"
                placeholder="Jump to account, file, or module..."
                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="text-[9px] font-mono text-slate-400 bg-white border border-slate-200 px-1 py-0.5">
                ESC
              </kbd>
            </div>

            <div className="max-h-64 overflow-y-auto p-1 text-xs">
              <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              {filteredLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 bg-teal-50 text-[#024e4d] group-hover:bg-[#024e4d] group-hover:text-white transition-colors">
                        <Icon size={13} />
                      </div>
                      <span className="font-semibold text-xs">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 text-slate-500">{item.tag}</span>
                      <ArrowRight size={11} className="text-slate-300 group-hover:text-slate-700 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
