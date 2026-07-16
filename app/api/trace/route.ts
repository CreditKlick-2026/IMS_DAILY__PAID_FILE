import { NextResponse } from 'next/server';
import * as fs_promises from 'fs/promises';
import * as path from 'path';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(amt: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amt);
}

async function getSession() {
  const cookieStore = await cookies();
  const s = cookieStore.get('auth_session')?.value;
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

function parseGrid2Value(val: any): number | null {
  if (val === '-' || val === '' || val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const clean = String(val).replace(/,/g, '').replace(/[<>]/g, '').trim();
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

function getGrid2IncentivePercent(
  collection: number, client: string, product: string,
  vintageDays: number, associateSlabs: any[]
): number {
  const nc = client.toLowerCase().replace('bank', '').trim();
  const np = product.toLowerCase();
  const matching = associateSlabs.filter(s => {
    const sc = String(s.client || '').toLowerCase().replace('bank', '').trim();
    const sp = String(s.product || '').toLowerCase();
    return sc.includes(nc) && sp.includes(np);
  });
  if (!matching.length) return 0;
  let best = 0;
  for (const s of matching) {
    const v = String(s.vintage || '').trim();
    if (v.includes('<90') && vintageDays >= 90) continue;
    if (v.includes('>91') && vintageDays <= 90) continue;
    let minStr = String(s.min || '').trim();
    let maxStr = String(s.max || '').trim();
    let minNum = parseGrid2Value(minStr);
    let maxNum = parseGrid2Value(maxStr);
    let match = true;
    if (minStr.includes('<')) { if (minNum !== null && collection >= minNum) match = false; }
    else if (minStr.includes('>')) { if (minNum !== null && collection <= minNum) match = false; }
    else if (minNum !== null) { if (collection < minNum) match = false; }
    if (maxStr.includes('<')) { if (maxNum !== null && collection >= maxNum) match = false; }
    else if (maxStr.includes('>')) { if (maxNum !== null && collection <= maxNum) match = false; }
    else if (maxNum !== null) { if (collection > maxNum) match = false; }
    if (match) { const p = parseFloat(s.payout_pct) / 100 || 0; if (p > best) best = p; }
  }
  return best;
}

function getGrid3IncentivePercent(value: number, slabs: any[], isPcp = false): number {
  if (!slabs || !slabs.length) return 0;
  let best = 0;
  for (const s of slabs) {
    const min = isPcp ? (s.pcp_min || 0) : (s.min || 0);
    const max = isPcp ? (s.pcp_max === '-' ? Infinity : s.pcp_max) : (s.max === '-' ? Infinity : s.max);
    if (value >= min && value <= max) {
      const p = parseFloat(s.payout_pct) / 100;
      if (p > best) best = p;
    }
  }
  return best;
}

function calculateVintageDays(doc: Date, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - doc.getTime()) / 86400000));
}

// ─── main builder ────────────────────────────────────────────────────────────

