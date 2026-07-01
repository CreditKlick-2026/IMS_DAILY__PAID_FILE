const fs = require('fs');

try {
  let rawJson = fs.readFileSync('recover_view_raw.json', 'utf8');
  
  const obj = JSON.parse(rawJson);
  
  const rawContent = obj.content || obj.output || obj.text || (obj.tool_calls && obj.tool_calls[0] && obj.tool_calls[0].args && obj.tool_calls[0].args.content) || rawJson;
  
  let linesArray = [];
  if (typeof rawContent === 'string') {
    linesArray = rawContent.split('\n');
  } else {
    // If it's something else, just regex the raw JSON
    linesArray = rawJson.split('\\n');
  }
  
  let startIdx = linesArray.findIndex(l => l.includes('remove the line number, colon, and leading space.'));
  if (startIdx !== -1) {
    let endIdx = linesArray.findIndex((l, idx) => idx > startIdx && l.includes('The above content does NOT'));
    if (endIdx === -1) endIdx = linesArray.findIndex((l, idx) => idx > startIdx && l.includes('The above content shows'));
    if (endIdx === -1) endIdx = linesArray.length;
    
    let codeLines = linesArray.slice(startIdx + 1, endIdx);
    
    let cleanCode = codeLines.map(line => {
      // If it was split from JSON string, we might need to unescape quotes
      line = line.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      return line.replace(/^\d+:\s/, '');
    }).join('\n');
    
    fs.writeFileSync('components/IncentiveView.tsx', cleanCode);
    console.log("Restored perfectly from recover_view_raw.json!");
    process.exit(0);
  } else {
      console.log("Could not find start index");
  }
} catch (e) {
  console.error(e);
}
