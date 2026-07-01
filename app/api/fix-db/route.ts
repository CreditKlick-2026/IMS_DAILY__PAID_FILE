import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT id, name, product_type, assigned_grid, (assigned_grid IS NULL) as is_sql_null
      FROM master_client
      ORDER BY name
    `);
    
    return NextResponse.json({
      success: true,
      rows: res.rows
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
