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

export async function GET(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');
    const locationName = searchParams.get('location');

    const now = new Date();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();

    let userConditions = '';
    const queryParams: any[] = [month, year];
    let pIdx = 3;

    if (locationName) {
      userConditions += ` AND (u.location = $${pIdx} OR l.name = $${pIdx})`;
      queryParams.push(locationName);
      pIdx++;
    }

    const query = `
      SELECT 
        u.id as user_id,
        u.employee_id, 
        u.name,
        u.username,
        COALESCE(l.name, u.location, '—') as location_name,
        TO_CHAR(COALESCE(uj.target_date, uj.created_at), 'YYYY-MM-DD') as upload_date,
        uj.id as job_id,
        uj.status as job_status,
        uj.uploaded_by_employee_id,
        uj.total_rows,
        uj.processed_rows
      FROM users u
      LEFT JOIN master_location l ON u.location_id = l.id
      LEFT JOIN upload_jobs uj 
        ON (u.employee_id = uj.uploaded_by_employee_id OR u.username = uj.uploaded_by_employee_id)
        AND uj.job_type = 'DPF'
        AND EXTRACT(MONTH FROM COALESCE(uj.target_date, uj.created_at)) = $1
        AND EXTRACT(YEAR FROM COALESCE(uj.target_date, uj.created_at)) = $2
      WHERE u.role = 'user' ${userConditions}
      ORDER BY u.name, u.employee_id, uj.created_at DESC
    `;

    const res = await pool.query(query, queryParams);

    // Group by user
    const usersMap: Record<string, any> = {};

    for (const row of res.rows) {
      const empId = row.employee_id || row.username;
      if (!usersMap[empId]) {
        usersMap[empId] = {
          user_id: row.user_id,
          employee_id: row.employee_id,
          name: row.name || row.username,
          username: row.username,
          location: row.location_name,
          uploads: {}
        };
      }

      if (row.upload_date) {
        if (!usersMap[empId].uploads[row.upload_date]) {
          let cellStatus = 'UPLOADED';
          if (row.job_status === 'DELETED_BY_ADMIN') {
            cellStatus = 'DELETED_BY_ADMIN';
          } else if (row.job_status === 'FAILED') {
            cellStatus = 'FAILED';
          } else if (row.job_status === 'PROCESSING') {
            cellStatus = 'PROCESSING';
          } else if (row.uploaded_by_employee_id && row.uploaded_by_employee_id !== row.employee_id) {
            cellStatus = 'UPLOADED_BY_ADMIN';
          }
          usersMap[empId].uploads[row.upload_date] = cellStatus;
        }
      }
    }

    const trackerData = Object.values(usersMap);
    return NextResponse.json({ success: true, month, year, data: trackerData });
  } catch (error: any) {
    console.error('Error fetching tracker data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
