const fs = require('fs');

const pages = [
  'app/dashboard/incentive/gurugram/page.tsx',
  'app/dashboard/incentive/uttam-nagar/page.tsx',
  'app/dashboard/incentive/delhi/page.tsx',
  'app/dashboard/incentive/pune/page.tsx',
];

for (const filePath of pages) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace the multi-prop TraceEngine call with a clean 2-prop version
  // We use a regex that matches from <TraceEngine to the closing />
  const traceRegex = /<TraceEngine\s[\s\S]*?\/>/g;
  
  code = code.replace(traceRegex, `<TraceEngine \n                record={selectedRecord} \n                onClose={() => setSelectedRecord(null)} \n            />`);

  fs.writeFileSync(filePath, code);
  console.log('Patched:', filePath);
}
