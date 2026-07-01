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
      console.log(json.data.find(d => d.employee_id === 'IMS8369'));
    } catch(e) {
      console.error(e);
    }
  });
});
req.end();
