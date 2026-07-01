const fs = require('fs');

let code = fs.readFileSync('components/TraceEngine.tsx', 'utf8');

// 1. Add grid3Data to props
if (!code.includes('grid3Data?: any')) {
    code = code.replace('grid2Slabs?: any[],\n  onClose: () => void\n}) {', 
        'grid2Slabs?: any[],\n  grid3Data?: any,\n  onClose: () => void\n}) {');
    
    code = code.replace('  grid2Slabs,\n  onClose\n}: {', 
        '  grid2Slabs,\n  grid3Data,\n  onClose\n}: {');
}

// 2. Logic blocks in TraceEngine.tsx
// I need to intercept the rule generation where it assigns mathStr and ruleName.
// First, let's find the places where we set mathStr.

// For TL:
// else if (designation.includes('leader') || designation === 'tl') {
//   ruleName = "Leadership Grid — Team Leader";
//   ...

// For AM:
// else if (designation.includes('manager') || designation === 'am') {
//   ruleName = "Leadership Grid — Assistant Manager";
//   ...

// For Associate:
// else {
//   // Associate — check which grid is assigned
//   if (assignedGrid === 'grid_2') {
//     ruleName = "Master Grid 2 — Slab Percentage";

const tlRuleBlock = `} else if (designation.includes('leader') || designation === 'tl') {
      ruleName = "Leadership Grid — Team Leader";
      let appliedRateStr = '0.00%';
      let pcpStr = formatCurrency(0);
      let headCountStr = '1';`;

const newTlRuleBlock = `} else if (designation.includes('leader') || designation === 'tl') {
      if (assignedGrid === 'grid_3') {
        ruleName = "Master Grid 3 — Team Leader (SBI Recovery)";
        let appliedRateStr = '0.00%';
        let pcpStr = formatCurrency(0);
        let headCountStr = '1';
        
        let hc = 1;
        if (record.tl_name) {
          const tlKey = Object.keys(tlTeamData || {}).find(k => k.includes(record.employee_name) || record.employee_name.includes(k));
          if (tlKey && tlTeamData[tlKey]) {
            hc = tlTeamData[tlKey].headcount.size || 1;
            headCountStr = hc.toString();
          }
        }
        
        if (grid3Data && grid3Data.tlSlabs) {
          const sortedGrid = [...grid3Data.tlSlabs].sort((a, b) => a.pcp_min - b.pcp_min);
          let matchedPercent = '0.00%';
          const pcp = record.team_collection / hc;
          for (let i = sortedGrid.length - 1; i >= 0; i--) {
            if (pcp >= sortedGrid[i].pcp_min) {
              matchedPercent = parseFloat(sortedGrid[i].payout_pct).toFixed(2) + '%';
              break;
            }
          }
          appliedRateStr = matchedPercent;
          pcpStr = formatCurrency(pcp);
        }
        mathStr = \`Team Collection: \${formatCurrency(record.team_collection)}\\nHeadcount: \${headCountStr}\\nPCP: \${pcpStr}\\nApplied Rate: \${appliedRateStr}\`;
      } else {
        ruleName = "Leadership Grid — Team Leader";
        let appliedRateStr = '0.00%';
        let pcpStr = formatCurrency(0);
        let headCountStr = '1';`;

code = code.replace(tlRuleBlock, newTlRuleBlock);
code = code.replace(`mathStr = \`Team Collection: \${formatCurrency(record.team_collection)}\\nHeadcount: \${headCountStr}\\nPCP: \${pcpStr}\\nApplied Rate: \${appliedRateStr}\`;\n    } else if`, `mathStr = \`Team Collection: \${formatCurrency(record.team_collection)}\\nHeadcount: \${headCountStr}\\nPCP: \${pcpStr}\\nApplied Rate: \${appliedRateStr}\`;\n      }\n    } else if`);

const amRuleBlock = `} else if (designation.includes('manager') || designation === 'am') {
      ruleName = "Leadership Grid — Assistant Manager";
      let appliedRateStr = '0.00%';
      let pcpStr = formatCurrency(0);
      let headCountStr = '1';`;

