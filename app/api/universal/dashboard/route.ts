import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const clientName = searchParams.get('client');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (month && month !== '0') {
      params.push(parseInt(month, 10));
      whereClause += ` AND EXTRACT(MONTH FROM COALESCE(d.upload_at, d.created_at)) = $${params.length}`;
    }

    if (year && year !== '0') {
      params.push(parseInt(year, 10));
      whereClause += ` AND EXTRACT(YEAR FROM COALESCE(d.upload_at, d.created_at)) = $${params.length}`;
    }

    if (clientName && clientName.trim() && clientName.toLowerCase() !== 'all') {
      params.push(`%${clientName.trim()}%`);
      whereClause += ` AND d.client ILIKE $${params.length}`;
    }

    const monthYearStr = (month && month !== '0' && year) ? `${month}-${year}` : null;

    const { rows } = await query(`
      SELECT 
        d.employee_code AS employee_id,
        COALESCE(MAX(k.name), MAX(d.employee_name), '—') AS name,
        COALESCE(MAX(k.designation), 'Associate') AS designation,
        COALESCE(MAX(k.location), MAX(d.location), '—') AS location,
        COALESCE(MAX(k.client), MAX(d.client), '—') AS client,
        COALESCE(MAX(k.product), MAX(d.product), '—') AS product,
        SUM(COALESCE(d.money_collected, 0)) AS total_collection,
        COUNT(d.id) AS total_cases,
        COALESCE(MAX(m.final_payout), 0) AS final_incentive
      FROM dpf_records d
      LEFT JOIN employee_keka_data k ON UPPER(d.employee_code) = UPPER(k.employee_id)
      LEFT JOIN monthly_incentive_calculation m ON UPPER(d.employee_code) = UPPER(m.employee_id) ${monthYearStr ? `AND m.month_year = '${monthYearStr}'` : ''}
      ${whereClause}
      GROUP BY d.employee_code
      ORDER BY final_incentive DESC, total_collection DESC
    `, params);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Universal Dashboard API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
