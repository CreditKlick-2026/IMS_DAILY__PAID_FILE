const fs = require('fs');

const lines = fs.readFileSync('C:/Users/ankit/.gemini/antigravity-ide/brain/9785288c-0e19-4ea7-9fce-25394c722e9f/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Showing lines 1 to 578')) {
    fs.writeFileSync('recover_view_raw.json', lines[i]);
    console.log('Saved first occurrence!');
    break;
  }
}
