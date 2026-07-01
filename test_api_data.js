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
    const json = JSON.parse(data);
    console.log(json.data[0]);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
