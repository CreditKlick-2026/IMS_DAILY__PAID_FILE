const http = require('http');

http.get('http://localhost:3000/api/incentives', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Leadership Grid:', json.leadershipGrid.filter(x => x.role === 'AM'));
    } catch(e) {
      console.log('Error parsing JSON:', data.substring(0, 100));
    }
  });
}).on('error', console.error);
