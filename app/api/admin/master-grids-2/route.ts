import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
    const gridNum = req.url.match(/master-grids-(\d+)/)?.[1] || '2';
    const DATA_FILE = path.join(process.cwd(), 'data', `master_grids_${gridNum}.json`);
    try {
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: true, data: { associateSlabs: [], tlSlabs: [], amSlabs: [], riders: [] } });
    }
}

export async function POST(req: Request) {
    const gridNum = req.url.match(/master-grids-(\d+)/)?.[1] || '2';
    const DATA_FILE = path.join(process.cwd(), 'data', `master_grids_${gridNum}.json`);
    try {
        const data = await req.json();
        const payload = data.data && Object.keys(data).length === 2 && data.gridName ? data.data : data; 
        
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2));
        return NextResponse.json({ success: true, message: `Grid ${gridNum} updated successfully` });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
