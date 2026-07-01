const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/incentives?groupBy=employee_code&location=Gurugram&client=Sbi%20Recovery&product=Card',
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
      if (json.data && json.data.length > 0) {
        console.log('Sample Data:');
        json.data.slice(0, 3).forEach(r => {
            console.log(`Name: ${r.employee_name}, Desig: ${r.designation}, Coll: ${r.total_collection}, Inc: ${r.incentive}`);
        });
      } else {
        console.log('No data found');
      }
    } catch(e) {
      console.error(e);
    }
  });
});
req.end();
