import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

// Next.js dynamic route params pattern
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const p = await params;
    const employee_id = p.id;
    const body = await req.json();

    const { name, designation, location, am_name, tl_name, salary, doj, doc, agent_ohr, is_special } = body;

    // Use parameterized query to update
    const updateQuery = `
      UPDATE employee_keka_data
      SET 
        name = $1,
        designation = $2,
        location = $3,
        am_name = $4,
        tl_name = $5,
        salary = $6,
        doj = $7,
        doc = $8,
        agent_ohr = $9,
        is_special = $10,
        updated_at = NOW()
      WHERE employee_id = $11
      RETURNING *;
    `;

    const values = [
      name || null,
      designation || null,
      location || null,
      am_name || null,
      tl_name || null,
      salary || null,
      doj ? new Date(doj) : null,
      doc ? new Date(doc) : null,
      agent_ohr || null,
      is_special === true || is_special === 'true',
      employee_id
    ];

    const res = await query(updateQuery, values);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    console.error("Keka Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const p = await params;
    const employee_id = p.id;

    const deleteQuery = `
      DELETE FROM employee_keka_data
      WHERE employee_id = $1
      RETURNING employee_id;
    `;

    const res = await query(deleteQuery, [employee_id]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    console.error("Keka Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
