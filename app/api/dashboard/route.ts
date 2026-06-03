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

    const multiFilters: { col: string; vals: string[] }[] = [];
    const filterKeys = [
      { param: 'tl_name', col: 'tl_name' },
      { param: 'client', col: 'client' },
      { param: 'product', col: 'product' },
      { param: 'bucket', col: 'bucket' },
      { param: 'location', col: 'location' },
      { param: 'employee_code', col: 'employee_code' },
    ];
    filterKeys.forEach(({ param, col }) => {
      const vals = searchParams.getAll(param).filter(Boolean);
      if (vals.length > 0) multiFilters.push({ col, vals });
    });

    let baseParams: any[] = [month, year];
    let extraConditions = '';
    multiFilters.forEach(({ col, vals }) => {
      const placeholder = `$${baseParams.length + 1}`;
      extraConditions += ` AND ${col} = ANY(${placeholder})`;
      baseParams.push(vals);
    });

    // Exclude duplicates AND frauds from all calculations!
    const dateFilter = `EXTRACT(MONTH FROM upload_at) = $1 AND EXTRACT(YEAR FROM upload_at) = $2 AND (is_duplicate = FALSE OR is_duplicate IS NULL) AND fraud_flag IS NULL${extraConditions}`;
    // Separate filter for stats (include all)
    const dateFilterAll = `EXTRACT(MONTH FROM upload_at) = $1 AND EXTRACT(YEAR FROM upload_at) = $2${extraConditions}`;

    const [
      totalRes, clientRes, bucketRes, productRes, locationRes,
      tlRes, amRes, paymentRes,
      dailyRes, agentRes, aphRes, phRes, summaryExtRes,
      dupStatsRes
    ] = await Promise.all([
      query(`SELECT COUNT(id) as total_files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as total_collected FROM dpf_records WHERE ${dateFilter}`, baseParams),
      query(`SELECT client as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND client IS NOT NULL GROUP BY client ORDER BY collected DESC`, baseParams),
      query(`SELECT bucket as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND bucket IS NOT NULL GROUP BY bucket ORDER BY collected DESC`, baseParams),
      query(`SELECT product as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND product IS NOT NULL GROUP BY product ORDER BY collected DESC`, baseParams),
      query(`SELECT location as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND location IS NOT NULL GROUP BY location ORDER BY collected DESC`, baseParams),
      query(`SELECT tl_name as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND tl_name IS NOT NULL GROUP BY tl_name ORDER BY collected DESC LIMIT 5`, baseParams),
      query(`SELECT am as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND am IS NOT NULL GROUP BY am ORDER BY collected DESC LIMIT 5`, baseParams),
      query(`SELECT payment_mode as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND payment_mode IS NOT NULL GROUP BY payment_mode ORDER BY collected DESC`, baseParams),
      // Daily trend
      query(`SELECT EXTRACT(DAY FROM upload_at)::int as day, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND upload_at IS NOT NULL GROUP BY EXTRACT(DAY FROM upload_at) ORDER BY day ASC`, baseParams),
      // Agent performance
      query(`SELECT employee_name as name, employee_code as code, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected, COUNT(DISTINCT account_no) as unique_accounts FROM dpf_records WHERE ${dateFilter} AND employee_name IS NOT NULL GROUP BY employee_name, employee_code ORDER BY collected DESC LIMIT 10`, baseParams),
      // APH
      query(`SELECT aph as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND aph IS NOT NULL AND aph != '' GROUP BY aph ORDER BY collected DESC LIMIT 10`, baseParams),
      // PH
      query(`SELECT ph as name, COUNT(id) as files, COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) as collected FROM dpf_records WHERE ${dateFilter} AND ph IS NOT NULL AND ph != '' GROUP BY ph ORDER BY collected DESC LIMIT 10`, baseParams),
      // Extended summary
      query(`SELECT COUNT(DISTINCT account_no) as unique_accounts, CASE WHEN COUNT(id) > 0 THEN COALESCE(SUM(CAST(money_collected AS NUMERIC)), 0) / COUNT(id) ELSE 0 END as avg_per_file, COUNT(DISTINCT employee_name) as active_agents, COUNT(DISTINCT tl_name) as active_tls FROM dpf_records WHERE ${dateFilter}`, baseParams),
      // Duplicate and Fraud stats (counts ALL including duplicates/frauds)
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE is_duplicate = TRUE AND fraud_flag IS NULL) as dup_count, 
          COALESCE(SUM(CAST(money_collected AS NUMERIC)) FILTER (WHERE is_duplicate = TRUE AND fraud_flag IS NULL), 0) as dup_amount,
          COUNT(*) FILTER (WHERE fraud_flag IS NOT NULL) as fraud_count,
          COALESCE(SUM(CAST(money_collected AS NUMERIC)) FILTER (WHERE fraud_flag IS NOT NULL), 0) as fraud_amount,
          COUNT(*) as total_all 
        FROM dpf_records WHERE ${dateFilterAll}
      `, baseParams),
      // Fraud breakdown
      query(`
        SELECT fraud_flag as name, COUNT(id) as count 
        FROM dpf_records 
        WHERE ${dateFilterAll} AND fraud_flag IS NOT NULL 
        GROUP BY fraud_flag 
        ORDER BY count DESC
      `, baseParams)
    ]);

    const totalCollected = parseFloat(totalRes.rows[0].total_collected);
    const totalFiles = parseInt(totalRes.rows[0].total_files);

    const formatData = (rows: any[]) => rows.map((r: any) => ({
      name: r.name,
      files: parseInt(r.files),
      collected: parseFloat(r.collected),
      percentage: totalCollected > 0 ? (parseFloat(r.collected) / totalCollected) * 100 : 0
    }));

    const ext = summaryExtRes.rows[0] || {};
    const dupStats = dupStatsRes.rows[0] || {};

    const data = {
      summary: {
        totalCollected, totalFiles,
        topClient: clientRes.rows[0]?.name || 'N/A',
        topBucket: bucketRes.rows[0]?.name || 'N/A',
        uniqueAccounts: parseInt(ext.unique_accounts) || 0,
        avgPerFile: parseFloat(ext.avg_per_file) || 0,
        activeAgents: parseInt(ext.active_agents) || 0,
        activeTLs: parseInt(ext.active_tls) || 0,
        // Blocked stats
        duplicateCount: parseInt(dupStats.dup_count) || 0,
        duplicateAmount: parseFloat(dupStats.dup_amount) || 0,
        fraudCount: parseInt(dupStats.fraud_count) || 0,
        fraudAmount: parseFloat(dupStats.fraud_amount) || 0,
        totalWithDuplicates: parseInt(dupStats.total_all) || 0
      },
      fraudBreakdown: (arguments[14]?.rows || []).map((r: any) => ({ name: r.name, count: parseInt(r.count) })),
      clients: formatData(clientRes.rows),
      buckets: formatData(bucketRes.rows),
      products: formatData(productRes.rows),
      locations: formatData(locationRes.rows),
      teamLeaders: formatData(tlRes.rows),
      areaManagers: formatData(amRes.rows),
      paymentModes: formatData(paymentRes.rows),
      dailyTrend: dailyRes.rows.map((r: any) => ({ day: parseInt(r.day), files: parseInt(r.files), collected: parseFloat(r.collected) })),
      agents: agentRes.rows.map((r: any) => ({
        name: r.name, code: r.code, files: parseInt(r.files), collected: parseFloat(r.collected),
        uniqueAccounts: parseInt(r.unique_accounts),
        percentage: totalCollected > 0 ? (parseFloat(r.collected) / totalCollected) * 100 : 0
      })),
      aphBreakdown: formatData(aphRes.rows),
      phBreakdown: formatData(phRes.rows)
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Dashboard Analytics Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
