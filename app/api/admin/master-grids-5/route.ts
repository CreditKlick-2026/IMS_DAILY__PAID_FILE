import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'master_grids_5.json');

export async function GET() {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
        return NextResponse.json({ success: true, data });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Failed to read Grid 5 data' }, { status: 500 });
    }
}
