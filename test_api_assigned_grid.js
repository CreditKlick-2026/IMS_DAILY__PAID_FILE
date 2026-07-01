const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/incentives?groupBy=employee_code&location=Gurugram&client=Axis&product=Card',
  method: 'GET',
  headers: {
    'Cookie': 'auth_session={"id":"1","role":"admin","location_id":null}'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('assigned_grid:', json.assigned_grid);
      console.log('grid2Slabs length:', json.grid2Slabs ? json.grid2Slabs.length : 0);
    } catch(e) {
      console.error(e);
    }
  });
});
req.end();
