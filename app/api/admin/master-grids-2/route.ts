import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'master_grids_2.json');

async function initData() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const initialData = {
            associateTenured: [],
            associateVintage: [],
            leadership: [],
            specialExceptions: [],
            column_mappings: {
                collection: 'total_money_collected',
                salary: 'ctc',
                doj: 'date_of_joining',
                designation: 'job_title',
                tl_name: 'tl_name',
                am_name: 'am_name',
                employee_id: 'employee_no',
                employee_code: 'employee_code',
                employee_name: 'employee_name'
            },
            tenured_salary_ranges: [
                { key: 'under_16k', min: 0, max: 15999, label: '<16k (%)' },
                { key: 'between_16_18k', min: 16000, max: 17999, label: '16k-18k (%)' },
                { key: 'between_18_24k', min: 18000, max: 23999, label: '18k-24k (%)' },
                { key: 'over_24k', min: 24000, max: 9999999, label: '>24k (%)' }
            ]
        };
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

export async function GET() {
    try {
        await initData();
        const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        if (!data.column_mappings) {
            data.column_mappings = {
                collection: 'total_money_collected',
                salary: 'ctc',
                doj: 'date_of_joining',
                designation: 'job_title',
                tl_name: 'tl_name',
                am_name: 'am_name',
                employee_id: 'employee_no',
                employee_code: 'employee_code',
                employee_name: 'employee_name'
            };
            await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        }
        if (!data.tenured_salary_ranges) {
            data.tenured_salary_ranges = [
                { key: 'under_16k', min: 0, max: 15999, label: '<16k (%)' },
                { key: 'between_16_18k', min: 16000, max: 17999, label: '16k-18k (%)' },
                { key: 'between_18_24k', min: 18000, max: 23999, label: '18k-24k (%)' },
                { key: 'over_24k', min: 24000, max: 9999999, label: '>24k (%)' }
            ];
            await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        }
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initData();
        const { gridName, data } = await req.json();
        if (!gridName || !data) {
            return NextResponse.json({ success: false, message: 'Missing gridName or data' }, { status: 400 });
        }
        const fileData = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
        fileData[gridName] = data;
        await fs.writeFile(DATA_FILE, JSON.stringify(fileData, null, 2));
        return NextResponse.json({ success: true, message: 'Grid 2 updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
