import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const employeeId = (formData.get('employee_id') as string) || null;
    const employeeName = (formData.get('name') as string) || null;

    const locationId = formData.get('location_id') ? parseInt(formData.get('location_id') as string) : null;
    const clientId = formData.get('client_id') ? parseInt(formData.get('client_id') as string) : null;
    const productType = (formData.get('product_type') as string) || null;
    const month = formData.get('month') ? parseInt(formData.get('month') as string) : new Date().getMonth() + 1;
    const year = formData.get('year') ? parseInt(formData.get('year') as string) : new Date().getFullYear();
    const targetDate = `${year}-${String(month).padStart(2, '0')}-01`;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const fileName = `${uuidv4()}_${file.name}`;
    const jobId = uuidv4();

    await query(
      `INSERT INTO upload_jobs (id, file_path, file_data, uploaded_by_employee_id, uploaded_by_name, status, job_type, location_id, process_id, product_type, target_date) 
       VALUES ($1, $2, $3, $4, $5, 'PENDING', 'KEKA', $6, $7, $8, $9)`,
      [jobId, fileName, base64Data, employeeId, employeeName, locationId, clientId, productType, targetDate]
    );

    if (employeeId) {
      await logAudit(
        'UPLOAD_EXCEL',
        'EMPLOYEE_KEKA_DATA',
        jobId,
        employeeName || 'Unknown',
        { fileName: file.name, action_by_emp_id: employeeId, target_date: targetDate }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Keka master data securely queued for processing.",
      jobId
    });
  } catch (error: any) {
    console.error("Employee Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
