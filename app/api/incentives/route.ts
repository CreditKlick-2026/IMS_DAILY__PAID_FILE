import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

async function getSession() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('auth_session')?.value;
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const conditions: string[] = [];
    const queryParams: any[] = [];

    // Base filter: no duplicates
    conditions.push(`(is_duplicate = FALSE OR is_duplicate IS NULL)`);

    const month = searchParams.get('month');
    const year = searchParams.get('year');
    if (month) {
      conditions.push(`EXTRACT(MONTH FROM upload_at) = $${queryParams.length + 1}`);
      queryParams.push(month);
    }
    if (year) {
      conditions.push(`EXTRACT(YEAR FROM upload_at) = $${queryParams.length + 1}`);
      queryParams.push(year);
    }

    // Complex Filters from Live Records
    const multiMatchFilters = [
      'employee_code', 'product', 'bucket', 'location', 
      'aph', 'ph', 'client', 'tl_name', 'employee_name'
    ];

    multiMatchFilters.forEach(key => {
      const vals = searchParams.getAll(key);
      if (vals.length > 0) {
        conditions.push(`${key} = ANY($${queryParams.length + 1})`);
        queryParams.push(vals);
      }
    });

    const outMin = searchParams.get('outMin');
    if (outMin && !isNaN(Number(outMin))) {
      conditions.push(`CAST(NULLIF(regexp_replace(money_collected::text, '[^0-9.]', '', 'g'), '') AS NUMERIC) >= $${queryParams.length + 1}`);
      queryParams.push(Number(outMin));
    }

    const groupByParam = searchParams.get('groupBy') || 'ph';
    const allowedGroupBy = ['ph', 'tl_name', 'employee_name', 'employee_code', 'client', 'location', 'product', 'bucket'];
    const groupBy = allowedGroupBy.includes(groupByParam) ? groupByParam : 'ph';

    // Role Logic: Admin sees all, User sees only their own
    if (session.role !== 'admin') {
      conditions.push(`uploaded_by_employee_id = $${queryParams.length + 1}`);
      queryParams.push(session.employee_id);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Dynamic grouping query
    let queryText = `
      SELECT 
          ${groupBy} as employee_id, 
          COUNT(id) as total_records, 
          COALESCE(SUM(CAST(NULLIF(regexp_replace(money_collected::text, '[^0-9.]', '', 'g'), '') AS NUMERIC)), 0) as total_money_collected
      FROM dpf_records
      ${whereClause}
      GROUP BY ${groupBy}
      HAVING ${groupBy} IS NOT NULL AND CAST(${groupBy} AS TEXT) != ''
      ORDER BY total_money_collected DESC
    `;

    const res = await pool.query(queryText, queryParams);

    // Calculate 2% incentive in backend
    const data = res.rows.map(row => {
      const collection = parseFloat(row.total_money_collected);
      const incentive = collection * 0.02; // 2% formula
      return {
        employee_id: row.employee_id, // This holds the dynamically grouped column value
        name: row.employee_id, // We use the grouped column as the name identifier
        total_records: parseInt(row.total_records),
        total_collection: collection,
        incentive: incentive
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Incentive Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch incentive data' }, { status: 500 });
  }
}