function buildInputNode(record: any, gridLabel?: string) {
  const isTlOrAm = ['leader', 'tl', 'atl', 'manager', 'am'].some(k =>
    record.designation?.toLowerCase().includes(k)
  );
  let contentStr = `Name: ${record.name || record.employee_name}\nDesignation: ${record.designation}`;
  const displayVintage = (!record.vintage || record.vintage === 999 || record.vintage === '999') ? 'N/A' : `${record.vintage} Days`;
  if (!isTlOrAm) contentStr += `\nVintage: ${displayVintage}\nSalary: ${record.salary ? fmt(record.salary) : 'N/A'}`;
  contentStr += `\nTotal Collection: ${fmt(record.total_collection)}`;
  if (gridLabel) contentStr += `\nApplied Grid: ${gridLabel}`;
  return {
    id: 'input', type: 'custom', position: { x: 50, y: 150 },
    data: {
      title: 'Input Parameters',
      stripeColor: 'bg-blue-500',
      color: 'bg-blue-50 text-blue-600 border border-blue-100',
      icon: 'user',
      content: contentStr,
    },
  };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

function getGrid5IncentiveAmount(upgradeCollection: number, recoveryCollection: number, slabs: any[], vintageMonths: number, isAssociate = false, teamHeadcount = 0): { amount: number, percent: number } {
    if (!slabs || !slabs.length) return { amount: 0, percent: 0 };
    let upgPct = 0;
    let recPct = 0;

    for (const s of slabs) {
        if (isAssociate) {
            const v = String(s.vintage || '').trim();
            if (v.includes('<90') && vintageMonths >= 3) continue;
            if (v.includes('>91') && vintageMonths < 3) continue;

            // Associate just gets the flat percentage
            upgPct = parseFloat(s.upgrade_pct) / 100 || 0;
            recPct = parseFloat(s.recovery_pct) / 100 || 0;
            break;
        } else {
            const avg = teamHeadcount > 0 ? ((upgradeCollection + recoveryCollection) / teamHeadcount) : 0;
            const min = s.avg_min || 0;
            const max = s.avg_max === '-' ? Infinity : s.avg_max;
            if (avg >= min && avg <= max) {
                upgPct = parseFloat(s.upgrade_pct) / 100 || 0;
                recPct = parseFloat(s.recovery_pct) / 100 || 0;
                break;
            }
        }
    }
    
    const amount = (upgradeCollection * upgPct) + (recoveryCollection * recPct);
    const totalCollection = upgradeCollection + recoveryCollection;
    const percent = totalCollection > 0 ? (amount / totalCollection) : 0;
    
    return { amount, percent };
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const record = await req.json();

    if (!record) return NextResponse.json({ error: 'No record provided' }, { status: 400 });

    // 1. Load grids from DB
    const [gridRes, tenuredRes, vintageRes, leadershipRes] = await Promise.all([
      pool.query(`SELECT * FROM special_grid_rules ORDER BY target_collection DESC`),
      pool.query(`SELECT * FROM associate_tenured_grid ORDER BY target_collection DESC`),
      pool.query(`SELECT * FROM associate_vintage_grid ORDER BY target_collection DESC`),
      pool.query(`SELECT * FROM leadership_grid ORDER BY target_collection DESC`),
    ]);

    const specialGridRules = gridRes.rows.map(r => ({
      target_collection: parseFloat(r.target_collection),
      incentive_percentage: parseFloat(r.incentive_percentage) / 100,
    }));
    const associateTenuredGrid = tenuredRes.rows;
    const associateVintageGrid = vintageRes.rows;
    const leadershipGrid = leadershipRes.rows;

    let masterGrids: any = { tenured_salary_ranges: [] };
    try {
      const rawMaster = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids.json'), 'utf-8');
      masterGrids = JSON.parse(rawMaster);
    } catch {}

    // 2. Load file-based grids
    let grid2Data: any = { associateSlabs: [], tlSlabs: [], amSlabs: [], riders: [] };
    try {
      const raw = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_2.json'), 'utf-8');
      grid2Data = JSON.parse(raw);
    } catch {}

    let grid3Data: any = { associateSlabs: [], tlSlabs: [], amSlabs: [] };
    try {
      const raw3 = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_3.json'), 'utf-8');
      grid3Data = JSON.parse(raw3);
    } catch {}

    
    let grid4Data: any = { associateSlabs: [], tlSlabs: [], amSlabs: [] };
    let grid5Data: any = { associateSlabs: [], tlSlabs: [], amSlabs: [] };
    try {
      const raw4 = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_4.json'), 'utf-8');
      grid4Data = JSON.parse(raw4);
    } catch {}

    // 3. Get assigned grid for the client

    let assignedGrid: string | null = record.assigned_grid || null;
    if (!assignedGrid && record.client && record.product) {
      const cRes = await pool.query(
        `SELECT assigned_grid FROM master_client WHERE name = $1 AND product_type = $2 LIMIT 1`,
        [record.client, record.product]
      );
      if (cRes.rows.length > 0) assignedGrid = cRes.rows[0].assigned_grid || null;
    }

    // 4. Resolve designation
    const desigLower = (record.designation || '').toLowerCase();
    const isSpecial = record.is_special || false;
    const isATL = desigLower === 'atl' || desigLower.includes('assistant team leader');
    const isTL = !isATL && (desigLower.includes('leader') || desigLower === 'tl');
    const isAM = desigLower.includes('manager') || desigLower === 'am';
    const isLeader = isATL || isTL || isAM;

    const vintageMonths = parseInt(record.vintage) || 999;
    const salary = parseFloat(record.salary) || 25000;

    // ── Resolve human-readable grid label ─────────────────────────────
    const noGridAssigned = !assignedGrid || assignedGrid === 'unassigned';
    let gridLabel: string;
    if (assignedGrid === 'grid_4') gridLabel = '🟠 Master Grid 4 (Encore ARC)';
    else if (assignedGrid === 'grid_3') gridLabel = '🟣 Master Grid 3 (SBI Recovery)';
    else if (assignedGrid === 'grid_2') gridLabel = '🔵 Master Grid 2 (Axis / Custom)';
    else if (assignedGrid === 'grid_1') gridLabel = '🟢 Master Grid 1';
    else if (isSpecial) gridLabel = '⭐ Special Exception Grid';
    else if (isLeader) gridLabel = '🟡 Leadership Grid (Standard)';
    else gridLabel = '⚠️ No Grid Assigned';

    // ── Short-circuit for Associates with NO grid ───────────────────
    if (!isLeader && !isSpecial && noGridAssigned) {
      const noGridInputNode = buildInputNode(record, '⚠️ No Grid Assigned');
      const noGridRuleNode = {
        id: 'rule', type: 'custom', position: { x: 450, y: 150 },
        data: {
          title: 'Calculation Engine',
          stripeColor: 'bg-slate-400',
          color: 'bg-slate-50 text-slate-500 border border-slate-200',
          icon: 'settings',
          content: `Grid: ⚠️ No Grid Assigned\nStatus: No incentive calculation\nReason: Client has no grid configured`,
        },
      };
      const noGridFormulaNode = {
        id: 'formula', type: 'custom', position: { x: 950, y: 150 },
        data: {
          title: 'Applied Matrix Lookup — ⚠️ No Grid Assigned',
          stripeColor: 'bg-slate-400',
          color: 'bg-slate-50 text-slate-500 border border-slate-200',
          icon: 'percent',
          content: `No grid is assigned to this client/product.\nPlease go to Rules Engine → Clients\nand assign a grid to enable incentive calculation.`,
        },
      };
      const noGridOutputNode = {
        id: 'output', type: 'custom', position: { x: 1750, y: 150 },
        data: {
          title: 'Final Payout',
          stripeColor: 'bg-slate-400',
          color: 'bg-slate-50 text-slate-500 border border-slate-200',
          icon: 'wallet',
          content: `Earned Incentive: ₹0\nGrid Applied: ⚠️ No Grid Assigned\nAction Required: Assign a grid in Rules Engine`,
        },
      };
      const noGridEdges = [
        { id: 'e1', source: 'input', target: 'rule', animated: false, style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6 4' } },
        { id: 'e2', source: 'rule', target: 'formula', animated: false, style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6 4' } },
        { id: 'e3', source: 'formula', target: 'output', animated: false, style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '6 4' } },
      ];
      return NextResponse.json({
        success: true,
        nodes: [noGridInputNode, noGridRuleNode, noGridFormulaNode, noGridOutputNode],
        edges: noGridEdges,
        meta: { assignedGrid: null, ruleName: 'No Grid Assigned' },
      });
    }

    // ── Node 1: Input ──────────────────────────────────────────────────
    const inputNode = buildInputNode(record, gridLabel);

    // ── Node 2: Rule/Calculation Engine ───────────────────────────────
    let ruleName = '';
    let mathStr = '';

    if (isSpecial) {
      ruleName = 'Special Exception (>=3.5L)';
      mathStr = `Rule: Special Exception Override\nTarget: ${fmt(record.total_collection)}\nApplied Rate: ${record.incentive_percent}`;
    } else if (isATL) {
      ruleName = 'SME Team (ATL) Percent Slab';
      const hc = record.team_headcount || 1;
      const grid = leadershipGrid.filter(r => r.role === 'ATL').sort((a, b) => a.target_collection - b.target_collection);
      let matched = '0%';
      for (let i = grid.length - 1; i >= 0; i--) {
        if (record.team_collection >= grid[i].target_collection * 5) {
          matched = parseFloat(grid[i].incentive_percentage).toFixed(2) + '%'; break;
        }
      }
      mathStr = `Team Collection: ${fmt(record.team_collection)}\nHeadcount: ${hc}\nPCP: ${fmt(record.team_collection / hc)}\nApplied Rate: ${matched}`;
    } else if (isTL) {
      if (assignedGrid === 'grid_4') {
        ruleName = 'Master Grid 4 — Team Leader (Encore ARC)';
        mathStr = `Rule: Grid 4 PCP Logic\nTeam Collection: ${fmt(record.team_collection)}\nHeadcount: ${record.team_headcount || 1}\nPCP: ${fmt(record.pcp || 0)}\nApplied Rate: ${record.incentive_percent}`;
      } else if (assignedGrid === 'grid_3') {
        ruleName = 'Master Grid 3 — Team Leader (SBI Recovery)';
        mathStr = `Rule: Grid 3 PCP Logic\nTeam Collection: ${fmt(record.team_collection)}\nHeadcount: ${record.team_headcount || 1}\nPCP: ${fmt(record.pcp || 0)}\nApplied Rate: ${record.incentive_percent}`;
      } else {
        ruleName = 'Team Leader Percent Slab';
        const hc = record.team_headcount || 1;
        const grid = leadershipGrid.filter(r => r.role === 'TL').sort((a, b) => a.target_collection - b.target_collection);
        let matched = '0%';
        for (let i = grid.length - 1; i >= 0; i--) {
          if (record.team_collection >= grid[i].target_collection * 9) {
            matched = parseFloat(grid[i].incentive_percentage).toFixed(2) + '%'; break;
          }
        }
        mathStr = `Team Collection: ${fmt(record.team_collection)}\nHeadcount: ${hc}\nPCP: ${fmt(record.team_collection / hc)}\nApplied Rate: ${matched}`;
      }
    } else if (isAM) {
      if (assignedGrid === 'grid_4') {
        ruleName = 'Master Grid 4 — Assistant Manager (Encore ARC)';
        mathStr = `Rule: Grid 4 PCP Logic\nTeam Collection: ${fmt(record.team_collection)}\nHeadcount: ${record.team_headcount || 1}\nPCP: ${fmt(record.pcp || 0)}\nApplied Rate: ${record.incentive_percent}`;
      } else if (assignedGrid === 'grid_3') {
        ruleName = 'Master Grid 3 — Assistant Manager (SBI Recovery)';
        const bonusStr = (record.team_incentive < 18000 && record.team_incentive > 0) ? '\nBonus: <18000 — +₹5,000 Applied' : '';
        mathStr = `Rule: Grid 3 PCP Logic\nTeam Collection: ${fmt(record.team_collection)}\nHeadcount: ${record.team_headcount || 1}\nPCP: ${fmt(record.pcp || 0)}\nApplied Rate: ${record.incentive_percent}${bonusStr}`;
      } else {
        ruleName = 'AM Percent Slab';
        const hc = record.team_headcount || 1;
        const grid = leadershipGrid.filter(r => r.role === 'AM').sort((a, b) => a.target_collection - b.target_collection);
        let matched = '0%';
        for (let i = grid.length - 1; i >= 0; i--) {
          if (record.team_collection >= grid[i].target_collection * 30) {
            matched = parseFloat(grid[i].incentive_percentage).toFixed(2) + '%'; break;
          }
        }
        mathStr = `Team Collection: ${fmt(record.team_collection)}\nHeadcount: ${hc}\nPCP: ${fmt(record.team_collection / hc)}\nApplied Rate: ${matched}`;
      }
    } else {
      // Associate
      if (assignedGrid === 'grid_4') {
        ruleName = 'Master Grid 4 — Associate (Encore ARC)';
        mathStr = `Rule: Grid 4 Assigned\nCollection: ${fmt(record.total_collection)}\nVintage: ${record.vintage} Days\nApplied Rate: ${record.incentive_percent}`;
      } else if (assignedGrid === 'grid_3') {
        ruleName = 'Master Grid 3 — Associate (SBI Recovery)';
        mathStr = `Rule: Grid 3 Assigned\nCollection: ${fmt(record.total_collection)}\nApplied Rate: ${record.incentive_percent}`;
      } else if (assignedGrid === 'grid_2') {
        ruleName = 'Master Grid 2 — Slab Percentage';
        mathStr = `Rule: Grid 2 Assigned\nCollection: ${fmt(record.total_collection)}\nVintage: ${record.vintage} Days\nApplied Rate: ${record.incentive_percent}`;
      } else if (vintageMonths <= 120) {
        ruleName = 'Associate Fixed Slab';
        mathStr = `Rule: Vintage <= 120 Days\nLogic: Fixed Tier Table lookup\nTarget: ${fmt(record.total_collection)}`;
      } else {
        ruleName = 'Associate Tenured Percentage';
        mathStr = `Rule: Vintage > 120 Days\nLogic: Percentage logic\nSalary Check: ${fmt(salary)}\nApplied Rate: ${record.incentive_percent}`;
      }
    }

    const ruleNode = {
      id: 'rule', type: 'custom', position: { x: 450, y: 150 },
      data: {
        title: 'Calculation Engine',
        stripeColor: 'bg-amber-500',
        color: 'bg-amber-50 text-amber-600 border border-amber-100',
        icon: 'settings',
        content: `Grid: ${gridLabel}\nSelected Slab: ${ruleName}\n${mathStr}`,
      },
    };

    // ── Node 3: Formula / Applied Matrix ─────────────────────────────
    let formulaNodeText = '';
    let formulaTableData: any = null;
    let formulaTables: any[] | null = null;

    if (isSpecial) {
      formulaNodeText = 'Special Exception Logic. Flat percentage payout based on special targets.';
      const sorted = [...specialGridRules].sort((a, b) => a.target_collection - b.target_collection);
      let hi = -1;
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (record.total_collection >= sorted[i].target_collection) { hi = i; break; }
      }
      formulaTableData = {
        headers: ['Target Collection', 'Incentive %'],
        rows: sorted.map((r, i) => ({
          highlighted: i === hi,
          cells: [
            { val: fmt(r.target_collection), highlighted: i === hi },
            { val: (r.incentive_percentage * 100).toFixed(2) + '%', highlighted: i === hi },
          ],
        })),
      };
    } else if (isATL || isTL) {
      const role = isATL ? 'ATL' : 'TL';
      const hc = record.team_headcount || 1;
      const minMult = isATL ? 5 : 9;
      const mult = Math.max(hc, minMult);
      formulaNodeText = isATL
        ? 'Dual Incentive (Player-Coach). Team payout shown below. Plus Associate-level individual payout.'
        : `Leadership Logic (${role}). Based on Team Total Recovery.`;

      const grid = leadershipGrid.filter(r => r.role === role).sort((a, b) => a.target_collection - b.target_collection);
      let hi = -1;
      for (let i = grid.length - 1; i >= 0; i--) {
        if (record.team_collection >= grid[i].target_collection * mult) { hi = i; break; }
      }

      const headers = role === 'TL'
        ? ['PCP', 'HC', 'Total Recovery', 'Incentive %', 'Amount', 'Additional', 'ZT', 'Deduction']
        : ['PCP', 'HC', 'Total Recovery', 'Incentive %', 'Amount'];

      const teamTableData = {
        title: 'Team Payout (Leadership Logic)',
        headers,
        rows: grid.map((rule, i) => {
          const totalRecovery = rule.target_collection * mult;
          const amt = totalRecovery * (parseFloat(rule.incentive_percentage) / 100);
          let additional = ''; let zt = ''; let deduction = '';
          if (role === 'TL') {
            if (rule.target_collection == 200000) deduction = '1 ZT - 50% Incentive';
            else if (rule.target_collection == 215000) deduction = '2 ZT - 100% Incentive';
            else {
              zt = 'With 0 ZT';
              deduction = fmt(amt * 0.15);
              if (rule.target_collection == 230000) additional = fmt(amt * 0.10);
              else if (rule.target_collection == 250000) additional = fmt(amt * 0.15);
              else if (rule.target_collection == 270000) additional = fmt(amt * 0.20);
              else if (rule.target_collection >= 300000) additional = fmt(amt * 0.25);
            }
          }
          const cells: any[] = [
            { val: fmt(rule.target_collection), highlighted: i === hi },
            { val: String(hc), highlighted: false },
            { val: fmt(totalRecovery), highlighted: false },
            { val: parseFloat(rule.incentive_percentage).toFixed(2) + '%', highlighted: i === hi },
            { val: fmt(amt), highlighted: i === hi },
          ];
          if (role === 'TL') {
            cells.push({ val: additional, highlighted: i === hi });
            cells.push({ val: zt, highlighted: i === hi });
            cells.push({ val: deduction, highlighted: i === hi });
          }
          return { highlighted: i === hi, cells };
        }),
      };

      if (isATL) {
        // Also build individual associate table for ATL
        const indTable = buildAssociateTable(record, vintageMonths, salary, associateVintageGrid, associateTenuredGrid, fmt, masterGrids.tenured_salary_ranges);
        formulaTables = indTable ? [teamTableData, indTable] : [teamTableData];
      } else {
        formulaTableData = teamTableData;
      }

    } else if (isAM) {
      if (assignedGrid === 'grid_4') {
        formulaNodeText = 'Master Grid 4 — AM Logic. PCP-based payout.';
        const sorted = [...(grid4Data.amSlabs || [])].sort((a, b) => (a.pcp_min || 0) - (b.pcp_min || 0));
        const pcp = record.pcp || 0;
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (pcp >= (sorted[i].pcp_min || 0)) { hi = i; break; }
        }
        formulaTableData = {
          title: 'Encore ARC AM Grid',
          headers: ['PCP (Min)', 'HC', 'Payout %', 'Estimated Amount'],
          rows: sorted.map((s: any, i: number) => {
            const amt = (s.pcp_min || 0) * (record.team_headcount || 1) * (parseFloat(s.payout_pct) / 100);
            return {
              highlighted: i === hi,
              cells: [
                { val: fmt(s.pcp_min || 0), highlighted: i === hi },
                { val: String(record.team_headcount || 1), highlighted: false },
                { val: parseFloat(s.payout_pct).toFixed(2) + '%', highlighted: i === hi },
                { val: fmt(amt), highlighted: i === hi },
              ],
            };
          }),
        };
      } else if (assignedGrid === 'grid_3') {
        formulaNodeText = 'Master Grid 3 — AM Logic. PCP-based payout. Bonus ₹5,000 if total < ₹18,000.';
        const sorted = [...(grid3Data.amSlabs || [])].sort((a, b) => (a.pcp_min || 0) - (b.pcp_min || 0));
        const pcp = record.pcp || 0;
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (pcp >= (sorted[i].pcp_min || 0)) { hi = i; break; }
        }
        formulaTableData = {
          title: 'SBI Recovery AM Grid',
          headers: ['PCP (Min)', 'HC', 'Payout %', 'Estimated Amount'],
          rows: sorted.map((s: any, i: number) => {
            const amt = (s.pcp_min || 0) * (record.team_headcount || 1) * (parseFloat(s.payout_pct) / 100);
            return {
              highlighted: i === hi,
              cells: [
                { val: fmt(s.pcp_min || 0), highlighted: i === hi },
                { val: String(record.team_headcount || 1), highlighted: false },
                { val: parseFloat(s.payout_pct).toFixed(2) + '%', highlighted: i === hi },
                { val: fmt(amt), highlighted: i === hi },
              ],
            };
          }),
        };
      } else {
        formulaNodeText = 'Assistant Manager Logic. Based on Team Total Recovery.';
        const grid = leadershipGrid.filter(r => r.role === 'AM').sort((a, b) => a.target_collection - b.target_collection);
        const hc = record.team_headcount || 1;
        let hi = -1;
        for (let i = grid.length - 1; i >= 0; i--) {
          if (record.team_collection >= grid[i].target_collection * 30) { hi = i; break; }
        }
        formulaTableData = {
          headers: ['PCP', 'HC', 'Total Recovery', 'Incentive %', 'Amount', 'Additional', 'ZT', 'Deduction'],
          rows: grid.map((rule, i) => {
            const totalRecovery = rule.target_collection * 30;
            const amt = totalRecovery * (parseFloat(rule.incentive_percentage) / 100);
            let additional = ''; let zt = ''; let deduction = '';
            if (rule.target_collection == 215000) deduction = '1 ZT - 25% Incentive';
            else if (rule.target_collection == 225000) deduction = '2 ZT - 50% Incentive';
            else {
              zt = 'With 0 ZT';
              if (rule.target_collection == 235000) additional = fmt(amt * 0.10);
              else if (rule.target_collection == 240000) additional = fmt(amt * 0.15);
              else if (rule.target_collection == 250000) additional = fmt(amt * 0.20);
              else if (rule.target_collection >= 275000) additional = fmt(amt * 0.25);
            }
            return {
              highlighted: i === hi,
              cells: [
                { val: fmt(rule.target_collection), highlighted: i === hi },
                { val: String(hc), highlighted: false },
                { val: fmt(totalRecovery), highlighted: false },
                { val: parseFloat(rule.incentive_percentage).toFixed(2) + '%', highlighted: i === hi },
                { val: fmt(amt), highlighted: i === hi },
                { val: additional, highlighted: i === hi },
                { val: zt, highlighted: i === hi },
                { val: deduction, highlighted: i === hi },
              ],
            };
          }),
        };
      }
    } else {
      let formulaTables = [];

      if (assignedGrid === 'grid_4') {
        formulaNodeText = 'Master Grid 4 — TL Logic. PCP-based payout.';
        const sorted = [...(grid4Data.tlSlabs || [])].sort((a, b) => (a.pcp_min || 0) - (b.pcp_min || 0));
        const pcp = record.pcp || 0;
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (pcp >= (sorted[i].pcp_min || 0)) { hi = i; break; }
        }
        formulaTableData = {
          title: 'Encore ARC TL Grid',
          headers: ['PCP (Min)', 'HC', 'Payout %', 'Estimated Amount'],
          rows: sorted.map((s: any, i: number) => {
            const amt = (s.pcp_min || 0) * (record.team_headcount || 1) * (parseFloat(s.payout_pct) / 100);
            return {
              highlighted: i === hi,
              cells: [
                { val: fmt(s.pcp_min || 0), highlighted: i === hi },
                { val: String(record.team_headcount || 1), highlighted: false },
                { val: parseFloat(s.payout_pct).toFixed(2) + '%', highlighted: i === hi },
                { val: fmt(amt), highlighted: i === hi },
              ],
            };
          }),
        };
      } else if (assignedGrid === 'grid_3') {
        formulaNodeText = 'Master Grid 4 — Associate Vintage-based Slab Lookup.';
        const vKey = vintageMonths < 3 ? '<90' : '>91';
        const sorted = [...(grid4Data.associateSlabs || [])]
          .filter(s => String(s.vintage || '').trim() === vKey)
          .sort((a, b) => (a.min || 0) - (b.min || 0));
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (record.total_collection >= (sorted[i].min || 0)) { hi = i; break; }
        }
        formulaTableData = {
          title: `Encore ARC Associate Grid (Vintage ${vKey})`,
          headers: ['Min Collection', 'Max Collection', 'Payout %'],
          rows: sorted.map((s: any, i: number) => ({
            highlighted: i === hi,
            cells: [
              { val: fmt(s.min || 0), highlighted: i === hi },
              { val: s.max === '-' ? 'No Limit' : fmt(s.max || 0), highlighted: i === hi },
              { val: parseFloat(s.payout_pct).toFixed(2) + '%', highlighted: i === hi },
            ],
          })),
        };
      } else if (assignedGrid === 'grid_3') {
        formulaNodeText = 'Master Grid 3 — Associate PCP Slab Lookup.';
        const sorted = [...(grid3Data.associateSlabs || [])].sort((a, b) => (a.min || 0) - (b.min || 0));
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (record.total_collection >= (sorted[i].min || 0)) { hi = i; break; }
        }
        formulaTableData = {
          title: 'SBI Recovery Associate Grid',
          headers: ['Min Collection', 'Max Collection', 'Payout %'],
          rows: sorted.map((s: any, i: number) => ({
            highlighted: i === hi,
            cells: [
              { val: fmt(s.min || 0), highlighted: i === hi },
              { val: s.max === '-' ? 'No Limit' : fmt(s.max || 0), highlighted: i === hi },
              { val: parseFloat(s.payout_pct).toFixed(2) + '%', highlighted: i === hi },
            ],
          })),
        };
      } else if (assignedGrid === 'grid_2' && grid2Data.associateSlabs?.length > 0) {
        formulaNodeText = 'Master Grid 2 — Slab Lookup. Percentage based on collection amount and vintage.';
        const nc = (record.client || '').toLowerCase().replace('bank', '').trim();
        const np = (record.product || '').toLowerCase();
        const vintageDays = vintageMonths;
        const matching = grid2Data.associateSlabs.filter((s: any) => {
          const sc = String(s.client || '').toLowerCase().replace('bank', '').trim();
          const sp = String(s.product || '').toLowerCase();
          return sc.includes(nc) && sp.includes(np);
        });
        const vintageSlabs = matching.filter((s: any) => {
          const v = String(s.vintage || '').trim();
          if (vintageDays <= 90) return v.includes('<90');
          return v.includes('>91');
        });
        const slabsToShow = vintageSlabs.length > 0 ? vintageSlabs : matching.slice(0, 10);
        const col = record.total_collection || 0;
        let hi = -1;
        for (let i = slabsToShow.length - 1; i >= 0; i--) {
          const minStr = String(slabsToShow[i].min || '').trim();
          const minVal = parseGrid2Value(minStr);
          if (minStr.includes('<')) {
            if (minVal !== null && col < minVal) { hi = i; break; }
          } else if (minStr.includes('>')) {
            if (minVal !== null && col > minVal) { hi = i; break; }
          } else {
            if (minVal !== null && col >= minVal) { hi = i; break; }
          }
        }
        formulaTableData = {
          headers: ['Vintage', 'Level', 'Min', 'Max', 'Payout %'],
          rows: slabsToShow.map((s: any, i: number) => ({
            highlighted: i === hi,
            cells: [
              { val: s.vintage, highlighted: false },
              { val: s.level, highlighted: i === hi },
              { val: typeof s.min === 'number' ? fmt(s.min) : String(s.min), highlighted: i === hi },
              { val: typeof s.max === 'number' ? fmt(s.max) : String(s.max), highlighted: false },
              { val: s.payout_pct + '%', highlighted: i === hi },
            ],
          })),
        };
      } else if (vintageMonths <= 120) {
        const slabMonth = vintageMonths <= 30 ? 0 : vintageMonths <= 60 ? 1 : vintageMonths <= 90 ? 2 : 3;
        formulaNodeText = `Associate Vintage Logic (Month ${slabMonth}). Fixed incentive payout based on collection.`;
        const sorted = [...associateVintageGrid].sort((a, b) => a.target_collection - b.target_collection);
        const targetColIdx = vintageMonths <= 30 ? 1 : vintageMonths <= 60 ? 2 : vintageMonths <= 90 ? 3 : 4;
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (record.total_collection >= sorted[i].target_collection) { hi = i; break; }
        }
        formulaTableData = {
          headers: ['TARGET', '0 M', '1 M', '2 M', '3 M'],
          rows: sorted.map((r, i) => ({
            highlighted: i === hi,
            cells: [
              { val: fmt(r.target_collection), highlighted: i === hi },
              { val: fmt(Number(r.m0)), highlighted: i === hi && targetColIdx === 1 },
              { val: Number(r.m1) > 0 ? fmt(Number(r.m1)) : '', highlighted: i === hi && targetColIdx === 2 },
              { val: Number(r.m2) > 0 ? fmt(Number(r.m2)) : '', highlighted: i === hi && targetColIdx === 3 },
              { val: Number(r.m3) > 0 ? fmt(Number(r.m3)) : '', highlighted: i === hi && targetColIdx === 4 },
            ],
          })),
        };
      } else {
        formulaNodeText = 'Associate Tenured Logic (>3 Months). Percentage incentive based on collection and salary slab.';
        
        const ranges = masterGrids.tenured_salary_ranges || [
          { key: 'under_16k', min: 0, max: 15999, label: '<16k (%)' },
          { key: 'between_16_18k', min: 16000, max: 17999, label: '16k-18k (%)' },
          { key: 'between_18_24k', min: 18000, max: 9999999, label: '>18k (%)' }
        ];

        let colHi = -1;
        for (let j = 0; j < ranges.length; j++) {
            if (salary >= ranges[j].min && salary <= ranges[j].max) {
                colHi = j + 1;
                break;
            }
        }
        
        const sorted = [...associateTenuredGrid].sort((a, b) => a.target_collection - b.target_collection);
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (record.total_collection >= sorted[i].target_collection) { hi = i; break; }
        }
        
        const headers = ['Coll.', ...ranges.map((r: any) => r.label)];
        
        formulaTableData = {
          headers: headers,
          rows: sorted.map((r, i) => ({
            highlighted: i === hi,
            cells: [
              { val: fmt(r.target_collection), highlighted: i === hi },
              ...ranges.map((range: any, j: number) => ({
                val: parseFloat(r[range.key]).toFixed(2) + '%',
                highlighted: i === hi && colHi === (j + 1)
              }))
            ],
          })),
        };
      }
    }

    const formulaNode = {
      id: 'formula', type: 'custom', position: { x: 950, y: 150 },
      data: {
        title: `Applied Matrix Lookup — ${gridLabel}`,
        stripeColor: 'bg-blue-500',
        color: 'bg-blue-50 text-blue-600 border border-blue-100',
        icon: 'percent',
        content: formulaNodeText,
        tableData: formulaTableData,
        tables: formulaTables,
      },
    };

    // ── Node 4: Final Payout ──────────────────────────────────────────
    let finalIncentiveVal = record.incentive || 0;

    if (isLeader && leadershipGrid?.length) {
      const role = isATL ? 'ATL' : isAM ? 'AM' : 'TL';
      const mult = role === 'ATL' ? 5 : role === 'AM' ? 30 : 9;
      const grid = leadershipGrid.filter(r => r.role === role).sort((a, b) => a.target_collection - b.target_collection);
      let matchedPct = 0; let matchedTarget = 0;
      const tc = parseFloat(record.team_collection) || 0;
      for (let i = grid.length - 1; i >= 0; i--) {
        if (tc >= grid[i].target_collection * mult) {
          matchedPct = parseFloat(grid[i].incentive_percentage) / 100;
          matchedTarget = Number(grid[i].target_collection);
          break;
        }
      }
      const base = tc * matchedPct;
      let add = 0;
      if (role === 'AM') {
        if (matchedTarget == 235000) add = base * 0.10;
        else if (matchedTarget == 240000) add = base * 0.15;
        else if (matchedTarget == 250000) add = base * 0.20;
        else if (matchedTarget >= 275000) add = base * 0.25;
      }
      finalIncentiveVal = base + add + (parseFloat(record.individual_incentive) || 0);
    }

    let outputContent = `Earned Incentive: ${fmt(finalIncentiveVal)}\nGrid Applied: ${gridLabel}`;
    if (isATL && !isSpecial) {
      outputContent = `Team Payout: ${fmt(record.team_incentive || 0)}\nIndividual Payout: ${fmt(record.individual_incentive || 0)}\nTotal Earned: ${fmt(record.incentive || 0)}\nGrid Applied: ${gridLabel}`;
    }

    const outputNode = {
      id: 'output', type: 'custom', position: { x: 1750, y: 150 },
      data: {
        title: 'Final Payout',
        stripeColor: 'bg-emerald-500',
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        icon: 'wallet',
        content: outputContent,
      },
    };

    const edges = [
      { id: 'e1', source: 'input', target: 'rule', animated: true, style: { stroke: '#64748b', strokeWidth: 2 } },
      { id: 'e2', source: 'rule', target: 'formula', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } },
      { id: 'e3', source: 'formula', target: 'output', animated: true, style: { stroke: '#10b981', strokeWidth: 3 } },
    ];

    return NextResponse.json({
      success: true,
      nodes: [inputNode, ruleNode, formulaNode, outputNode],
      edges,
      meta: { assignedGrid, ruleName },
    });

  } catch (err: any) {
    console.error('Trace Engine Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ── Utility: build associate table (used by ATL dual payout) ─────────────────
function buildAssociateTable(
  record: any, vintageMonths: number, salary: number,
  associateVintageGrid: any[], associateTenuredGrid: any[],
  fmtFn: (n: number) => string,
  tenuredSalaryRanges: any[]
): any | null {
  if (vintageMonths <= 120) {
    const targetColIdx = vintageMonths <= 30 ? 1 : vintageMonths <= 60 ? 2 : vintageMonths <= 90 ? 3 : 4;
    const sorted = [...associateVintageGrid].sort((a, b) => a.target_collection - b.target_collection);
    let hi = -1;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (record.total_collection >= sorted[i].target_collection) { hi = i; break; }
    }
    return {
      title: `Individual Payout (Vintage Month ${Math.floor(vintageMonths / 30) || 0})`,
      headers: ['TARGET', '0 M', '1 M', '2 M', '3 M'],
      rows: sorted.map((r, i) => ({
        highlighted: i === hi,
        cells: [
          { val: fmtFn(r.target_collection), highlighted: i === hi },
          { val: fmtFn(Number(r.m0)), highlighted: i === hi && targetColIdx === 1 },
          { val: Number(r.m1) > 0 ? fmtFn(Number(r.m1)) : '', highlighted: i === hi && targetColIdx === 2 },
          { val: Number(r.m2) > 0 ? fmtFn(Number(r.m2)) : '', highlighted: i === hi && targetColIdx === 3 },
          { val: Number(r.m3) > 0 ? fmtFn(Number(r.m3)) : '', highlighted: i === hi && targetColIdx === 4 },
        ],
      })),
    };
  } else {
    const ranges = tenuredSalaryRanges || [
      { key: 'under_16k', min: 0, max: 15999, label: '<16k (%)' },
      { key: 'between_16_18k', min: 16000, max: 17999, label: '16k-18k (%)' },
      { key: 'between_18_24k', min: 18000, max: 9999999, label: '>18k (%)' }
    ];

    let colHi = -1;
    for (let j = 0; j < ranges.length; j++) {
        if (salary >= ranges[j].min && salary <= ranges[j].max) {
            colHi = j + 1;
            break;
        }
    }

    const sorted = [...associateTenuredGrid].sort((a, b) => a.target_collection - b.target_collection);
    let hi = -1;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (record.total_collection >= sorted[i].target_collection) { hi = i; break; }
    }
    
    const headers = ['Coll.', ...ranges.map((r: any) => r.label)];
    
    return {
      title: 'Individual Payout (Tenured >3 Months)',
      headers: headers,
      rows: sorted.map((r, i) => ({
        highlighted: i === hi,
        cells: [
          { val: fmtFn(r.target_collection), highlighted: i === hi },
          ...ranges.map((range: any, j: number) => ({
            val: parseFloat(r[range.key]).toFixed(2) + '%',
            highlighted: i === hi && colHi === (j + 1)
          }))
        ],
      })),
    };
  }
}
