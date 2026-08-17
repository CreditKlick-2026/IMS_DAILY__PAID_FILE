import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'master_grids.json');

export async function GET() {
  try {
    // 1. Fetch real DPF operational records
    const dpfQuery = `
      SELECT 
        id, 
        account_no, 
        employee_code, 
        employee_name, 
        client, 
        product, 
        bucket, 
        location, 
        money_collected, 
        recovery_or_upgrade, 
        payment_mode, 
        tl_name, 
        am, 
        aph, 
        ph, 
        upload_at
      FROM dpf_records 
      WHERE (is_duplicate = FALSE OR is_duplicate IS NULL)
      ORDER BY id DESC 
      LIMIT 1000
    `;
    const dpfResult = await pool.query(dpfQuery);

    // 2. Fetch real Keka Employee Master
    const kekaQuery = `
      SELECT 
        employee_id, 
        name, 
        designation, 
        salary, 
        doj, 
        doc, 
        location, 
        client, 
        product, 
        tl_name, 
        am_name, 
        is_special
      FROM employee_keka_data
      ORDER BY employee_id ASC
    `;
    const kekaResult = await pool.query(kekaQuery);

    // 3. Load Master Grid 1 configuration & rules
    let masterGrids: any = {
      associateTenured: [],
      associateVintage: [],
      leadership: [],
      specialExceptions: [],
      tenured_salary_ranges: [
        { key: 'under_16k', min: 0, max: 15999, label: '<16k (%)' },
        { key: 'between_16_18k', min: 16000, max: 17999, label: '16k-18k (%)' },
        { key: 'between_18_24k', min: 18000, max: 23999, label: '18k-24k (%)' },
        { key: 'over_24k', min: 24000, max: 9999999, label: '>24k (%)' }
      ]
    };
    try {
      const rawData = await fs.readFile(DATA_FILE, 'utf-8');
      masterGrids = JSON.parse(rawData);
    } catch {
      // Use defaults if file not present
    }

    // 4. Aggregate collections by employee and team
    const aggregatedDpfQuery = `
      SELECT 
        r.employee_code,
        r.employee_name,
        r.location,
        r.client,
        r.product,
        r.bucket,
        r.tl_name,
        r.am as am_name,
        COALESCE(SUM(CAST(NULLIF(regexp_replace(r.money_collected::text, '[^0-9.]', '', 'g'), '') AS NUMERIC)), 0) as total_collected,
        COALESCE(SUM(CASE WHEN LOWER(r.recovery_or_upgrade) LIKE '%upgrade%' THEN CAST(NULLIF(regexp_replace(r.money_collected::text, '[^0-9.]', '', 'g'), '') AS NUMERIC) ELSE 0 END), 0) as total_upgrade_collected,
        COALESCE(SUM(CASE WHEN LOWER(r.recovery_or_upgrade) LIKE '%recovery%' THEN CAST(NULLIF(regexp_replace(r.money_collected::text, '[^0-9.]', '', 'g'), '') AS NUMERIC) ELSE 0 END), 0) as total_recovery_collected,
        COUNT(*) as total_transactions
      FROM dpf_records r
      WHERE (r.is_duplicate = FALSE OR r.is_duplicate IS NULL) AND r.employee_code IS NOT NULL AND r.employee_code != ''
      GROUP BY r.employee_code, r.employee_name, r.location, r.client, r.product, r.bucket, r.tl_name, r.am
      ORDER BY total_collected DESC
    `;
    const aggResult = await pool.query(aggregatedDpfQuery);

    const kekaMap = new Map();
    kekaResult.rows.forEach(emp => {
      if (emp.employee_id) {
        kekaMap.set(emp.employee_id.toUpperCase().trim(), emp);
      }
    });

    // Build TL & AM team aggregates
    const tlTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};
    const amTeamData: Record<string, { collection: number, headcount: Set<string> }> = {};

    aggResult.rows.forEach(row => {
      const coll = parseFloat(row.total_collected) || 0;
      const empCode = (row.employee_code || '').trim();

      if (row.tl_name) {
        const tl = row.tl_name.toLowerCase().trim();
        if (!tlTeamData[tl]) tlTeamData[tl] = { collection: 0, headcount: new Set() };
        tlTeamData[tl].collection += coll;
        if (empCode) tlTeamData[tl].headcount.add(empCode);
      }

      if (row.am_name) {
        const am = row.am_name.toLowerCase().trim();
        if (!amTeamData[am]) amTeamData[am] = { collection: 0, headcount: new Set() };
        amTeamData[am].collection += coll;
        if (empCode) amTeamData[am].headcount.add(empCode);
      }
    });

    const now = new Date();
    const liveCalculations = aggResult.rows.map(row => {
      const empCode = (row.employee_code || '').toUpperCase().trim();
      const kekaEmp = kekaMap.get(empCode);

      const salary = kekaEmp?.salary ? parseFloat(kekaEmp.salary) : 0;
      const doj = kekaEmp?.doj ? new Date(kekaEmp.doj) : null;
      const rawDesig = (kekaEmp?.designation || '').toLowerCase();
      const empName = row.employee_name || kekaEmp?.name || '—';
      const nameKey = empName.toLowerCase().trim();

      let designation = 'Associate';
      if (rawDesig.includes('manager') || rawDesig === 'am') designation = 'AM';
      else if (rawDesig === 'atl' || rawDesig.includes('assistant team leader')) designation = 'ATL';
      else if (rawDesig.includes('leader') || rawDesig === 'tl') designation = 'TL';

      let vintageMonths = 0;
      if (doj && !isNaN(doj.getTime())) {
        vintageMonths = Math.max(0, (now.getFullYear() - doj.getFullYear()) * 12 + (now.getMonth() - doj.getMonth()));
      }

      const totalColl = parseFloat(row.total_collected) || 0;
      let matchedIncentive = 0;
      let matchedPct = 0;
      let slabInfo = 'No Slab Met';

      // 1. Special Exceptions Check (Highest priority for Associate high achievers)
      const specialRules = [...(masterGrids.specialExceptions || [])].sort((a: any, b: any) => parseFloat(b.target_collection || 0) - parseFloat(a.target_collection || 0));
      const matchedSpecial = specialRules.find((r: any) => totalColl >= parseFloat(r.target_collection || 0));

      if (designation === 'Associate' && matchedSpecial && (kekaEmp?.is_special || totalColl >= 350000)) {
        matchedPct = parseFloat(matchedSpecial.incentive_percentage || 0);
        matchedIncentive = (totalColl * matchedPct) / 100;
        slabInfo = `Special Exception >= ₹${matchedSpecial.target_collection} (${matchedPct}%)`;
      } else if (designation === 'TL') {
        // Team Leader calculation
        const tlKeyMatch = Object.keys(tlTeamData).find(tl => nameKey.includes(tl) || (row.tl_name && row.tl_name.toLowerCase().includes(tl)));
        const tlData = tlKeyMatch ? tlTeamData[tlKeyMatch] : { collection: totalColl, headcount: new Set([empCode]) };
        const teamColl = tlData.collection;
        const headcount = tlData.headcount.size || 1;
        const pcp = teamColl / headcount;

        const sortedLead = [...(masterGrids.leadership || [])].filter((r: any) => r.role === 'TL').sort((a: any, b: any) => parseFloat(b.target_collection || 0) - parseFloat(a.target_collection || 0));
        const matched = sortedLead.find((s: any) => pcp >= parseFloat(s.target_collection || 0) || teamColl >= parseFloat(s.target_collection || 0));
        if (matched) {
          matchedPct = parseFloat(matched.incentive_percentage || 0);
          matchedIncentive = (teamColl * matchedPct) / 100;
          slabInfo = `TL Team ₹${Math.round(teamColl).toLocaleString()} (HC: ${headcount}, PCP: ₹${Math.round(pcp).toLocaleString()} @ ${matchedPct}%)`;
        } else {
          slabInfo = `TL Team ₹${Math.round(teamColl).toLocaleString()} (HC: ${headcount}, PCP: ₹${Math.round(pcp).toLocaleString()} - Below Target)`;
        }
      } else if (designation === 'AM') {
        // Assistant Manager calculation
        const amKeyMatch = Object.keys(amTeamData).find(am => nameKey.includes(am) || (row.am_name && row.am_name.toLowerCase().includes(am)));
        const amData = amKeyMatch ? amTeamData[amKeyMatch] : { collection: totalColl, headcount: new Set([empCode]) };
        const teamColl = amData.collection;
        const headcount = amData.headcount.size || 1;

        const sortedLead = [...(masterGrids.leadership || [])].filter((r: any) => r.role === 'AM').sort((a: any, b: any) => parseFloat(b.target_collection || 0) - parseFloat(a.target_collection || 0));
        const matched = sortedLead.find((s: any) => (teamColl / headcount) >= parseFloat(s.target_collection || 0) || teamColl >= parseFloat(s.target_collection || 0));
        if (matched) {
          matchedPct = parseFloat(matched.incentive_percentage || 0);
          let baseIncentive = (teamColl * matchedPct) / 100;
          let bonus = 0;
          const target = Number(matched.target_collection);
          if (target >= 275000) bonus = baseIncentive * 0.25;
          else if (target >= 250000) bonus = baseIncentive * 0.20;
          else if (target >= 240000) bonus = baseIncentive * 0.15;
          else if (target >= 235000) bonus = baseIncentive * 0.10;

          matchedIncentive = baseIncentive + bonus;
          slabInfo = `AM Floor ₹${Math.round(teamColl).toLocaleString()} (@ ${matchedPct}% + ₹${Math.round(bonus).toLocaleString()} Bonus)`;
        } else {
          slabInfo = `AM Floor ₹${Math.round(teamColl).toLocaleString()} (Below Target)`;
        }
      } else if (vintageMonths <= 3 && (masterGrids.associateVintage || []).length > 0) {
        // Vintage Associate (0-3 Months)
        const monthKey = `m${Math.min(3, vintageMonths)}`;
        const sortedVintage = [...(masterGrids.associateVintage || [])].sort((a: any, b: any) => parseFloat(b.target_collection || 0) - parseFloat(a.target_collection || 0));
        const matched = sortedVintage.find((s: any) => totalColl >= parseFloat(s.target_collection || 0));
        if (matched) {
          matchedIncentive = parseFloat(matched[monthKey] || 0);
          matchedPct = totalColl > 0 ? Number(((matchedIncentive / totalColl) * 100).toFixed(2)) : 0;
          slabInfo = `Vintage M${vintageMonths} >= ₹${matched.target_collection} (Fixed ₹${matchedIncentive})`;
        } else {
          slabInfo = `Vintage M${vintageMonths} (Collection ₹${totalColl} Below Slabs)`;
        }
      } else {
        // Tenured Associate (>3 Months)
        const sortedTenured = [...(masterGrids.associateTenured || [])].sort((a: any, b: any) => parseFloat(b.target_collection || 0) - parseFloat(a.target_collection || 0));
        const matched = sortedTenured.find((s: any) => totalColl >= parseFloat(s.target_collection || 0));
        if (matched) {
          let colKey = 'under_16k';
          if (salary >= 24000) colKey = 'over_24k';
          else if (salary >= 18000) colKey = 'between_18_24k';
          else if (salary >= 16000) colKey = 'between_16_18k';

          matchedPct = parseFloat(matched[colKey] || 0);
          matchedIncentive = (totalColl * matchedPct) / 100;
          slabInfo = `Tenured Target >= ₹${matched.target_collection} (Salary: ₹${salary.toLocaleString()}, Slab: ${matchedPct}%)`;
        } else {
          slabInfo = `Tenured (Collection ₹${totalColl} Below Min Target)`;
        }
      }

      return {
        employee_code: row.employee_code,
        employee_name: empName,
        designation,
        location: row.location || kekaEmp?.location || '—',
        client: row.client || kekaEmp?.client || '—',
        product: row.product || kekaEmp?.product || '—',
        salary,
        doj: doj ? doj.toISOString().split('T')[0] : '—',
        vintage_months: vintageMonths,
        total_collected: totalColl,
        transactions: parseInt(row.total_transactions) || 0,
        tl_name: row.tl_name || kekaEmp?.tl_name || '—',
        am_name: row.am_name || kekaEmp?.am_name || '—',
        slab_info: slabInfo,
        incentive_pct: matchedPct,
        calculated_incentive: matchedIncentive
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        dpfRecords: dpfResult.rows,
        kekaEmployees: kekaResult.rows,
        masterGrids,
        liveCalculations
      }
    });
  } catch (error: any) {
    console.error("Error fetching Excel View data:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
