const fs = require('fs');
const file = 'app/dashboard/incentive-dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add PremiumSelect import
content = content.replace(
  /import \* as XLSX from 'xlsx';/,
  "import * as XLSX from 'xlsx';\nimport { PremiumSelect } from '@/components/PremiumSelect';"
);

// 2. Add relative z-10 to filter container 
// From: <div className="flex flex-wrap items-center gap-3">
// To: <div className="relative z-10 flex flex-wrap items-center gap-3">
content = content.replace(
  /<div className="flex flex-wrap items-center gap-3">/,
  '<div className="relative z-10 flex flex-wrap items-center gap-3">'
);

// 3. Replace Location select
const oldLocSelect = `{user?.role === 'admin' && (
            <select
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
              value={filterLocation}
              onChange={e => { setFilterLocation(e.target.value); setFilterClient(''); }}
            >
              <option value="">All Locations</option>
              {locationOptions.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
            </select>
          )}`;

const newLocSelect = `{user?.role === 'admin' && (
            <PremiumSelect
              placeholder="All Locations"
              value={filterLocation}
              onChange={val => { setFilterLocation(val); setFilterClient(''); }}
              options={locationOptions.map(loc => ({ label: loc.name, value: loc.name }))}
            />
          )}`;

content = content.replace(oldLocSelect, newLocSelect);

// 4. Replace Process select
const oldProcessSelect = `<select
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
          >
            <option value="">All Processes</option>
            {clientOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>`;

const newProcessSelect = `<PremiumSelect
            placeholder="All Processes"
            value={filterClient}
            onChange={val => setFilterClient(val)}
            options={clientOptions.map(p => ({ label: p.name, value: p.id }))}
          />`;

content = content.replace(oldProcessSelect, newProcessSelect);

// 5. Replace Month select
const oldMonthSelect = `<select
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>`;

const newMonthSelect = `<PremiumSelect
            placeholder="All Months"
            value={filterMonth}
            onChange={val => setFilterMonth(val)}
            options={Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
              label: new Date(2000, m - 1).toLocaleString('default', { month: 'long' }),
              value: m.toString()
            }))}
          />`;

content = content.replace(oldMonthSelect, newMonthSelect);

// 6. Replace Year select
const oldYearSelect = `<select
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>`;

const newYearSelect = `<PremiumSelect
            placeholder="All Years"
            value={filterYear}
            onChange={val => setFilterYear(val)}
            options={[2024, 2025, 2026, 2027, 2028].map(y => ({ label: y.toString(), value: y.toString() }))}
          />`;

content = content.replace(oldYearSelect, newYearSelect);

fs.writeFileSync(file, content);
console.log('PremiumSelect applied to incentive-dashboard');
