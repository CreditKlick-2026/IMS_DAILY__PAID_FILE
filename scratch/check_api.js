async function run() {
  const res = await fetch('http://localhost:3000/api/admin/excels?month=6&year=2026', {
      headers: {
          cookie: 'auth_session={"role":"admin","employee_id":"test","username":"test"}'
      }
  });
  const text = await res.text();
  console.log(text.substring(0, 500));
}
run();
