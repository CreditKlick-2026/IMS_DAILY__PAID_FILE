import pool from '../lib/db';
async function run() {
  const res = await pool.query(`SELECT COUNT(*), is_duplicate FROM dpf_records WHERE job_id = '3adda80f-3309-4d88-83d8-eee6fff51f66' GROUP BY is_duplicate`);
  console.log(res.rows);
  process.exit(0);
}
run();
