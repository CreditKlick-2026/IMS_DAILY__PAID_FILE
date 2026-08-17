import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

const DATA_FILE = path.join(process.cwd(), 'data', 'keka_columns.json');

const DEFAULT_KEKA_COLUMNS = [
  {
    key: 'employee_id',
    display: 'Employee ID',
    labels: ['employee_id', 'Employee ID', 'EmployeeId', 'EMP ID', 'EMPID', 'EMPLOYEE ID', 'emp id', 'employee id', 'EmpCode', 'Emp Code', 'EMP CODE', 'Emp_Code', 'Emp ID']
  },
  {
    key: 'name',
    display: 'Employee Name',
    labels: ['name', 'Name', 'NAME', 'Employee Name', 'EmployeeName', 'EmpName', 'EMP NAME', 'EMPNAME', 'Emp_Name', 'EMPLOYEE NAME', 'employee name', 'Agent Name']
  },
  {
    key: 'location',
    display: 'Location',
    labels: ['location', 'Location', 'LOCATION', 'Branch', 'BRANCH', 'City', 'CITY', 'Hub', 'Location Name', 'LocationName']
  },
  {
    key: 'client',
    display: 'Client',
    labels: ['client', 'Client', 'CLIENT', 'Process', 'PROCESS', 'Process Name', 'ProcessName', 'Client Name', 'ClientName', 'Bank', 'BANK']
  },
  {
    key: 'product',
    display: 'Product',
    labels: ['product', 'Product', 'PRODUCT', 'Product Type', 'ProductType', 'Scheme', 'Segment']
  },
  {
    key: 'designation',
    display: 'Designation',
    labels: ['designation', 'Designation', 'DESIGNATION', 'Role', 'ROLE', 'Position', 'POSITION', 'Desig', 'Job Title']
  },
  {
    key: 'agent_ohr',
    display: 'Agent OHR',
    labels: ['agent_ohr', 'Agent OHR', 'AgentOHR', 'OHR', 'OHR ID', 'OHRID', 'Agent_OHR', 'AGENT OHR', 'AGENTOHR', 'ohr id', 'agent ohr']
  },
  {
    key: 'tl_name',
    display: 'TL Name',
    labels: ['tl_name', 'TL Name', 'TLName', 'Team Leader', 'TeamLeader', 'TL', 'tl', 'TL_NAME', 'TL NAME', 'Reporting Manager']
  },
  {
    key: 'am_name',
    display: 'AM Name',
    labels: ['am_name', 'AM Name', 'AMName', 'Area Manager', 'AreaManager', 'AM', 'am', 'AM_NAME', 'AM NAME', 'Manager']
  },
  {
    key: 'doj',
    display: 'DOJ',
    labels: ['doj', 'DOJ', 'Date of Joining', 'DateOfJoining', 'Joining Date', 'JoiningDate', 'DOJ Date', 'DOJ_DATE', 'Date_Of_Joining']
  },
  {
    key: 'doc',
    display: 'DOC',
    labels: ['doc', 'DOC', 'Date of Calling', 'DateOfCalling', 'Calling Date', 'CallingDate', 'DOC Date', 'DOC_DATE', 'Date_Of_Calling']
  },
  {
    key: 'salary',
    display: 'Salary',
    labels: ['salary', 'Salary', 'SALARY', 'Base Salary', 'BaseSalary', 'Gross Salary', 'GrossSalary', 'CTC', 'ctc', 'Target', 'Monthly Salary']
  },
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const locationId = url.searchParams.get('location_id') || 'all';
    const clientId = url.searchParams.get('client_id') || 'all';
    const productType = url.searchParams.get('product_type') || 'all';
    const configKey = `${locationId}_${clientId}_${productType}`;

    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ success: true, data: DEFAULT_KEKA_COLUMNS });
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (Array.isArray(data)) return NextResponse.json({ success: true, data });
    const columns = data[configKey] || data['default'] || DEFAULT_KEKA_COLUMNS;
    return NextResponse.json({ success: true, data: columns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('auth_session')?.value;
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    } else {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const columns = body.columns;
    const locationId = body.location_id || 'all';
    const clientId = body.client_id || 'all';
    const productType = body.product_type || 'all';
    const configKey = `${locationId}_${clientId}_${productType}`;

    if (!Array.isArray(columns)) return NextResponse.json({ success: false, error: 'columns must be an array' }, { status: 400 });

    let currentData: Record<string, any> = {};
    if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        currentData = Array.isArray(parsed) ? { default: parsed } : parsed;
      } catch {}
    }

    currentData[configKey] = columns;
    currentData['default'] = columns;
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2), 'utf8');

    return NextResponse.json({ success: true, data: columns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('auth_session')?.value;
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.role !== 'admin') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    } else {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    const locationId = searchParams.get('location_id') || 'all';
    const clientId = searchParams.get('client_id') || 'all';
    const productType = searchParams.get('product_type') || 'all';
    const configKey = `${locationId}_${clientId}_${productType}`;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Column key is required' }, { status: 400 });
    }

    // 1. Check PostgreSQL Database Integrity: Does any record contain active data for this column?
    const coreDbColumns = ['employee_id', 'name', 'location', 'client', 'product', 'designation', 'agent_ohr', 'tl_name', 'am_name', 'doj', 'doc', 'salary'];
    
    let activeDataCount = 0;
    try {
      if (coreDbColumns.includes(key)) {
        let countRes: any;
        if (key === 'salary') {
          countRes = await query(`SELECT COUNT(*) as count FROM employee_keka_data WHERE salary IS NOT NULL AND salary > 0`);
        } else {
          countRes = await query(`SELECT COUNT(*) as count FROM employee_keka_data WHERE "${key}" IS NOT NULL AND TRIM(CAST("${key}" AS TEXT)) != ''`);
        }
        activeDataCount = parseInt(countRes?.rows[0]?.count || '0');
      } else {
        const countRes = await query(`
          SELECT COUNT(*) as count 
          FROM employee_keka_data 
          WHERE extra_data ? $1 AND extra_data->>$1 IS NOT NULL AND TRIM(extra_data->>$1) != ''
        `, [key]);
        activeDataCount = parseInt(countRes?.rows[0]?.count || '0');
      }
    } catch {
      activeDataCount = 0;
    }

    if (activeDataCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Integrity Constraint: Cannot delete column "${key}" because ${activeDataCount} active employee record(s) contain data for this field. Purge the database records first to delete this column.`
      }, { status: 400 });
    }

    // 2. Safe to delete from Schema JSON configuration
    let currentData: Record<string, any> = {};
    if (fs.existsSync(DATA_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        currentData = Array.isArray(parsed) ? { default: parsed } : parsed;
      } catch {}
    }

    const currentCols: any[] = currentData[configKey] || currentData['default'] || DEFAULT_KEKA_COLUMNS;
    const updatedCols = currentCols.filter(c => c.key !== key);

    currentData[configKey] = updatedCols;
    currentData['default'] = updatedCols;
    fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: `Column "${key}" successfully deleted as no associated database data was found.`,
      data: updatedCols
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
