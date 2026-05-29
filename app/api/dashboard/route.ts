import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('auth_session')?.value;
  if (!sessionStr) return false;
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    return false;
  }
}

export async function GET(req: Request) {
  const user = await checkAuth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Filter by the month/year of upload_at
    const dateFilter = `EXTRACT(MONTH FROM upload_at) = $1 AND EXTRACT(YEAR FROM upload_at) = $2`;

    // Helper to extract amounts
    const safeNum = (val: string) => parseFloat(val) || 0;

    // Run aggregations in parallel for better performance
    const [
      totalRes,
      clientRes,
      bucketRes,
      productRes,
      locationRes,
      tlRes,
      amRes,
      paymentRes
    ] = await Promise.all([
      query(`
        SELECT COUNT(id) as total_files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as total_collected 
        FROM dpf_records 
        WHERE ${dateFilter}
      `, [month, year]),
      
      query(`
        SELECT client as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected
        FROM dpf_records WHERE ${dateFilter} AND client IS NOT NULL GROUP BY client ORDER BY collected DESC
      `, [month, year]),

      query(`
        SELECT bucket as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected
        FROM dpf_records WHERE ${dateFilter} AND bucket IS NOT NULL GROUP BY bucket ORDER BY collected DESC
      `, [month, year]),

      query(`
        SELECT product as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected
        FROM dpf_records WHERE ${dateFilter} AND product IS NOT NULL GROUP BY product ORDER BY collected DESC
      `, [month, year]),

      query(`
        SELECT location as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected
        FROM dpf_records WHERE ${dateFilter} AND location IS NOT NULL GROUP BY location ORDER BY collected DESC
      `, [month, year]),

      query(`
        SELECT tl_name as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected
        FROM dpf_records WHERE ${dateFilter} AND tl_name IS NOT NULL GROUP BY tl_name ORDER BY collected DESC LIMIT 5
      `, [month, year]),

      query(`
        SELECT am as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected
        FROM dpf_records WHERE ${dateFilter} AND am IS NOT NULL GROUP BY am ORDER BY collected DESC LIMIT 5
      `, [month, year]),

      query(`
        SELECT payment_mode as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected
        FROM dpf_records WHERE ${dateFilter} AND payment_mode IS NOT NULL GROUP BY payment_mode ORDER BY collected DESC
      `, [month, year])
    ]);

    const totalCollected = parseFloat(totalRes.rows[0].total_collected);
    const totalFiles = parseInt(totalRes.rows[0].total_files);

    const formatData = (rows: any[]) => rows.map((r: any) => ({
      name: r.name,
      files: parseInt(r.files),
      collected: parseFloat(r.collected),
      percentage: totalCollected > 0 ? (parseFloat(r.collected) / totalCollected) * 100 : 0
    }));

    const data = {
      summary: {
        totalCollected,
        totalFiles,
        topClient: clientRes.rows[0]?.name || 'N/A',
        topBucket: bucketRes.rows[0]?.name || 'N/A'
      },
      clients: formatData(clientRes.rows),
      buckets: formatData(bucketRes.rows),
      products: formatData(productRes.rows),
      locations: formatData(locationRes.rows),
      teamLeaders: formatData(tlRes.rows),
      areaManagers: formatData(amRes.rows),
      paymentModes: formatData(paymentRes.rows)
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Dashboard Analytics Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
