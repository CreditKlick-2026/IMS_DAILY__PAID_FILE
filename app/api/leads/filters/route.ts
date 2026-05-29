import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const fields = [
      { name: 'employeeCode', column: 'employee_code' },
      { name: 'product', column: 'product' },
      { name: 'bucket', column: 'bucket' },
      { name: 'location', column: 'location' },
      { name: 'aph', column: 'aph' },
      { name: 'ph', column: 'ph' },
      { name: 'client', column: 'client' },
      { name: 'tlName', column: 'tl_name' },
      { name: 'agentName', column: 'employee_name' }
    ];

    const results = await Promise.all(
      fields.map(async (field) => {
        const res = await query(`SELECT DISTINCT ${field.column} FROM dpf_records WHERE ${field.column} IS NOT NULL AND ${field.column} != '' ORDER BY ${field.column} ASC`);
        return { [field.name]: res.rows.map(r => r[field.column]) };
      })
    );

    const filterData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return NextResponse.json({ success: true, filters: filterData });
  } catch (error: any) {
    console.error('Error fetching filters:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch filters' }, { status: 500 });
  }
}
