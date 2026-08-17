import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('auth_session')?.value;
  if (!sessionStr) return false;
  try {
    const session = JSON.parse(sessionStr);
    return session.role === 'admin';
  } catch (e) {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString(), 10);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);
    const action = searchParams.get('action');
    const entityType = searchParams.get('entity_type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    let whereClause = `WHERE 1=1`;
    const params: any[] = [];

    if (month && month !== 0) {
      params.push(month);
      whereClause += ` AND EXTRACT(MONTH FROM created_at) = $${params.length}`;
    }
    if (year && year !== 0) {
      params.push(year);
      whereClause += ` AND EXTRACT(YEAR FROM created_at) = $${params.length}`;
    }
    if (action && action !== 'ALL') {
      params.push(action);
      whereClause += ` AND action = $${params.length}`;
    }
    if (entityType && entityType !== 'ALL') {
      params.push(entityType);
      whereClause += ` AND entity_type = $${params.length}`;
    }
    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      whereClause += ` AND (changed_by ILIKE $${params.length} OR entity_id ILIKE $${params.length} OR CAST(details AS TEXT) ILIKE $${params.length})`;
    }

    // 1. Total Count & Filtered Counts
    const countRes = await query(`SELECT COUNT(*) as total FROM audit_logs ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // 2. Summary KPI Metrics (for month/year)
    const kpiParams: any[] = [];
    let kpiWhere = `WHERE 1=1`;
    if (month && month !== 0) {
      kpiParams.push(month);
      kpiWhere += ` AND EXTRACT(MONTH FROM created_at) = $${kpiParams.length}`;
    }
    if (year && year !== 0) {
      kpiParams.push(year);
      kpiWhere += ` AND EXTRACT(YEAR FROM created_at) = $${kpiParams.length}`;
    }

    const kpiRes = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE action ILIKE '%UPLOAD%') as upload_events,
        COUNT(*) FILTER (WHERE action ILIKE '%DELETE%') as delete_events,
        COUNT(*) FILTER (WHERE action ILIKE '%USER%' OR action ILIKE '%PASSWORD%') as security_events,
        COUNT(*) FILTER (WHERE entity_type ILIKE '%KEKA%') as keka_events
      FROM audit_logs ${kpiWhere}
    `, kpiParams);

    const kpi = kpiRes.rows[0] || {};

    // 3. Paginated Logs
    params.push(limit, offset);
    const dataRes = await query(`
      SELECT id, action, entity_type, entity_id, changed_by, details, created_at
      FROM audit_logs 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    return NextResponse.json({
      success: true,
      logs: dataRes.rows,
      totalPages,
      page,
      total,
      kpi: {
        totalEvents: parseInt(kpi.total_events || '0'),
        uploadEvents: parseInt(kpi.upload_events || '0'),
        deleteEvents: parseInt(kpi.delete_events || '0'),
        securityEvents: parseInt(kpi.security_events || '0'),
        kekaEvents: parseInt(kpi.keka_events || '0')
      }
    });
  } catch (error: any) {
    console.error('Audit Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idsStr = searchParams.get('ids');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // Single Log Deletion
    if (id) {
      await query(`DELETE FROM audit_logs WHERE id = $1`, [id]);
      return NextResponse.json({ success: true, message: `Audit log #${id} deleted successfully.` });
    }

    // Bulk IDs Deletion
    if (idsStr) {
      const ids = idsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (ids.length > 0) {
        await query(`DELETE FROM audit_logs WHERE id = ANY($1::int[])`, [ids]);
        return NextResponse.json({ success: true, message: `${ids.length} audit logs deleted successfully.` });
      }
    }

    // Month/Year Purge
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      let purgeQuery = `DELETE FROM audit_logs WHERE EXTRACT(YEAR FROM created_at) = $1`;
      const purgeParams: any[] = [y];
      if (m !== 0) {
        purgeParams.push(m);
        purgeQuery += ` AND EXTRACT(MONTH FROM created_at) = $2`;
      }
      await query(purgeQuery, purgeParams);
      return NextResponse.json({ success: true, message: `Audit logs for ${m ? `${m}/` : ''}${y} purged successfully.` });
    }

    return NextResponse.json({ success: false, error: 'No valid id, ids, or month/year provided.' }, { status: 400 });
  } catch (error: any) {
    console.error('Audit Delete Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
