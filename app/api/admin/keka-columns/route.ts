import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const DATA_FILE = path.join(process.cwd(), 'data', 'keka_columns.json');

const DEFAULT_COLUMNS = [
  { key: 'location', labels: ['location', 'Location'], display: 'location' },
  { key: 'employee_id', labels: ['employee_id', 'Employee_Code', 'Employee Code', 'EmpCode', 'EMP CODE'], display: 'employee_id' },
  { key: 'name', labels: ['name', 'Name', 'Employee Name', 'EmpName'], display: 'name' },
  { key: 'designation', labels: ['designation', 'Designation', 'Role', 'DESIGNATION'], display: 'designation' },
  { key: 'agent_ohr', labels: ['agent_ohr', 'Agent OHR', 'AgentOHR', 'OHR'], display: 'agent_ohr' },
  { key: 'doj', labels: ['doj', 'DOJ', 'Date of Joining'], display: 'doj' },
  { key: 'doc', labels: ['doc', 'DOC', 'Date of Calling'], display: 'doc' },
  { key: 'salary', labels: ['salary', 'Salary', 'CTC', 'Target'], display: 'salary' },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const locationId = url.searchParams.get('location_id') || 'all';
    const clientId = url.searchParams.get('client_id') || 'all';
    const productType = url.searchParams.get('product_type') || 'all';
    
    const configKey = `${locationId}_${clientId}_${productType}`;

    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ success: true, data: DEFAULT_COLUMNS });
    }
    
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    // Support legacy format if it's an array
    if (Array.isArray(data)) {
        return NextResponse.json({ success: true, data: data });
    }

    const columns = data[configKey] || data['default'] || DEFAULT_COLUMNS;
    
    return NextResponse.json({ success: true, data: columns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Basic auth check for admin routes
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('auth_session')?.value;
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.role !== 'admin') {
         return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
    } else {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const columns = body.columns;
    const locationId = body.location_id || 'all';
    const clientId = body.client_id || 'all';
    const productType = body.product_type || 'all';

    const configKey = `${locationId}_${clientId}_${productType}`;

    if (!Array.isArray(columns)) {
      return NextResponse.json({ success: false, error: 'columns must be an array' }, { status: 400 });
    }

    let currentData: Record<string, any> = {};
    if (fs.existsSync(DATA_FILE)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            if (!Array.isArray(parsed)) {
                currentData = parsed;
            } else {
                currentData['default'] = parsed; // migrate legacy array to object
            }
        } catch(e) {}
    }

    currentData[configKey] = columns;
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, data: columns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
