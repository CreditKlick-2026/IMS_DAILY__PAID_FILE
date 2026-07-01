const fs = require('fs');

const files = [
  'app/dashboard/incentive/gurugram/page.tsx',
  'app/dashboard/incentive/uttam-nagar/page.tsx',
  'app/dashboard/incentive/delhi/page.tsx',
  'app/dashboard/incentive/pune/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix header and add wrappers
  // The header looks like:
  //      {/* Table */}
  //      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
  //        {/* Table Header */}
  //        <div style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px', background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
  //          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4 }}>#</div>
  //          ...
  //          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'right' }}>Incentive</div>
  //        </div>

  const headerRegex = /\{\/\* Table \*\/\}[\s\S]*?<div style={{ display: 'grid', gridTemplateColumns: '.*?<\/div>[\s\S]*?<\/div>/;

  const newHeaders = `{/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ minWidth: 1000, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplateCols, background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
          {['#', ...reqCols, 'Incentive'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h.replace(/_/g, ' ')}</div>
          ))}
        </div>`;

  if (!content.includes('minWidth: 1000')) {
      content = content.replace(headerRegex, newHeaders);
  }

  // Fix rows
  // The row looks like:
  //                  onClick={() => setSelectedRecord(row)}
  //                  style={{
  //                    display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px',
  const gridTemplateRegex = /display: 'grid', gridTemplateColumns: '.*?'/g;
  content = content.replace(gridTemplateRegex, "display: 'grid', gridTemplateColumns: gridTemplateCols");

  // If there are duplicate extra </div> before pagination, make sure there are exactly TWO extra ones.
  // Wait, if it ALREADY has </div>\n</div>\n{/* Pagination */}, and I just added the wrappers above, it's correct now!
  // BUT what if the row logic wasn't replaced either?
  // Let's replace the hardcoded row logic if it's there!
  const rowRegex = /<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>[\s\S]*?<div style={{ fontSize: 9, fontWeight: 700, color: 'var\(--txt3\)' }}>{vintage !== '—' \? \`\${vintage} d\` : '—'}<\/div>/;
  
  const newRowLogic = `{reqCols.map((col: string, i: number) => (
                      <React.Fragment key={i}>
                          {renderCell(col, row, vintage)}
                      </React.Fragment>
                  ))}`;

  if (content.includes("row.is_special && <span style={{ background:")) {
      content = content.replace(rowRegex, newRowLogic);
  }

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
});
