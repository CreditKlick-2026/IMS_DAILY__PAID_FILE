import { NextResponse } from 'next/server';
import { Pool } from 'pg';


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const process_id = searchParams.get('process_id');
        let query = `SELECT id, target_collection, incentive_percentage FROM special_grid_rules WHERE process_id IS NULL ORDER BY target_collection ASC`;
        let params: any[] = [];
        if (process_id) {
            query = `SELECT id, target_collection, incentive_percentage FROM special_grid_rules WHERE process_id = $1 ORDER BY target_collection ASC`;
            params = [process_id];
        }
        const { rows } = await pool.query(query, params);
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Error fetching special grid:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { grid, process_id } = body;

        if (!Array.isArray(grid)) {
            return NextResponse.json({ success: false, error: 'grid array is required' }, { status: 400 });
        }
        if (!process_id) {
            return NextResponse.json({ success: false, error: 'process_id is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM special_grid_rules WHERE process_id = $1', [process_id]);
            
            for (const row of grid) {
                if (row.target_collection != null && row.incentive_percentage != null) {
                    await client.query(
                        `INSERT INTO special_grid_rules (target_collection, incentive_percentage, process_id) VALUES ($1, $2, $3)`,
                        [parseFloat(row.target_collection), parseFloat(row.incentive_percentage), process_id]
                    );
                }
            }
            await client.query('COMMIT');
            return NextResponse.json({ success: true });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error updating special grid:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
