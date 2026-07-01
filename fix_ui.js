const fs = require('fs');
const pages = [
  'app/dashboard/incentive/gurugram/page.tsx',
  'app/dashboard/incentive/uttam-nagar/page.tsx',
  'app/dashboard/incentive/delhi/page.tsx',
  'app/dashboard/incentive/pune/page.tsx'
];

let gurugramContent = fs.readFileSync('app/dashboard/incentive/gurugram/page.tsx', 'utf8');

// Copy gurugram to uttam-nagar
let uttamContent = gurugramContent.replace(/'Gurugram'/g, "'Uttam Nagar'").replace(/Gurugram/g, 'Uttam Nagar');
fs.writeFileSync('app/dashboard/incentive/uttam-nagar/page.tsx', uttamContent);

// Fix UI horizontal scroll in all pages
pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix table start
  content = content.replace(/{[\s\S]*?\/\* Table \*\/[\s\S]*?<div style={{ border: '1px solid var\(--bdr\)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>\s*{\/\* Table Header \*\/}/,
    `      {/* Table */}
      <div style={{ border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ overflowX: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ minWidth: 1000, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Table Header */}`);

  // Fix pagination close tags
  content = content.replace(/\s*{\/\* Pagination \*\/}/,
    `
          </div>
        </div>
        {/* Pagination */}`);

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
});
