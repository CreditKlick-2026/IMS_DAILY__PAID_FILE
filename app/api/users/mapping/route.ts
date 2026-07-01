import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

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

// Get all mappings for a specific user
export async function GET(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  try {
    const res = await pool.query('SELECT client_id FROM user_client_mapping WHERE user_id = $1', [userId]);
    const clientIds = res.rows.map(r => r.client_id);
    return NextResponse.json({ success: true, clientIds });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Update mappings for a specific user
export async function POST(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { userId, clientIds } = await req.json();
    if (!userId || !Array.isArray(clientIds)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await pool.query('BEGIN');
    
    // Remove existing mappings
    await pool.query('DELETE FROM user_client_mapping WHERE user_id = $1', [userId]);
    
    // Insert new mappings
    if (clientIds.length > 0) {
      const values = clientIds.map((pid: number) => `(${userId}, ${pid})`).join(', ');
      await pool.query(`INSERT INTO user_client_mapping (user_id, client_id) VALUES ${values}`);
    }

    await pool.query('COMMIT');
    return NextResponse.json({ success: true, message: 'Mapping updated successfully' });
  } catch (error: any) {
    await pool.query('ROLLBACK');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
