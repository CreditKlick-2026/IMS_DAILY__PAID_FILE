import { NextResponse } from 'next/server';
import { Pool } from 'pg';


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function GET(req: Request) {
    try {
        const { rows } = await pool.query(`SELECT id, target_collection, incentive_percentage FROM special_grid_rules ORDER BY target_collection ASC`);
        return NextResponse.json({ success: true, data: rows });
    } catch (error: any) {
        console.error('Error fetching special grid:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { grid } = body;

        if (!Array.isArray(grid)) {
            return NextResponse.json({ success: false, error: 'grid array is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('TRUNCATE TABLE special_grid_rules');
            
            for (const row of grid) {
                if (row.target_collection != null && row.incentive_percentage != null) {
                    await client.query(
                        `INSERT INTO special_grid_rules (target_collection, incentive_percentage) VALUES ($1, $2)`,
                        [parseFloat(row.target_collection), parseFloat(row.incentive_percentage)]
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
