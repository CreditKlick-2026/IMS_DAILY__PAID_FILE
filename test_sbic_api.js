const http = require('http');
const req = http.request({ 
  hostname: 'localhost', 
  port: 3000, 
  path: '/api/incentives?groupBy=employee_code&location=Gurugram&client=SBIC&product=Card', 
  method: 'GET', 
  headers: { 'Cookie': 'auth_session={"id":"1","role":"admin","location_id":null}' } 
}, (res) => { 
  let data = ''; 
  res.on('data', (c) => data += c); 
  res.on('end', () => {
      try {
          const json = JSON.parse(data);
          console.log('assigned_grid:', json.assigned_grid);
      } catch(e) {
          console.error(data.substring(0, 500));
      }
  }); 
}); 
req.end();
