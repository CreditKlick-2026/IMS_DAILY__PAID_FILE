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

  // 1. Inject reqCols parsing logic after totalPages
  const insertColsAfter = 'const totalPages = Math.ceil(totalCount / PAGE_SIZE);';
  const reqColsLogic = `
  const selectedClientObj = clientOptions.find(c => c.name === filterClient && c.product_type === filterProduct);
  let reqCols = ['Employee_Name', 'Designation', 'AM_Name', 'TL_Name', 'APH', 'PH', 'Collection', 'Vintage'];
  if (selectedClientObj && selectedClientObj.required_columns) {
      try { 
          const parsed = typeof selectedClientObj.required_columns === 'string' ? JSON.parse(selectedClientObj.required_columns) : selectedClientObj.required_columns; 
          if (Array.isArray(parsed) && parsed.length > 0) reqCols = parsed;
      } catch(e) {}
  }
  const gridTemplateCols = \`30px \${reqCols.map(() => '1fr').join(' ')} 80px\`;

  const renderCell = (col: string, row: any, vintage: string) => {
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

  // Prevent double injection
  if (!content.includes('let reqCols = [')) {
    content = content.replace(insertColsAfter, insertColsAfter + reqColsLogic);
  }

  // 2. Replace hardcoded table wrapper and headers
  const hardcodedHeaderRegex = /\{\/\* Table \*\/\}[\s\S]*?<div style={{ display: 'grid', gridTemplateColumns: 'repeat\(11, 1fr\)',.*?<\/div>/;
  
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
  
  content = content.replace(hardcodedHeaderRegex, newHeaders);

  // 3. Replace hardcoded rows
  const hardcodedRowRegex = /<div style={{ fontSize: 10, color: 'var\(--txt2\)' }}>{row\.designation \|\| '—'}<\/div>[\s\S]*?<div style={{ fontSize: 9, fontWeight: 700, color: 'var\(--txt3\)' }}>{vintage !== '—' \? \`\${vintage} d\` : '—'}<\/div>/;

  const newRows = `{reqCols.map((col: string, i: number) => (
                      <React.Fragment key={i}>
                          {renderCell(col, row, vintage)}
                      </React.Fragment>
                  ))}`;
  
  if (content.includes('gridTemplateColumns: \'repeat(11, 1fr)\'')) {
      content = content.replace(/gridTemplateColumns: 'repeat\(11, 1fr\)'/g, 'gridTemplateColumns: gridTemplateCols');
  }

  content = content.replace(hardcodedRowRegex, newRows);

  // 4. Close the new scroll wrappers at pagination
  const paginationRegex = /\{\/\* Pagination \*\/\}/;
      content = content.replace(paginationRegex, "</div>\\n        </div>\\n\\n        {/* Pagination */}");

  // 5. Hide table until client/product is selected
  // The structure is {loading ? ... : !paginatedData.length ? ... : paginatedData.map}
  // I need to wrap the whole {/* Table */} inside a condition.
  // We'll replace the JSX element.
  const emptyConditionRegex = /\{\/\* Table \*\/\}/;
  if (!content.includes('(!filterClient || !filterProduct) ? (')) {
      content = content.replace(emptyConditionRegex, 
      \`{(!filterClient || !filterProduct) ? (
        <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', color: 'var(--txt3)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Please select a Client and Product</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>The grid will automatically load based on your selection.</div>
            </div>
        </div>
      ) : (
      <>
      {/* Table */}\`);

      // Close the condition at the end of the file
      content = content.replace('    </div>\\n  );\\n}', '      </>\\n      )}\\n    </div>\\n  );\\n}');
  }

  fs.writeFileSync(file, content);
  console.log('Restored dynamic columns in ' + file);
});
