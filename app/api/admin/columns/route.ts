import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const DATA_FILE = path.join(process.cwd(), 'data', 'master_columns.json');

export async function GET(req: Request) {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ success: true, data: [] });
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Basic auth check for admin routes if needed
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

    const { columns } = await req.json();
    if (!Array.isArray(columns)) {
      return NextResponse.json({ success: false, error: 'columns must be an array' }, { status: 400 });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(columns, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, data: columns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
