"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import SButton from '../SButton';
import { ButtonGroup, Button } from '@shopify/polaris';
import { DISPOSITION_LOGIC, CONNECT_STATUS_COLORS, PAGE_SIZE } from './constants';

const MultiSelect = ({ label, options, selected, onChange }: { label: string, options: string[], selected: string[], onChange: (s: string[]) => void }) => {
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
    <div ref={ref} style={{ position: 'relative', width: 'auto' }}>
      <div 
        className="finp" 
        style={{ fontSize: 12, padding: '6px 10px', minWidth: 120, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2, #ffffff)', border: '1px solid var(--bdr)', borderRadius: 4 }}
        onClick={() => setOpen(!open)}
      >
        <span>{selected.length === 0 ? label : `${label} (${selected.length})`}</span>
        <span style={{ fontSize: 10 }}>▼</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--bg2, #ffffff)', border: '1px solid var(--bdr)', borderRadius: 6, zIndex: 100, maxHeight: 250, overflowY: 'auto', minWidth: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '6px', position: 'sticky', top: 0, background: 'var(--bg2, #ffffff)', borderBottom: '1px solid var(--bdr)', zIndex: 2 }}>
            <input 
              type="text" 
              placeholder={`Search ${label}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '6px', fontSize: 11, border: '1px solid var(--bdr)', borderRadius: 4, outline: 'none' }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          {filteredOptions.length === 0 ? <div style={{ padding: '6px 10px', fontSize: 11, color: 'var(--txt3)' }}>No options</div> : null}
          {filteredOptions.map(o => (
            <div key={o} onClick={() => toggle(o)} style={{ padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderBottom: '1px solid var(--faint)' }}>
              <input type="checkbox" checked={selected.includes(o)} readOnly style={{ cursor: 'pointer' }} />
              <span style={{ whiteSpace: 'nowrap' }}>{o}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Payment History Modal ─────────────────────────────────────────────────
export default MultiSelect;
