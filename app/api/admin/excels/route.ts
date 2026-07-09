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

export async function GET(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');
    const locationName = searchParams.get('location');
    const processId = searchParams.get('client_id'); // This is actually process_id from frontend
    const clientName = searchParams.get('client_name');
    const productName = searchParams.get('product_type');

    let queryText = `
      SELECT u.id, u.file_path, u.status, u.total_rows, u.processed_rows, 
      TO_CHAR(u.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at, 
      TO_CHAR(u.upload_at, 'YYYY-MM-DD') as upload_at, u.uploaded_by_employee_id, u.uploaded_by_name, u.target_employee_id, u.is_edited_by_admin, u.job_type, u.product_type,
      l.name as location_name, c.name as client_name,
      (SELECT string_agg(DISTINCT bucket, ', ') FROM dpf_records d WHERE d.job_id = u.id) as buckets
        FROM upload_jobs u
        LEFT JOIN master_client c ON COALESCE(u.client_id, u.process_id) = c.id
        LEFT JOIN client_location_mapping clm ON c.id = clm.client_id
        LEFT JOIN master_location l ON COALESCE(u.location_id, clm.location_id) = l.id
        WHERE 1=1
    `;
    let queryParams: any[] = [];

    if (monthStr && yearStr) {
      const month = parseInt(monthStr);
      const year = parseInt(yearStr);
      if (month !== 0 && year !== 0) {
        queryParams.push(month, year);
        queryText += ` AND EXTRACT(MONTH FROM COALESCE(u.upload_at, u.created_at)) = $${queryParams.length - 1} AND EXTRACT(YEAR FROM COALESCE(u.upload_at, u.created_at)) = $${queryParams.length} `;
      } else if (month !== 0) {
        queryParams.push(month);
        queryText += ` AND EXTRACT(MONTH FROM COALESCE(u.upload_at, u.created_at)) = $${queryParams.length} `;
      } else if (year !== 0) {
        queryParams.push(year);
        queryText += ` AND EXTRACT(YEAR FROM COALESCE(u.upload_at, u.created_at)) = $${queryParams.length} `;
      }
    }
    
    if (locationName) {
      queryParams.push(locationName);
      queryText += ` AND l.name = $${queryParams.length} `;
    }
    
    if (processId) {
      queryParams.push(parseInt(processId));
      queryText += ` AND COALESCE(u.client_id, u.process_id) = $${queryParams.length} `;
    }

    if (clientName) {
      queryParams.push(clientName);
      queryText += ` AND c.name = $${queryParams.length} `;
    }

    if (productName) {
      queryParams.push(productName);
      queryText += ` AND u.product_type = $${queryParams.length} `;
    }
    
    queryText += ` ORDER BY u.created_at DESC`;

    const res = await query(queryText, queryParams);
    return NextResponse.json({ success: true, jobs: res.rows });
  } catch (error: any) {
    console.error('Error fetching upload jobs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch upload jobs' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Job ID missing' }, { status: 400 });

    const jobCheck = await query('SELECT file_path FROM upload_jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(process.cwd(), 'public', jobCheck.rows[0].file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await query('DELETE FROM dpf_records WHERE job_id = $1', [id]);
    await query('UPDATE upload_jobs SET status = $1 WHERE id = $2', ['DELETED_BY_ADMIN', id]);

    await logAudit(
      'DELETE_EXCEL',
      'EXCEL_BATCH',
      id,
      admin.username,
      { file_path: jobCheck.rows[0].file_path, action_by_emp_id: admin.employee_id }
    );

    return NextResponse.json({ success: true, message: 'Excel and all associated records deleted successfully.' });
  } catch (error: any) {
    console.error('Error deleting excel job:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete Excel records' }, { status: 500 });
  }
}
