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
  options, 
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

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 ${label ? 'min-w-[200px]' : 'min-w-[140px]'}`} ref={dropdownRef}>
      {label && (
        <span className={`text-[10px] font-bold uppercase tracking-widest pl-2 ${isAdminProxy ? 'text-primary' : 'text-slate-400'}`}>
          {label}
        </span>
      )}
      <div className="relative w-full">
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer border ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200' :
            isAdminProxy ? 'bg-primary/5 border-primary/20 text-primary hover:border-primary/40' : 
            'bg-slate-50 border-slate-200/60 text-slate-700 hover:border-primary/30 hover:bg-white'
          } ${isOpen ? 'ring-2 ring-primary/30 border-primary/50 bg-white' : ''}`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isAdminProxy ? 'text-primary' : 'text-slate-400'}`} />
        </div>
        
        {isOpen && (
          <div className="absolute z-[100] top-full mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1 max-h-[300px] overflow-y-auto no-scrollbar">
            <div 
              className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-50 ${value === '' ? 'bg-primary/5 text-primary' : 'text-slate-500'}`}
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </div>
            {options.map((opt, i) => (
              <div 
                key={i}
                className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-50 ${String(value) === String(opt.value) ? 'bg-primary/5 text-primary font-bold' : 'text-slate-700'}`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
