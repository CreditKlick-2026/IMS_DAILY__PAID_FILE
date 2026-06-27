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

        let tenuredRes, vintageRes, leadershipRes, specialRes;

        if (process_id) {
            tenuredRes = await pool.query(`SELECT * FROM associate_tenured_grid WHERE process_id = $1 ORDER BY target_collection ASC`, [process_id]);
            vintageRes = await pool.query(`SELECT * FROM associate_vintage_grid WHERE process_id = $1 ORDER BY target_collection ASC`, [process_id]);
            leadershipRes = await pool.query(`SELECT * FROM leadership_grid WHERE process_id = $1 ORDER BY target_collection ASC`, [process_id]);
            specialRes = await pool.query(`SELECT * FROM special_grid_rules WHERE process_id = $1 ORDER BY target_collection ASC`, [process_id]);
        } else {
            tenuredRes = await pool.query(`SELECT * FROM associate_tenured_grid WHERE process_id IS NULL ORDER BY target_collection ASC`);
            vintageRes = await pool.query(`SELECT * FROM associate_vintage_grid WHERE process_id IS NULL ORDER BY target_collection ASC`);
            leadershipRes = await pool.query(`SELECT * FROM leadership_grid WHERE process_id IS NULL ORDER BY target_collection ASC`);
            specialRes = await pool.query(`SELECT * FROM special_grid_rules WHERE process_id IS NULL ORDER BY target_collection ASC`);
        }

        return NextResponse.json({ 
            success: true, 
            data: {
                associateTenured: tenuredRes.rows,
                associateVintage: vintageRes.rows,
                leadership: leadershipRes.rows,
                specialExceptions: specialRes.rows
            }
        });
    } catch (error: any) {
        console.error('Error fetching master grids:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { gridName, data, process_id } = body;

        if (!Array.isArray(data)) {
            return NextResponse.json({ success: false, error: 'data array is required' }, { status: 400 });
        }
        if (!process_id) {
            return NextResponse.json({ success: false, error: 'process_id is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            if (gridName === 'associateTenured') {
                await client.query('DELETE FROM associate_tenured_grid WHERE process_id = $1', [process_id]);
                for (const row of data) {
                    await client.query(
                        `INSERT INTO associate_tenured_grid (target_collection, under_16k, between_16_18k, between_18_24k, over_24k, process_id) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [row.target_collection, row.under_16k, row.between_16_18k, row.between_18_24k, row.over_24k, process_id]
                    );
                }
            } else if (gridName === 'associateVintage') {
                await client.query('DELETE FROM associate_vintage_grid WHERE process_id = $1', [process_id]);
                for (const row of data) {
                    await client.query(
                        `INSERT INTO associate_vintage_grid (target_collection, m0, m1, m2, m3, process_id) VALUES ($1, $2, $3, $4, $5, $6)`,
                        [row.target_collection, row.m0, row.m1, row.m2, row.m3, process_id]
                    );
                }
            } else if (gridName === 'leadership') {
                await client.query('DELETE FROM leadership_grid WHERE process_id = $1', [process_id]);
                for (const row of data) {
                    await client.query(
                        `INSERT INTO leadership_grid (role, target_collection, incentive_percentage, process_id) VALUES ($1, $2, $3, $4)`,
                        [row.role, row.target_collection, row.incentive_percentage, process_id]
                    );
                }
            } else if (gridName === 'specialExceptions') {
                await client.query('DELETE FROM special_grid_rules WHERE process_id = $1', [process_id]);
                for (const row of data) {
                    await client.query(`
                        INSERT INTO special_grid_rules (target_collection, incentive_percentage, process_id)
                        VALUES ($1, $2, $3)
                    `, [row.target_collection, row.incentive_percentage, process_id]);
                }
            } else {
                throw new Error('Invalid grid name');
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
        console.error('Error updating master grid:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
