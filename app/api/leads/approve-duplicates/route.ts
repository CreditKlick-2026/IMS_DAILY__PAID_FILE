import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { logAudit } from '@/lib/audit';

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('auth_session')?.value;
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    return session.role === 'admin' ? session : null;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { month, year } = await req.json();

    let updateQuery = `
      UPDATE dpf_records 
      SET is_duplicate = FALSE 
      WHERE is_duplicate = TRUE 
    `;
    const queryParams: any[] = [];

    let m: number | null = null;
    let y: number | null = null;

    if (month && year) {
      m = parseInt(month);
      y = parseInt(year);
      updateQuery += ` AND EXTRACT(MONTH FROM upload_at) = $1 AND EXTRACT(YEAR FROM upload_at) = $2`;
      queryParams.push(m, y);
    }
    
    updateQuery += ` RETURNING id`;
    
    const res = await query(updateQuery, queryParams);

    await logAudit(
      'APPROVE_DUPLICATES',
      'EXCEL_BATCH',
      'bulk',
      admin.username,
      { month: m, year: y, count: res.rowCount, action_by_emp_id: admin.employee_id }
    );

    return NextResponse.json({ success: true, count: res.rowCount });
  } catch (error: any) {
    console.error('Error approving duplicates:', error);
    return NextResponse.json({ success: false, error: 'Failed to approve duplicates' }, { status: 500 });
  }
}
