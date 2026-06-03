import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('auth_session')?.value;
  if (!sessionStr) return false;
  try {
    const session = JSON.parse(sessionStr);
    return session.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const res = await query(`
      SELECT * FROM audit_logs 
      WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2
      ORDER BY created_at DESC
    `, [month, year]);
    
    return NextResponse.json({ success: true, logs: res.rows });
  } catch (error) {
    console.error('Audit Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    await query(`
      DELETE FROM audit_logs 
      WHERE EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2
    `, [month, year]);

    return NextResponse.json({ success: true, message: 'Logs deleted successfully.' });
  } catch (error) {
    console.error('Audit Delete Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete audit logs' }, { status: 500 });
  }
}

