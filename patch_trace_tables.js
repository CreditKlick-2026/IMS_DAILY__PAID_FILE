const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'api', 'trace', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The multi_replace_file_content messed up the formula tables generation.
// Let's restore and properly inject it.
// First, I will look for the TL logic block.

const newRouteTs = content.replace(/let formulaTables = \[\];[\s\S]*?(?=\s*\/\/ ── Node 4: Output)/, `let formulaTables = [];

      if (assignedGrid === 'grid_3') {
        formulaNodeText = 'Master Grid 3 — TL Logic. PCP-based payout.';
        const sorted = [...(grid3Data.tlSlabs || [])].sort((a, b) => (a.pcp_min || 0) - (b.pcp_min || 0));
        const pcp = record.pcp || 0;
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (pcp >= (sorted[i].pcp_min || 0)) { hi = i; break; }
        }
        const teamTableData = {
          title: 'SBI Recovery TL Grid',
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

        if (isATL) {
          const indTable = buildAssociateTable(record, vintageMonths, salary, associateVintageGrid, associateTenuredGrid, fmt);
          formulaTables = indTable ? [teamTableData, indTable] : [teamTableData];
        } else {
          formulaTableData = teamTableData;
        }

      } else if (assignedGrid === 'grid_4') {
        formulaNodeText = 'Master Grid 4 — TL Logic. PCP-based payout.';
        const sorted = [...(grid4Data.tlSlabs || [])].sort((a, b) => (a.pcp_min || 0) - (b.pcp_min || 0));
        const pcp = record.pcp || 0;
        let hi = -1;
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (pcp >= (sorted[i].pcp_min || 0)) { hi = i; break; }
        }
        const teamTableData = {
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

        if (isATL) {
          const indTable = buildAssociateTable(record, vintageMonths, salary, associateVintageGrid, associateTenuredGrid, fmt);
          formulaTables = indTable ? [teamTableData, indTable] : [teamTableData];
        } else {
          formulaTableData = teamTableData;
        }
      } else {
        formulaNodeText = 'Team Leader Logic. Based on Team Total Recovery.';
        const grid = leadershipGrid.filter(r => r.role === 'TL').sort((a, b) => a.target_collection - b.target_collection);
        const hc = record.team_headcount || 1;
        let hi = -1;
        for (let i = grid.length - 1; i >= 0; i--) {
          if (record.team_collection >= grid[i].target_collection * 9) { hi = i; break; }
        }
        const teamTableData = {
          headers: ['PCP', 'HC', 'Total Recovery', 'Incentive %', 'Amount', 'Additional', 'ZT', 'Deduction'],
          rows: grid.map((rule, i) => {
            const totalRecovery = rule.target_collection * 9;
            const amt = totalRecovery * (parseFloat(rule.incentive_percentage) / 100);
            let additional = ''; let zt = ''; let deduction = '';
            if (rule.target_collection == 130000) deduction = '1 ZT - 25% Incentive';
            else if (rule.target_collection == 145000) deduction = '2 ZT - 50% Incentive';
            else {
              zt = 'With 0 ZT';
              if (rule.target_collection == 150000) additional = fmt(amt * 0.10);
              else if (rule.target_collection == 160000) additional = fmt(amt * 0.15);
              else if (rule.target_collection >= 170000) additional = fmt(amt * 0.20);
            }
            const cells = [
              { val: fmt(rule.target_collection), highlighted: i === hi },
              { val: String(hc), highlighted: false },
              { val: fmt(totalRecovery), highlighted: false },
              { val: parseFloat(rule.incentive_percentage).toFixed(2) + '%', highlighted: i === hi },
              { val: fmt(amt), highlighted: i === hi },
            ];
            cells.push({ val: additional, highlighted: i === hi });
            cells.push({ val: zt, highlighted: i === hi });
            cells.push({ val: deduction, highlighted: i === hi });
            return { highlighted: i === hi, cells };
          }),
        };

        if (isATL) {
          const indTable = buildAssociateTable(record, vintageMonths, salary, associateVintageGrid, associateTenuredGrid, fmt);
          formulaTables = indTable ? [teamTableData, indTable] : [teamTableData];
        } else {
          formulaTableData = teamTableData;
        }
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
      // Associate logic
      if (assignedGrid === 'grid_4') {
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
          title: \`Encore ARC Associate Grid (Vintage \${vKey})\`,
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
      } else if (assignedGrid === 'grid_2') {
        formulaNodeText = 'Master Grid 2 — Target / Payout Slab Matrix Lookup.';
        formulaTableData = buildGrid2Table(record, vintageMonths, grid2Data.associateSlabs, fmt);
      } else if (vintageMonths <= 120) {
        formulaNodeText = 'Associate Incentive Formula. New joiner lookup table.';
        formulaTableData = buildAssociateTable(record, vintageMonths, salary, associateVintageGrid, associateTenuredGrid, fmt);
      } else {
        formulaNodeText = 'Associate Tenured Incentive. Derived using target % logic.';
        formulaTableData = buildAssociateTable(record, vintageMonths, salary, associateVintageGrid, associateTenuredGrid, fmt);
      }
    }
`);

const finalStr = newRouteTs.replace(/let grid4Data: any = { associateSlabs: \[\], tlSlabs: \[\], amSlabs: \[\] };/g, ''); // prevent dupes
const loadGrids = `
    let grid4Data: any = { associateSlabs: [], tlSlabs: [], amSlabs: [] };
    try {
      const raw4 = await fs_promises.readFile(path.join(process.cwd(), 'data', 'master_grids_4.json'), 'utf-8');
      grid4Data = JSON.parse(raw4);
    } catch {}

    // 3. Get assigned grid for the client
`;

const withGrids = finalStr.replace(/\/\/ 3\. Get assigned grid for the client/, loadGrids);

fs.writeFileSync(filePath, withGrids);
console.log('Trace Engine Grid 4 Tables Patched Successfully.');