const newAmRuleBlock = `} else if (designation.includes('manager') || designation === 'am') {
      if (assignedGrid === 'grid_3') {
        ruleName = "Master Grid 3 — Assistant Manager (SBI Recovery)";
        let appliedRateStr = '0.00%';
        let pcpStr = formatCurrency(0);
        let headCountStr = '1';
        let bonusStr = '';
        
        let hc = 1;
        if (record.am_name) {
          const amKey = Object.keys(amTeamData || {}).find(k => k.includes(record.employee_name) || record.employee_name.includes(k));
          if (amKey && amTeamData[amKey]) {
            hc = amTeamData[amKey].headcount.size || 1;
            headCountStr = hc.toString();
          }
        }
        
        if (grid3Data && grid3Data.amSlabs) {
          const sortedGrid = [...grid3Data.amSlabs].sort((a, b) => a.pcp_min - b.pcp_min);
          let matchedPercent = '0.00%';
          let rawPct = 0;
          const pcp = record.team_collection / hc;
          for (let i = sortedGrid.length - 1; i >= 0; i--) {
            if (pcp >= sortedGrid[i].pcp_min) {
              matchedPercent = parseFloat(sortedGrid[i].payout_pct).toFixed(2) + '%';
              rawPct = parseFloat(sortedGrid[i].payout_pct) / 100;
              break;
            }
          }
          appliedRateStr = matchedPercent;
          pcpStr = formatCurrency(pcp);
          if ((record.team_collection * rawPct) < 18000 && (record.team_collection * rawPct) > 0) {
            bonusStr = '\\nBonus: <18000 --- +5000 Applied';
          }
        }
        mathStr = \`Team Collection: \${formatCurrency(record.team_collection)}\\nHeadcount: \${headCountStr}\\nPCP: \${pcpStr}\\nApplied Rate: \${appliedRateStr}\${bonusStr}\`;
      } else {
        ruleName = "Leadership Grid — Assistant Manager";
        let appliedRateStr = '0.00%';
        let pcpStr = formatCurrency(0);
        let headCountStr = '1';`;

code = code.replace(amRuleBlock, newAmRuleBlock);
code = code.replace(`mathStr = \`Team Collection: \${formatCurrency(record.team_collection)}\\nHeadcount: \${headCountStr}\\nPCP: \${pcpStr}\\nApplied Rate: \${appliedRateStr}\`;\n    } else {`, `mathStr = \`Team Collection: \${formatCurrency(record.team_collection)}\\nHeadcount: \${headCountStr}\\nPCP: \${pcpStr}\\nApplied Rate: \${appliedRateStr}\`;\n      }\n    } else {`);

const ascRuleBlock = `if (assignedGrid === 'grid_2') {
        ruleName = "Master Grid 2 — Slab Percentage";
        mathStr = \`Rule: Grid 2 Assigned\\nCollection: \${formatCurrency(record.total_collection)}\\nVintage: \${record.vintage} Days\\nApplied Rate: \${record.incentive_percent}\`;
      } else if`;

const newAscRuleBlock = `if (assignedGrid === 'grid_2') {
        ruleName = "Master Grid 2 — Slab Percentage";
        mathStr = \`Rule: Grid 2 Assigned\\nCollection: \${formatCurrency(record.total_collection)}\\nVintage: \${record.vintage} Days\\nApplied Rate: \${record.incentive_percent}\`;
      } else if (assignedGrid === 'grid_3') {
        ruleName = "Master Grid 3 — Associate (SBI Recovery)";
        mathStr = \`Rule: Grid 3 Assigned\\nCollection (PCP): \${formatCurrency(record.total_collection)}\\nApplied Rate: \${record.incentive_percent}\`;
      } else if`;

code = code.replace(ascRuleBlock, newAscRuleBlock);

// 3. Render HTML Table for Grid 3
// Let's hook into formulaTableData
const tableHook = `if (isSpecial) {
      formulaNodeText = "Special Approval Matrix applied";`;

