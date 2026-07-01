const fs = require('fs');

try {
  let rawContent = fs.readFileSync('recover_view_raw.json', 'utf8');
  
  const marker1 = 'remove the line number, colon, and leading space.\\n';
  const marker2 = 'remove the line number, colon, and leading space.\n';
  
  let startIndex = rawContent.indexOf(marker1);
  if (startIndex !== -1) {
    startIndex += marker1.length;
  } else {
    startIndex = rawContent.indexOf(marker2);
    if (startIndex !== -1) startIndex += marker2.length;
  }
  
  if (startIndex === -1) {
    console.log("Could not find marker");
    console.log(rawContent.substring(0, 1000));
    process.exit(1);
  }
  
  let endMarker1 = '\\nThe above content';
  let endMarker2 = '\nThe above content';
  
  let endIndex = rawContent.indexOf(endMarker1, startIndex);
  if (endIndex === -1) endIndex = rawContent.indexOf(endMarker2, startIndex);
  if (endIndex === -1) {
    endIndex = rawContent.lastIndexOf('"');
  }
  
  let codeBlock = rawContent.substring(startIndex, endIndex);
  
  codeBlock = codeBlock.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  
  let cleanCode = codeBlock.split('\n').map(line => {
    return line.replace(/^\d+:\s/, '');
  }).join('\n');
  
  fs.writeFileSync('components/IncentiveView.tsx', cleanCode);
  console.log("Recovered components/IncentiveView.tsx successfully!");
  
} catch (e) {
  console.error(e);
}
