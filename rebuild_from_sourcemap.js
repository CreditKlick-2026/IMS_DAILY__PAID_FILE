const fs = require('fs');

let content = fs.readFileSync('recovered_from_sourcemap.tsx', 'utf8');

// 1. Rename to IncentiveView and add defaultLocation prop
content = content.replace('export default function RecordListPage() {', 'export default function IncentiveView({ defaultLocation }: { defaultLocation?: string }) {');

// 2. Update searchParams logic to use defaultLocation
content = content.replace(
`  useEffect(() => {
    const locParam = searchParams?.get('location');
    if (locParam) {
      setFilterLocation(locParam);
    }
  }, [searchParams]);`,
`  useEffect(() => {
    const locParam = searchParams?.get('location');
    if (locParam) {
      setFilterLocation(locParam);
    } else if (defaultLocation) {
      setFilterLocation(defaultLocation);
    }
  }, [searchParams, defaultLocation]);`
);

// 3. Hide stats when !filterClient || !filterProduct
content = content.replace(
    `{ label: 'Total Employees', val: totalCount, color: 'var(--acc2)', bg: 'rgba(79,125,255,0.06)' },`,
    `{ label: 'Total Employees', val: (!filterClient || !filterProduct) ? '-' : totalCount, color: 'var(--acc2)', bg: 'rgba(79,125,255,0.06)' },`
);
content = content.replace(
    `{ label: 'Active Incentives', val: filteredData.filter(d => d.final_incentive > 0).length, color: '#22c55e', bg: 'rgba(34,197,94,0.06)' },`,
    `{ label: 'Active Incentives', val: (!filterClient || !filterProduct) ? '-' : filteredData.filter(d => d.final_incentive > 0).length, color: '#22c55e', bg: 'rgba(34,197,94,0.06)' },`
);
content = content.replace(
    `{ label: 'Total Collection', val: formatCurrency(totalColl), color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },`,
    `{ label: 'Total Collection', val: (!filterClient || !filterProduct) ? '-' : formatCurrency(totalColl), color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },`
);
content = content.replace(
    `{ label: 'Total Payout', val: formatCurrency(totalIncentives), color: '#10b981', bg: 'rgba(16,185,129,0.06)' },`,
    `{ label: 'Total Payout', val: (!filterClient || !filterProduct) ? '-' : formatCurrency(totalIncentives), color: '#10b981', bg: 'rgba(16,185,129,0.06)' },`
);

// 4. Wrap filters row in !filterClient || !filterProduct
const filtersStartRegex = /\{\/\* Filters Row \*\/\}\s*<div style=\{\{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' \}\}>/;
const filtersStartReplacement = `{/* Filters Row */}\n      {(!filterClient || !filterProduct) ? null : (\n      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>`;

content = content.replace(filtersStartRegex, filtersStartReplacement);

const parts = content.split('{/* Table */}');
if (parts.length >= 2) {
    content = parts[0] + ')}\n\n      {/* Table */}' + parts.slice(1).join('{/* Table */}');
}

// 5. Hide Top header All Locations dropdown if defaultLocation
content = content.replace(
`{user?.role === 'admin' && !searchParams?.get("location") && (
            <select`,
`{user?.role === 'admin' && !searchParams?.get("location") && !defaultLocation && (
            <select`
);

// 6. Hide Location filter column if defaultLocation
content = content.replace(
`<select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedLocation}
          onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
        >`,
`{!defaultLocation && !searchParams?.get("location") && (
        <select
          style={{ background: 'var(--bg2)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: 'var(--txt)', outline: 'none', minWidth: 120 }}
          value={selectedLocation}
          onChange={e => { setSelectedLocation(e.target.value); setPage(1); }}
        >`
);

content = content.replace(
`<option value="">Location</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>`,
`<option value="">Location</option>
          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        )}`
);

fs.writeFileSync('components/IncentiveView.tsx', content);
console.log("Rebuilt IncentiveView successfully!");
