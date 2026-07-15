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
    const clientName = searchParams.get('client');

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    let monthYearStr = null;

    if (month && year) {
      whereClause += ` AND EXTRACT(MONTH FROM d.upload_at) = $${paramIndex} AND EXTRACT(YEAR FROM d.upload_at) = $${paramIndex + 1}`;
      params.push(parseInt(month), parseInt(year));
      paramIndex += 2;
      monthYearStr = `${month}-${year}`;
    }

    if (clientName) {
      whereClause += ` AND LOWER(d.client) = LOWER($${paramIndex})`;
      params.push(clientName);
      paramIndex++;
    }

    const { rows } = await pool.query(`
      SELECT 
        d.employee_code AS employee_id,
        MAX(k.employee_name) AS name,
        MAX(k.designation) AS designation,
        MAX(k.location) AS location,
        SUM(d.money_collected) AS total_collection,
        COALESCE(MAX(m.final_payout), 0) AS final_incentive
      FROM dpf_records d
      LEFT JOIN employee_keka_data k ON d.employee_code = k.employee_id
      LEFT JOIN monthly_incentive_calculation m ON d.employee_code = m.employee_id ${monthYearStr ? `AND m.month_year = '${monthYearStr}'` : ''}
      ${whereClause}
      GROUP BY d.employee_code
      ORDER BY final_incentive DESC, total_collection DESC
    `, params);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
