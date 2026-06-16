import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function GET(req: Request) {
    try {
        const tenuredRes = await pool.query(`SELECT * FROM associate_tenured_grid ORDER BY target_collection ASC`);
        const vintageRes = await pool.query(`SELECT * FROM associate_vintage_grid ORDER BY target_collection ASC`);
        const leadershipRes = await pool.query(`SELECT * FROM leadership_grid ORDER BY target_collection ASC`);
        const specialRes = await pool.query(`SELECT * FROM special_grid_rules ORDER BY target_collection ASC`);

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
        const { gridName, data } = body;

        if (!Array.isArray(data)) {
            return NextResponse.json({ success: false, error: 'data array is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            if (gridName === 'associateTenured') {
                await client.query('TRUNCATE TABLE associate_tenured_grid');
                for (const row of data) {
                    await client.query(
                        `INSERT INTO associate_tenured_grid (target_collection, under_16k, between_16_18k, between_18_24k, over_24k) VALUES ($1, $2, $3, $4, $5)`,
                        [row.target_collection, row.under_16k, row.between_16_18k, row.between_18_24k, row.over_24k]
                    );
                }
            } else if (gridName === 'associateVintage') {
                await client.query('TRUNCATE TABLE associate_vintage_grid');
                for (const row of data) {
                    await client.query(
                        `INSERT INTO associate_vintage_grid (target_collection, m0, m1, m2, m3) VALUES ($1, $2, $3, $4, $5)`,
                        [row.target_collection, row.m0, row.m1, row.m2, row.m3]
                    );
                }
            } else if (gridName === 'leadership') {
                await client.query('TRUNCATE TABLE leadership_grid');
                for (const row of data) {
                    await client.query(
                        `INSERT INTO leadership_grid (role, target_collection, incentive_percentage) VALUES ($1, $2, $3)`,
                        [row.role, row.target_collection, row.incentive_percentage]
                    );
                }
            } else if (gridName === 'specialExceptions') {
                await client.query('TRUNCATE TABLE special_grid_rules');
                for (const row of data) {
                    await client.query(`
                        INSERT INTO special_grid_rules (target_collection, incentive_percentage)
                        VALUES ($1, $2)
                    `, [row.target_collection, row.incentive_percentage]);
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
