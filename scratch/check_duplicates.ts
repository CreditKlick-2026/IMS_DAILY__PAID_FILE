import { query } from '@/lib/db';

async function check() {
  const res = await query(`
    SELECT 
      is_duplicate,
      upload_at,
      EXTRACT(MONTH FROM upload_at) as month,
      EXTRACT(YEAR FROM upload_at) as year,
      COUNT(*) 
    FROM dpf_records 
    WHERE is_duplicate = true
    GROUP BY 1, 2, 3, 4
  `);
  console.log(res.rows);
  process.exit(0);
}

check();
