const fs = require('fs');
fetch('http://localhost:3000/api/universal/clients').then(r=>r.json()).then(d => { 
  const sbi = d.data.find(c => c.name==='Sbi Recovery'); 
  console.log('EXACT VALUE:', JSON.stringify(sbi.required_columns)); 
  console.log('ARRAY MAP:', sbi.required_columns.map(c => `"${c}"`));
});
