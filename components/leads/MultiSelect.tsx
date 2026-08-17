"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (s: string[]) => void;
}

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) onChange(selected.filter(x => x !== val));
    else onChange([...selected, val]);
  };

  const filteredOptions = options.filter(o => o.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div ref={ref} className="relative min-w-[130px]">
      <div 
        className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 rounded-none cursor-pointer transition-colors shadow-2xs group"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          {selected.length === 0 ? label : `${label} (${selected.length})`}
        </span>
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180 text-blue-600' : ''}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-300 shadow-2xl z-[100] max-h-60 overflow-y-auto w-full min-w-[180px] rounded-none animate-in fade-in duration-100">
          <div className="p-1.5 sticky top-0 bg-white border-b border-slate-200 z-10">
            <input 
              type="text" 
              placeholder={`Search ${label}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-slate-300 bg-slate-50 outline-none focus:border-blue-500 rounded-none"
              onClick={e => e.stopPropagation()}
            />
          </div>
          {filteredOptions.length === 0 ? <div className="px-3 py-2 text-xs text-slate-400 text-center">No options</div> : null}
          <div className="p-1 divide-y divide-slate-50">
            {filteredOptions.map(o => (
              <div key={o} onClick={() => toggle(o)} className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
                <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-none ${selected.includes(o) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                  {selected.includes(o) && <Check size={11} />}
                </div>
                <span className="whitespace-nowrap font-medium">{o}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
