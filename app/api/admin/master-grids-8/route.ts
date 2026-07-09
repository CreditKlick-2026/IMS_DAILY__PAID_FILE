import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'master_grids_8.json');

async function initData() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const initialData = {
            associateSlabs: [],
            tlSlabs: [],
            amSlabs: [],
            riders: []
        };
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

export async function GET() {
    try {
        await initData();
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
