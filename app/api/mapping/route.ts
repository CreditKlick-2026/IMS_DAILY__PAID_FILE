import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        k.employee_id, 
        k.name as keka_name, 
        k.designation, 
        k.location,
        d.dpf_name, 
        COALESCE(k.tl_name, d.tl_name) as tl_name, 
        COALESCE(k.am_name, d.am_name) as am
      FROM employee_keka_data k 
      LEFT JOIN (
        SELECT DISTINCT 
          employee_code, 
          first_value(employee_name) over (partition by employee_code order by upload_at desc) as dpf_name, 
          first_value(tl_name) over (partition by employee_code order by upload_at desc) as tl_name, 
          first_value(am) over (partition by employee_code order by upload_at desc) as am_name 
        FROM dpf_records
        WHERE employee_code IS NOT NULL
      ) d ON k.employee_id = d.employee_code
      ORDER BY k.name ASC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Mapping fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { employee_id, designation, location, am, tl_name } = body;
    
    if (!employee_id) return NextResponse.json({ success: false, error: "Missing employee ID" }, { status: 400 });

    const result = await query(`
      UPDATE employee_keka_data 
      SET designation = $1, location = $2, am_name = $3, tl_name = $4, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $5 RETURNING *
    `, [designation || null, location || null, am || null, tl_name || null, employee_id]);

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Mapping update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