const newTableHook = `if (assignedGrid === 'grid_3') {
      formulaNodeText = "Master Grid 3: PCP Based Calculation";
      if (designation.includes('leader') || designation === 'tl') {
        if (grid3Data && grid3Data.tlSlabs) {
          let hc = 1;
          if (record.tl_name) {
            const tlKey = Object.keys(tlTeamData || {}).find(k => k.includes(record.employee_name) || record.employee_name.includes(k));
            if (tlKey && tlTeamData[tlKey]) hc = tlTeamData[tlKey].headcount.size || 1;
          }
          const pcp = record.team_collection / hc;
          const sortedGrid = [...grid3Data.tlSlabs].sort((a, b) => a.pcp_min - b.pcp_min);
          let rowHighlightIdx = -1;
          for (let i = sortedGrid.length - 1; i >= 0; i--) {
            if (pcp >= sortedGrid[i].pcp_min) {
              rowHighlightIdx = i; break;
            }
          }
          formulaTableData = {
            title: "SBI Recovery TL",
            headers: ['PCP', 'HC', 'Total Recovery', 'Slab', 'Amount'],
            rows: sortedGrid.map((rule:any, i:number) => ({
              highlighted: i === rowHighlightIdx,
              cells: [
                { val: formatCurrency(rule.pcp_min), highlighted: i === rowHighlightIdx },
                { val: hc, highlighted: i === rowHighlightIdx },
                { val: formatCurrency(rule.pcp_min * hc), highlighted: i === rowHighlightIdx },
                { val: parseFloat(rule.payout_pct).toFixed(2) + '%', highlighted: i === rowHighlightIdx },
                { val: formatCurrency((rule.pcp_min * hc) * (parseFloat(rule.payout_pct)/100)), highlighted: i === rowHighlightIdx }
              ]
            }))
          };
        }
      } else if (designation.includes('manager') || designation === 'am') {
        if (grid3Data && grid3Data.amSlabs) {
          let hc = 1;
          if (record.am_name) {
            const amKey = Object.keys(amTeamData || {}).find(k => k.includes(record.employee_name) || record.employee_name.includes(k));
            if (amKey && amTeamData[amKey]) hc = amTeamData[amKey].headcount.size || 1;
          }
          const pcp = record.team_collection / hc;
          const sortedGrid = [...grid3Data.amSlabs].sort((a, b) => a.pcp_min - b.pcp_min);
          let rowHighlightIdx = -1;
          for (let i = sortedGrid.length - 1; i >= 0; i--) {
            if (pcp >= sortedGrid[i].pcp_min) {
              rowHighlightIdx = i; break;
            }
          }
          formulaTableData = {
            title: "SBI Recovery AM",
            headers: ['PCP', 'HC', 'Total Recovery', 'Slab', 'Amount', 'Additional Bonus'],
            rows: sortedGrid.map((rule:any, i:number) => {
              const amount = (rule.pcp_min * hc) * (parseFloat(rule.payout_pct)/100);
              return {
                highlighted: i === rowHighlightIdx,
                cells: [
                  { val: formatCurrency(rule.pcp_min), highlighted: i === rowHighlightIdx },
                  { val: hc, highlighted: i === rowHighlightIdx },
                  { val: formatCurrency(rule.pcp_min * hc), highlighted: i === rowHighlightIdx },
                  { val: parseFloat(rule.payout_pct).toFixed(2) + '%', highlighted: i === rowHighlightIdx },
                  { val: formatCurrency(amount), highlighted: i === rowHighlightIdx },
                  { val: i === 0 ? '<18000 --- 5000' : '', highlighted: i === rowHighlightIdx && amount < 18000 }
                ]
              };
            })
          };
        }
      } else {
        if (grid3Data && grid3Data.associateSlabs) {
          const sortedGrid = [...grid3Data.associateSlabs].sort((a, b) => a.min - b.min);
          let rowHighlightIdx = -1;
          for (let i = sortedGrid.length - 1; i >= 0; i--) {
            if (record.total_collection >= sortedGrid[i].min) {
              rowHighlightIdx = i; break;
            }
          }
          formulaTableData = {
            title: "SBI Recovery Agents Acaasa",
            headers: ['PCP', 'Slab', 'Amount'],
            rows: sortedGrid.map((rule:any, i:number) => ({
              highlighted: i === rowHighlightIdx,
              cells: [
                { val: formatCurrency(rule.min), highlighted: i === rowHighlightIdx },
                { val: parseFloat(rule.payout_pct).toFixed(2) + '%', highlighted: i === rowHighlightIdx },
                { val: formatCurrency(rule.min * (parseFloat(rule.payout_pct)/100)), highlighted: i === rowHighlightIdx }
              ]
            }))
          };
        }
      }
    } else if (isSpecial) {
      formulaNodeText = "Special Approval Matrix applied";`;

code = code.replace(tableHook, newTableHook);

fs.writeFileSync('components/TraceEngine.tsx', code);
console.log('Patched TraceEngine.tsx');
