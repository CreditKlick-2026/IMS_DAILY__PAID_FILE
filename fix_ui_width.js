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

  // Fix Table Horizontal Scroll
  const oldTableStart = `<div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Table Header */}`;
        
  const newTableStart = `<div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ minWidth: 1000, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}`;

  if (content.includes(oldTableStart)) {
    content = content.replace(oldTableStart, newTableStart);
    
    // Now close the two divs before {/* Pagination */}
    const oldPaginationStart = `{/* Pagination */}`;
    const newPaginationStart = `  </div>
        </div>
        {/* Pagination */}`;
    content = content.replace(oldPaginationStart, newPaginationStart);
  }

  // Also fix the case where employee_code / money_collected are STILL returning dash
  // It's possible that row[col] in the default case isn't picking up missing names properly.
  // We'll update renderCell just to be absolutely foolproof.
  const renderCellStart = 'const renderCell = (col: string, row: any, vintage: string) => {';
  const renderCellEnd = '  const gridTemplateCols =';
  
  if (content.includes(renderCellStart)) {
      const beforeRenderCell = content.substring(0, content.indexOf(renderCellStart));
      const afterRenderCell = content.substring(content.indexOf(renderCellEnd));
      
      const newRenderCell = `const renderCell = (col: string, row: any, vintage: string) => {
    const normalizedCol = (col || '').toLowerCase().trim();
    switch (normalizedCol) {
        case 'employee_name':
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt)' }}>{row.name || row.employee_name || '—'}</div>
                </div>
            );
        case 'employee_code':
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt)' }}>{row.employee_id || row.employee_code || '—'}</div>
                    {row.is_special && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold', width: 'fit-content' }}>SPECIAL</span>}
                </div>
            );
        case 'collection':
        case 'money_collected':
            return <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt)' }}>{formatCurrency(row.total_collection || 0)}</div>;
        case 'vintage':
            return <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)' }}>{vintage !== '—' ? \`\${vintage} d\` : '—'}</div>;
        case 'am':
        case 'am_name':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.am_name || row.am || '—'}</div>;
        case 'tl':
        case 'tl_name':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.tl_name || row.tl || '—'}</div>;
        case 'designation':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.designation || '—'}</div>;
        case 'aph':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.aph || '—'}</div>;
        case 'ph':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.ph || '—'}</div>;
        case 'bucket':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.bucket || '—'}</div>;
        case 'payment_mode':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.payment_mode || row.Payment_Mode || '—'}</div>;
        case 'cm':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.cm || row.CM || '—'}</div>;
        case 'account_no':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.account_no || row.Account_No || '—'}</div>;
        case 'mobile_no':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.mobile_no || row.MOBILE_NO || '—'}</div>;
        default:
            const val = row[col] || row[col.toLowerCase()] || row[col.toUpperCase()];
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{val || '—'}</div>;
    }
  };

`;
      content = beforeRenderCell + newRenderCell + afterRenderCell;
  }

  fs.writeFileSync(file, content);
  console.log('Fixed UI in ' + file);
});
