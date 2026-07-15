const fs = require('fs');
const file = 'app/dashboard/keka-master/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(
  /import \{ Edit, Trash2, X, Save, Download, Search, Database, Users, MapPin, Briefcase \} from 'lucide-react';/,
  "import { Edit, Trash2, X, Save, Download, Search, Database, Users, MapPin, Briefcase } from 'lucide-react';\nimport { PremiumSelect } from '@/components/PremiumSelect';"
);

// 2. Replace Designation Select block
const oldDesigSelect = `<div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                className="appearance-none bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all min-w-[140px] cursor-pointer"
                value={selectedDesig}
                onChange={e => {
                  setSelectedDesig(e.target.value);
                  setSelectedAM(""); setSelectedTL("");
                  setPage(1);
                }}
              >
                <option value="">All Designations</option>
                {uniqueDesigs.map(x => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>`;

const newDesigSelect = `<PremiumSelect
              placeholder="All Designations"
              value={selectedDesig}
              onChange={val => {
                setSelectedDesig(val);
                setSelectedAM(""); setSelectedTL("");
                setPage(1);
              }}
              options={uniqueDesigs.map(x => ({ label: x, value: x }))}
            />`;

// 3. Replace Location Select block
const oldLocSelect = `<div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                className="appearance-none bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm transition-all min-w-[140px] cursor-pointer"
                value={selectedLocation}
                onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>`;

const newLocSelect = `<PremiumSelect
              placeholder="All Locations"
              value={selectedLocation}
              onChange={val => { setSelectedLocation(val); setPage(1); }}
              options={uniqueLocations.map(loc => ({ label: loc, value: loc }))}
            />`;

content = content.replace(oldDesigSelect, newDesigSelect);
content = content.replace(oldLocSelect, newLocSelect);

fs.writeFileSync(file, content);
console.log('PremiumSelect applied to keka-master');
