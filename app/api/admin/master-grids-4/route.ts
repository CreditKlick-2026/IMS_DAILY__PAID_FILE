import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'master_grids_4.json');

export async function GET() {
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
