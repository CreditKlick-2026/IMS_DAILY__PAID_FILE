import { NextResponse } from 'next/server';
import { getIncentiveData } from './service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return getIncentiveData(req);
}
