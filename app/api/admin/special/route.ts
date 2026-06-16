import { NextResponse } from 'next/server';
import pool from '@/lib/db';
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

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        let query = `SELECT employee_id, name, designation, is_special FROM employee_keka_data`;
        let countQuery = `SELECT COUNT(*) FROM employee_keka_data`;
        const queryParams: any[] = [];

        if (search) {
            const condition = ` WHERE employee_id ILIKE $1 OR name ILIKE $1`;
            query += condition;
            countQuery += condition;
            queryParams.push(`%${search}%`);
        } else {
            // default to showing only special users when no search
            const condition = ` WHERE is_special = TRUE`;
            query += condition;
            countQuery += condition;
        }

        query += ` ORDER BY is_special DESC, name ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        
        const [rowsRes, countRes] = await Promise.all([
            pool.query(query, [...queryParams, limit, offset]),
            pool.query(countQuery, queryParams)
        ]);

        const total = parseInt(countRes.rows[0].count);

        return NextResponse.json({ success: true, employees: rowsRes.rows, total, page, limit });
    } catch (error: any) {
        console.error('Error fetching special employees:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { employee_id, is_special } = body;

        if (!employee_id) {
            return NextResponse.json({ success: false, error: 'employee_id is required' }, { status: 400 });
        }

        const { rowCount } = await pool.query(
            `UPDATE employee_keka_data SET is_special = $1 WHERE employee_id = $2 RETURNING employee_id`,
            [is_special ? true : false, employee_id]
        );

        if (rowCount === 0) {
            return NextResponse.json({ success: false, error: 'Employee not found in Keka Data' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating special status:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
