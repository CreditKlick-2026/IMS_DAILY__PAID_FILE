import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Public API - no auth required - just returns list of all locations
export async function GET() {
  try {
    const result = await query(
      'SELECT id, name FROM master_location ORDER BY name'
    );
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
