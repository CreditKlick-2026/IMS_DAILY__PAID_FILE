import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { cookies } from 'next/headers';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('auth_session')?.value;
    let userId = null;
    let role = null;
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        userId = session.id;
        role = session.role;
      } catch (e) {}
    }

    let query = '';
    let params: any[] = [];

    if (role === 'admin' || !userId) {
      query = `
        SELECT p.*, c.name as client_name, l.name as location_name 
        FROM master_process p
        LEFT JOIN master_client c ON p.client_id = c.id
        LEFT JOIN master_location l ON p.location_id = l.id
        ORDER BY p.id DESC
      `;
    } else {
      query = `
        SELECT p.*, c.name as client_name, l.name as location_name 
        FROM master_process p
        LEFT JOIN master_client c ON p.client_id = c.id
        LEFT JOIN master_location l ON p.location_id = l.id
        JOIN user_process_mapping upm ON p.id = upm.process_id
        WHERE upm.user_id = $1
        ORDER BY p.id DESC
      `;
      params = [userId];
    }

    const { rows } = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { client_id, location_id, name, tracking_metric, process_head_name } = await req.json();
    if (!client_id || !location_id || !name || !tracking_metric) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const { rows } = await pool.query(
      'INSERT INTO master_process (client_id, location_id, name, tracking_metric, process_head_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [client_id, location_id, name, tracking_metric, process_head_name || null]
    );
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    
    await pool.query('DELETE FROM master_process WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
