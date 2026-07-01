const pool = require('./lib/db');
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='employee_keka_data'").then(r => console.log(r.rows.map(x=>x.column_name))).catch(console.error).finally(() => pool.end());
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='dpf_records'").then(r => console.log(r.rows.map(x=>x.column_name))).catch(console.error).finally(() => pool.end());
