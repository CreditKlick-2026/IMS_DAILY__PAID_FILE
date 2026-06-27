import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let monthYearFilter = '';
    const params = [];
    if (month && year) {
      monthYearFilter = 'WHERE m.month_year = $1';
      params.push(`${month}-${year}`);
    }

    const { rows } = await pool.query(`
      SELECT 
        m.employee_id,
        k.employee_name as name,
        k.designation,
        k.location,
        m.total_metric_value as total_collection,
        m.final_payout as final_incentive
      FROM monthly_incentive_calculation m
      LEFT JOIN employee_keka_data k ON m.employee_id = k.employee_id
      ${monthYearFilter}
      ORDER BY m.final_payout DESC
    `, params);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
