import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { cookies } from 'next/headers';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionStr = cookieStore.get('auth_session')?.value;
    let userId = null;
    let role = null;
    let userLocationId = null;
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        userId = session.id;
        role = session.role;
        userLocationId = session.location_id;
      } catch (e) {}
    }

    const { searchParams } = new URL(req.url);
    const proxyUserId = searchParams.get('proxyUserId');
    const locationId = searchParams.get('location_id');

    let params: any[] = [];
    let paramIndex = 1;

    let baseQuery = `SELECT DISTINCT c.* FROM master_client c`;
    let joins: string[] = [];
    let wheres: string[] = [];

    if (role === 'admin' && proxyUserId) {
      // Admin is proxying a user -> fetch only that user's clients
      joins.push(`JOIN user_client_mapping ucm ON c.id = ucm.client_id`);
      joins.push(`JOIN users u ON u.id = ucm.user_id`);
      wheres.push(`u.employee_id = $${paramIndex++}`);
      params.push(proxyUserId);
    } else if (role !== 'admin' && userLocationId) {
      // Regular user -> fetch clients assigned to their location
      joins.push(`JOIN client_location_mapping uclm ON c.id = uclm.client_id`);
      wheres.push(`uclm.location_id = $${paramIndex++}`);
      params.push(userLocationId);
    }

    if (locationId) {
      joins.push(`JOIN client_location_mapping clm ON c.id = clm.client_id`);
      wheres.push(`clm.location_id = $${paramIndex++}`);
      params.push(locationId);
    }

    let query = baseQuery + ' ' + joins.join(' ');
    if (wheres.length > 0) {
      query += ' WHERE ' + wheres.join(' AND ');
    }
    query += ' ORDER BY c.name ASC';

    const { rows } = await pool.query(query, params);

    // Enrich each client with its assigned location names
    const enriched = await Promise.all(rows.map(async (row: any) => {
      const locRes = await pool.query(
        `SELECT l.id, l.name FROM master_location l JOIN client_location_mapping clm ON l.id = clm.location_id WHERE clm.client_id = $1 ORDER BY l.name ASC`,
        [row.id]
      );
      const locationNames = locRes.rows.map((r: any) => r.name);
      return {
        ...row,
        location_names: locationNames,
        location_name: locationNames[0] || null  // first location for easy filtering
      };
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, locationIds, productType } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await pool.connect();
    let newClient;
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'INSERT INTO master_client (name, product_type) VALUES ($1, $2) ON CONFLICT (name, product_type) DO UPDATE SET product_type = EXCLUDED.product_type RETURNING *',
        [name, productType || 'Card']
      );
      newClient = rows[0];

      if (Array.isArray(locationIds) && locationIds.length > 0) {
        await client.query('DELETE FROM client_location_mapping WHERE client_id = $1', [newClient.id]);
        for (const locId of locationIds) {
          await client.query(
            'INSERT INTO client_location_mapping (client_id, location_id) VALUES ($1, $2)',
            [newClient.id, locId]
          );
        }
      }

      await client.query('COMMIT');
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, data: newClient });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    
    await pool.query('DELETE FROM master_client WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, required_columns, assigned_grid } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    
    const updates = [];
    const values = [];
    let queryIndex = 1;

    if (required_columns !== undefined) {
      updates.push(`required_columns = $${queryIndex++}`);
      values.push(required_columns ? JSON.stringify(required_columns) : null);
    }
    if (assigned_grid !== undefined) {
      updates.push(`assigned_grid = $${queryIndex++}`);
      values.push(assigned_grid || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true });
    }

    values.push(id);
    const query = `UPDATE master_client SET ${updates.join(', ')} WHERE id = $${queryIndex} RETURNING *`;
    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

