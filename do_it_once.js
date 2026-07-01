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

  // Edit 1: Dynamic cols and renderCell logic
  const afterTotalPages = 'const totalPages = Math.ceil(totalCount / PAGE_SIZE);';
  const reqColsLogic = `
  const selectedClientObj = clientOptions.find(c => c.name === filterClient && c.product_type === filterProduct);
  let reqCols = ['Employee Name', 'Designation', 'AM Name', 'TL Name', 'APH', 'PH', 'Collection', 'Vintage'];
  if (selectedClientObj && selectedClientObj.required_columns) {
      try { 
          const parsed = typeof selectedClientObj.required_columns === 'string' ? JSON.parse(selectedClientObj.required_columns) : selectedClientObj.required_columns; 
          if (Array.isArray(parsed) && parsed.length > 0) reqCols = parsed;
      } catch(e) {}
  }
  const gridTemplateCols = \`30px \${reqCols.map(() => '1fr').join(' ')} 80px\`;

  const formatColKey = (col: string) => col.replace(/_/g, ' ');

  const renderCell = (col: string, row: any, vintage: string) => {
    const normalizedCol = (col || '').toLowerCase().replace(/_/g, ' ').trim();
    switch (normalizedCol) {
        case 'employee name':
        case 'employee':
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt)' }}>{row.name || row.employee_name || '—'}</div>
                </div>
            );
        case 'employee code':
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt)' }}>{row.employee_id || row.employee_code || '—'}</div>
                    {row.is_special && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold', width: 'fit-content' }}>SPECIAL</span>}
                </div>
            );
        case 'collection':
        case 'money collected':
            return <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt)' }}>{formatCurrency(row.total_collection || 0)}</div>;
        case 'vintage':
            return <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)' }}>{vintage !== '—' ? \`\${vintage} d\` : '—'}</div>;
        case 'am':
        case 'am name':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.am_name || row.am || '—'}</div>;
        case 'tl':
        case 'tl name':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.tl_name || row.tl || '—'}</div>;
        case 'designation':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.designation || '—'}</div>;
        case 'aph':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.aph || '—'}</div>;
        case 'ph':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.ph || '—'}</div>;
        case 'bucket':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.bucket || '—'}</div>;
        case 'payment mode':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.payment_mode || row.Payment_Mode || '—'}</div>;
        case 'cm':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.cm || row.CM || '—'}</div>;
        case 'account no':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.account_no || row.Account_No || '—'}</div>;
        case 'mobile no':
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.mobile_no || row.MOBILE_NO || '—'}</div>;
        default:
            const val = row[col] || row[col.toLowerCase()] || row[col.toUpperCase()] || row[col.replace(/ /g, '_')];
            return <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{val || '—'}</div>;
    }
  };
`;
  content = content.replace(afterTotalPages, afterTotalPages + reqColsLogic);

  // Edit 2: Table conditional block + The entire table wrapper and header
  const tableHeaderSearch = `{/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px', background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
          {['#', 'Employee', 'Designation', 'AM Name', 'TL Name', 'APH', 'PH', 'Collection', 'Vintage', 'Incentive'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{h}</div>
          ))}
        </div>`;
  const tableHeaderReplace = `{(!filterClient || !filterProduct) ? (
        <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', color: 'var(--txt3)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Please select a Client and Product</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>The grid will automatically load based on your selection.</div>
            </div>
        </div>
      ) : (
      <>
      {/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ minWidth: 1200, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplateCols, background: 'var(--bg-top)', borderBottom: '1px solid var(--bdr)', padding: '6px 10px', gap: 6 }}>
          {['#', ...reqCols, 'Incentive'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: h === 'Incentive' ? 'right' : 'left' }}>{formatColKey(h)}</div>
          ))}
        </div>`;
  content = content.replace(tableHeaderSearch, tableHeaderReplace);

  // Edit 3: Replace old hardcoded rows with new reqCols.map
  const rowSearch = `<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isSelected ? 'var(--acc2)' : 'var(--txt)' }}>{row.name}</div>
                    <div style={{ fontSize: 9, color: 'var(--txt3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {row.employee_id} 
                      {row.is_special && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '4px', fontSize: '8px', fontWeight: 'bold' }}>SPECIAL</span>}
                      &bull; {row.location}
                    </div>
                  </div>

                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.designation || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.am_name || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.tl_name || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.aph || '—'}</div>
                  <div style={{ fontSize: 10, color: 'var(--txt2)' }}>{row.ph || '—'}</div>
                  
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--txt)' }}>{formatCurrency(row.total_collection || 0)}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--txt3)' }}>{vintage !== '—' ? \`\${vintage} d\` : '—'}</div>`;
  const rowReplace = `{reqCols.map((col: string, i: number) => (
                      <React.Fragment key={i}>
                          {renderCell(col, row, vintage)}
                      </React.Fragment>
                  ))}`;
  content = content.replace(rowSearch, rowReplace);

  // Edit 4: Replace gridTemplateColumns inside the row
  const rowGridSearch = `display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1fr 1fr 1fr 1fr 90px 70px 80px',`;
  const rowGridReplace = `display: 'grid', gridTemplateColumns: gridTemplateCols,`;
  content = content.replace(rowGridSearch, rowGridReplace);

  // Edit 5: Close the two wrapper divs right before pagination
  const paginationSearch = `{/* Pagination */}`;
  const paginationReplace = `</div>\n        </div>\n\n        {/* Pagination */}`;
  content = content.replace(paginationSearch, paginationReplace);

  // Edit 6: Close the fragment at the end
  const endSearch = `    </div>\n  );\n}`;
  const endReplace = `      </>\n      )}\n    </div>\n  );\n}`;
  content = content.replace(endSearch, endReplace);

  fs.writeFileSync(file, content);
  console.log("Injected logic perfectly into " + file);
});
