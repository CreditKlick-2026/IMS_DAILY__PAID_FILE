"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface PremiumSelectProps {
  label?: string;
  options: { label: string; value: string | number }[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder: string;
  disabled?: boolean;
  isAdminProxy?: boolean;
}

export const PremiumSelect: React.FC<PremiumSelectProps> = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  disabled = false, 
  isAdminProxy = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => String(o.value) === String(value));
  const hasEmptyOption = options.some(o => o.value === '' || o.value === 'All');

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 flex-1 ${label ? 'min-w-[180px]' : 'min-w-[140px]'}`} ref={dropdownRef}>
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          {label}
        </span>
      )}
      <div className="relative w-full">
        <button 
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer border rounded-none ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400' :
            isOpen ? 'border-[#024e4d] bg-white text-slate-900 ring-1 ring-[#024e4d]' :
            'bg-slate-50 hover:bg-white border-slate-300 text-slate-700'
          }`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 text-slate-400 ${isOpen ? 'rotate-180 text-[#024e4d]' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-1 w-full min-w-[160px] bg-white border border-slate-300 shadow-2xl rounded-none animate-in fade-in duration-100 py-1 max-h-60 overflow-y-auto">
            {!hasEmptyOption && (
              <div 
                className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-teal-50 ${value === '' ? 'bg-teal-50 text-[#024e4d] font-bold' : 'text-slate-600'}`}
                onClick={() => { onChange(''); setIsOpen(false); }}
              >
                {placeholder}
              </div>
            )}
            {options.map((opt, i) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <div 
                  key={i}
                  className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-teal-50 ${isSelected ? 'bg-teal-50 text-[#024e4d] font-bold border-l-2 border-l-[#024e4d]' : 'text-slate-700'}`}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
