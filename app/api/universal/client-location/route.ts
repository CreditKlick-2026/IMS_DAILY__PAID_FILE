import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    const clientId = searchParams.get('clientId');

    let query = `
      SELECT clm.id, clm.location_id, clm.client_id, l.name as location_name, c.name as client_name
      FROM client_location_mapping clm
      JOIN master_location l ON l.id = clm.location_id
      JOIN master_client c ON c.id = clm.client_id
    `;
    const params: any[] = [];
    let whereClauses: string[] = [];

    if (locationId) {
      params.push(locationId);
      whereClauses.push(`clm.location_id = $${params.length}`);
    }
    if (clientId) {
      params.push(clientId);
      whereClauses.push(`clm.client_id = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    const { rows } = await pool.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clientId, locationIds } = await req.json();
    if (!clientId || !Array.isArray(locationIds)) {
      return NextResponse.json({ success: false, error: 'Missing required fields (clientId, locationIds)' }, { status: 400 });
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Delete existing mappings for this client
      await client.query('DELETE FROM client_location_mapping WHERE client_id = $1', [clientId]);
      
      // Insert new mappings
      for (const locId of locationIds) {
        await client.query(
          'INSERT INTO client_location_mapping (client_id, location_id) VALUES ($1, $2)',
          [clientId, locId]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
