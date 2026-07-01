const fs = require('fs');

const files = [
  'components/IncentiveView.tsx',
  'recovered_from_sourcemap.tsx',
];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) { console.log('Skipping (not found):', filePath); continue; }
  let code = fs.readFileSync(filePath, 'utf8');
  const traceRegex = /<TraceEngine\s[\s\S]*?\/>/g;
  code = code.replace(traceRegex, `<TraceEngine \n                record={selectedRecord} \n                onClose={() => setSelectedRecord(null)} \n            />`);
  fs.writeFileSync(filePath, code);
  console.log('Patched:', filePath);
}
