"use client";
import React, { useEffect, useState } from 'react';
import { ReactFlow, Controls, Background, Node, Edge, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X, Loader2, Calculator, Settings2, Wallet, Percent, User } from 'lucide-react';

const CustomNode = ({ data }: any) => (
  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 min-w-[320px] overflow-hidden relative">
    <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-indigo-400 border-2 border-white" />
    <div className={`absolute top-0 left-0 w-full h-1.5 ${data.stripeColor || 'bg-slate-200'}`}></div>
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${data.color || 'bg-slate-100 text-slate-600'}`}>
        {data.icon}
      </div>
      <h3 className="font-black text-lg text-slate-800 tracking-tight">{data.title}</h3>
    </div>
    <div className="text-sm text-slate-600 leading-relaxed font-medium space-y-1">
      {data.content && data.content.split('\n').map((line: string, i: number) => {
        if (line.includes(':')) {
          const [k, v] = line.split(':');
          return <div key={i} className="flex justify-between items-center"><span className="text-slate-400">{k}</span><span className="font-bold text-slate-800">{v}</span></div>;
        }
        return <div key={i}>{line}</div>;
      })}
    </div>
    {data.tableData && (
      <div className="mt-4 rounded-lg overflow-hidden border border-slate-200">
        <table className="w-full text-[11px] text-center border-collapse">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              {data.tableData.headers.map((h: string, idx: number) => (
                <th key={idx} className="border border-slate-200 p-1.5 font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.tableData.rows.map((row: any, rIdx: number) => (
              <tr key={rIdx} className={row.highlighted ? "bg-amber-50" : ""}>
                {row.cells.map((c: any, cIdx: number) => (
                  <td key={cIdx} className={`border border-slate-200 p-1.5 ${c.highlighted ? "bg-amber-200 font-bold text-amber-900" : "text-slate-600"}`}>{c.val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {data.tables && data.tables.map((tbl: any, tIdx: number) => (
      <div key={tIdx} className="mt-4">
        {tbl.title && <h4 className="text-[11px] font-bold text-slate-700 mb-1.5 bg-slate-100 px-2 py-1 rounded inline-block">{tbl.title}</h4>}
        <div className="rounded-lg overflow-hidden border border-slate-200">
          <table className="w-full text-[11px] text-center border-collapse">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                {tbl.headers.map((h: string, idx: number) => (
                  <th key={idx} className="border border-slate-200 p-1.5 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tbl.rows.map((row: any, rIdx: number) => (
                <tr key={rIdx} className={row.highlighted ? "bg-amber-50" : ""}>
                  {row.cells.map((c: any, cIdx: number) => (
                    <td key={cIdx} className={`border border-slate-200 p-1.5 ${c.highlighted ? "bg-amber-200 font-bold text-amber-900" : "text-slate-600"}`}>{c.val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
    <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-indigo-400 border-2 border-white" />
  </div>
);

const nodeTypes = { custom: CustomNode };

export default function TraceEngine({
  record,
  specialGridRules,
  associateTenuredGrid,
  associateVintageGrid,
  leadershipGrid,
  assignedGrid,
  grid2Slabs,
  onClose
}: {
  record: any,
  specialGridRules?: any[],
  associateTenuredGrid?: any[],
  associateVintageGrid?: any[],
  leadershipGrid?: any[],
  assignedGrid?: string,
  grid2Slabs?: any[],
  onClose: () => void
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (record) {
      generateFlow(record);
    }
  }, [record]);

  const generateFlow = (record: any) => {
    const formatCurrency = (amt: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);

    let nodesList: Node[] = [];
    let edgesList: Edge[] = [];

    const isTlOrAm = record.designation?.toLowerCase().includes('leader') || record.designation?.toLowerCase() === 'tl' || record.designation?.toLowerCase() === 'atl' || record.designation?.toLowerCase().includes('manager') || record.designation?.toLowerCase() === 'am';

    let contentStr = `Name: ${record.name || record.employee_name}\nDesignation: ${record.designation}`;
    if (!isTlOrAm) {
      contentStr += `\nVintage: ${record.vintage} Days\nSalary: ${record.salary ? formatCurrency(record.salary) : 'N/A'}`;
    }
    contentStr += `\nTotal Collection: ${formatCurrency(record.total_collection)}`;

    // 1. Input Node
    nodesList.push({
      id: 'input',
      type: 'custom',
      position: { x: 50, y: 150 },
      data: {
        title: 'Input Parameters',
        stripeColor: 'bg-indigo-500',
        color: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
        icon: <User className="w-6 h-6" />,
        content: contentStr
      }
    });

    // 2. Rule Selected Node
    let ruleName = "";
    let mathStr = "";
    if (record.is_special) {
      ruleName = "Special Exception (>=3.5L)";
      mathStr = `Rule: Special Exception Override\nTarget: ${formatCurrency(record.total_collection)}\nApplied Rate: ${record.incentive_percent}`;
    } else if (record.designation?.toLowerCase().includes('atl') || record.designation?.toLowerCase() === 'assistant team leader') {
      ruleName = "SME Team (ATL) Percent Slab";
      let appliedRateStr = record.incentive_percent;
      let pcpStr = formatCurrency(record.pcp);
      let headCountStr = record.team_headcount?.toString();
      
      // Override to display correct rate dynamically
      if (leadershipGrid) {
        const grid = leadershipGrid.filter(r => r.role === 'ATL');
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
        let matchedPercent = '0%';
        const hc = record.team_headcount || 1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.team_collection >= sortedGrid[i].target_collection * 5) {
            matchedPercent = parseFloat(sortedGrid[i].incentive_percentage).toFixed(2) + '%';
            break;
          }
        }
        appliedRateStr = matchedPercent;
        pcpStr = formatCurrency(record.team_collection / hc);
      }
      
      mathStr = `Team Collection: ${formatCurrency(record.team_collection)}\nHeadcount: ${headCountStr}\nPCP: ${pcpStr}\nApplied Rate: ${appliedRateStr}`;
    } else if (record.designation?.toLowerCase().includes('leader') || record.designation?.toLowerCase() === 'tl') {
      ruleName = "Team Leader Percent Slab";
      let appliedRateStr = record.incentive_percent;
      let pcpStr = formatCurrency(record.pcp);
      let headCountStr = record.team_headcount?.toString();
      
      // Override to display correct rate dynamically
      if (leadershipGrid) {
        const grid = leadershipGrid.filter(r => r.role === 'TL');
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
        let matchedPercent = '0%';
        const hc = record.team_headcount || 1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.team_collection >= sortedGrid[i].target_collection * 9) {
            matchedPercent = parseFloat(sortedGrid[i].incentive_percentage).toFixed(2) + '%';
            break;
          }
        }
        appliedRateStr = matchedPercent;
        pcpStr = formatCurrency(record.team_collection / hc);
      }
      
      mathStr = `Team Collection: ${formatCurrency(record.team_collection)}\nHeadcount: ${headCountStr}\nPCP: ${pcpStr}\nApplied Rate: ${appliedRateStr}`;
    } else if (record.designation?.toLowerCase().includes('manager') || record.designation?.toLowerCase() === 'am') {
      ruleName = "AM Percent Slab";
      let appliedRateStr = record.incentive_percent;
      let pcpStr = formatCurrency(record.pcp);
      let headCountStr = record.team_headcount?.toString();
      
      // Override to display correct rate dynamically
      if (leadershipGrid) {
        const grid = leadershipGrid.filter(r => r.role === 'AM');
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
        let matchedPercent = '0%';
        const hc = record.team_headcount || 1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.team_collection >= sortedGrid[i].target_collection * 30) {
            matchedPercent = parseFloat(sortedGrid[i].incentive_percentage).toFixed(2) + '%';
            break;
          }
        }
        appliedRateStr = matchedPercent;
        pcpStr = formatCurrency(record.team_collection / hc);
      }
      
      mathStr = `Team Collection: ${formatCurrency(record.team_collection)}\nHeadcount: ${headCountStr}\nPCP: ${pcpStr}\nApplied Rate: ${appliedRateStr}`;
    } else {
      // Associate — check which grid is assigned
      if (assignedGrid === 'grid_2') {
        ruleName = "Master Grid 2 — Slab Percentage";
        mathStr = `Rule: Grid 2 Assigned\nCollection: ${formatCurrency(record.total_collection)}\nVintage: ${record.vintage} Days\nApplied Rate: ${record.incentive_percent}`;
      } else if (record.vintage <= 120) {
        ruleName = "Associate Fixed Slab";
        mathStr = `Rule: Vintage <= 120 Days\nLogic: Fixed Tier Table lookup\nTarget: ${formatCurrency(record.total_collection)}`;
      } else {
        ruleName = "Associate Tenured Percentage";
        mathStr = `Rule: Vintage > 120 Days\nLogic: Percentage logic\nSalary Check: ${formatCurrency(record.salary)}\nApplied Rate: ${record.incentive_percent}`;
      }
    }

    let formulaNodeText = "";
    let formulaTableData: any = null;
    let formulaTables: any[] | null = null;

    const designation = (record.designation || '').toLowerCase();
    const vintageMonths = parseInt(record.vintage) || 0;
    const salary = parseFloat(record.salary) || 25000;
    const isSpecial = record.is_special || false;

    const getAssociateTableData = () => {
      let tblData: any = null;
      if (vintageMonths <= 120) {
        let targetColIdx = 1;
        if (vintageMonths <= 30) targetColIdx = 1;
        else if (vintageMonths <= 60) targetColIdx = 2;
        else if (vintageMonths <= 90) targetColIdx = 3;
        else targetColIdx = 4;

        const grid = associateVintageGrid || [];
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);

        let rowHighlightIdx = -1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.total_collection >= sortedGrid[i].target_collection) {
            rowHighlightIdx = i; break;
          }
        }

        tblData = {
          title: `Individual Payout (Vintage Month ${Math.floor(vintageMonths / 30) || 0})`,
          headers: ['TARGET', '0 M', '1 M', '2 M', '3 M'],
          rows: sortedGrid.map((rule, i) => ({
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: formatCurrency(Number(rule.m0)), highlighted: i === rowHighlightIdx && targetColIdx === 1 },
              { val: Number(rule.m1) > 0 ? formatCurrency(Number(rule.m1)) : '', highlighted: i === rowHighlightIdx && targetColIdx === 2 },
              { val: Number(rule.m2) > 0 ? formatCurrency(Number(rule.m2)) : '', highlighted: i === rowHighlightIdx && targetColIdx === 3 },
              { val: Number(rule.m3) > 0 ? formatCurrency(Number(rule.m3)) : '', highlighted: i === rowHighlightIdx && targetColIdx === 4 }
            ]
          }))
        };
      } else {
        let colHighlightIdx = -1;
        if (salary < 16000) colHighlightIdx = 1;
        else if (salary >= 16000 && salary < 18000) colHighlightIdx = 2;
        else if (salary >= 18000 && salary < 24000) colHighlightIdx = 3;
        else colHighlightIdx = 4;

        const grid = associateTenuredGrid || [];
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);

        let rowHighlightIdx = -1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.total_collection >= sortedGrid[i].target_collection) {
            rowHighlightIdx = i; break;
          }
        }

        tblData = {
          title: "Individual Payout (Tenured >3 Months)",
          headers: ['Coll.', '<16k', '16-18k', '18-24k', '>24k'],
          rows: sortedGrid.map((rule, i) => ({
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: parseFloat(rule.under_16k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 1 },
              { val: parseFloat(rule.between_16_18k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 2 },
              { val: parseFloat(rule.between_18_24k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 3 },
              { val: parseFloat(rule.over_24k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 4 }
            ]
          }))
        };
      }
      return tblData;
    };

    formulaNodeText = "Standard Logic Applied";

    if (isSpecial) {
      formulaNodeText = "Special Exception Logic. Flat percentage payout based on special targets.";
      
      const grid = specialGridRules || [];
      const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);

      let rowHighlightIdx = -1;
      for (let i = sortedGrid.length - 1; i >= 0; i--) {
        if (record.total_collection >= sortedGrid[i].target_collection) {
          rowHighlightIdx = i; break;
        }
      }

      formulaTableData = {
        headers: ['Target Collection', 'Incentive Percentage'],
        rows: sortedGrid.map((rule, i) => ({
          highlighted: i === rowHighlightIdx,
          cells: [
            { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
            { val: (parseFloat(rule.incentive_percentage) * 100).toFixed(2) + '%', highlighted: i === rowHighlightIdx }
          ]
        }))
      };
    } else if (designation.includes('leader') || designation === 'tl' || designation === 'atl') {
      const role = designation.includes('atl') ? 'ATL' : 'TL';
      formulaNodeText = role === 'ATL' 
        ? `Dual Incentive (Player-Coach). Team payout shown below. Plus Associate-level individual payout.`
        : `Leadership Logic (${role}). Based on Team Total Recovery.`;
      const grid = leadershipGrid?.filter(r => r.role === role) || [];
      const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
      let headcount = record.team_headcount || 1;
      const targetMultiplier = role === 'ATL' ? 5 : 9;

      let rowHighlightIdx = -1;
      for (let i = sortedGrid.length - 1; i >= 0; i--) {
        const targetToCompare = sortedGrid[i].target_collection * targetMultiplier;
        const actualToCompare = record.team_collection;
        
        if (actualToCompare >= targetToCompare) {
          rowHighlightIdx = i; break;
        }
      }

      let headers = ['PCP', 'Headcount', 'Total Recovery', 'Incentive %', 'Amount'];
      if (role === 'TL') {
        headers = ['PCP', 'Headcount', 'Total Recovery', 'Incentive', 'Amount', 'Additional', 'ZT', 'Deduction'];
      }

      const teamTableData = {
        title: "Team Payout (Leadership Logic)",
        headers: headers,
        rows: sortedGrid.map((rule, i) => {
          const totalRecovery = rule.target_collection * targetMultiplier;
          const amt = totalRecovery * (parseFloat(rule.incentive_percentage) / 100);

          let additional = '';
          let zt = '';
          let deduction = '';

          if (role === 'TL') {
            if (rule.target_collection == 200000) {
              deduction = '1 ZT - 50% Incentive';
            } else if (rule.target_collection == 215000) {
              deduction = '2 ZT - 100% Incentive';
            } else {
              zt = 'With 0 ZT';
              deduction = formatCurrency(amt * 0.15); // 15% deduction
              if (rule.target_collection == 230000) {
                additional = formatCurrency(amt * 0.10);
              } else if (rule.target_collection == 250000) {
                additional = formatCurrency(amt * 0.15);
              } else if (rule.target_collection == 270000) {
                additional = formatCurrency(amt * 0.20);
              } else if (rule.target_collection >= 300000) {
                additional = formatCurrency(amt * 0.25);
              }
            }
          }

          const cells = [
            { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
            { val: headcount.toString(), highlighted: false },
            { val: formatCurrency(totalRecovery), highlighted: false },
            { val: parseFloat(rule.incentive_percentage).toFixed(2) + '%', highlighted: i === rowHighlightIdx },
            { val: formatCurrency(amt), highlighted: i === rowHighlightIdx }
          ];

          if (role === 'TL') {
            cells.push({ val: additional, highlighted: i === rowHighlightIdx });
            cells.push({ val: zt, highlighted: i === rowHighlightIdx });
            cells.push({ val: deduction, highlighted: i === rowHighlightIdx });
          }

          return {
            highlighted: i === rowHighlightIdx,
            cells
          };
        })
      };

      if (role === 'ATL') {
        const indTable = getAssociateTableData();
        if (indTable) {
          formulaTables = [teamTableData, indTable];
        } else {
          formulaTableData = teamTableData;
        }
      } else {
        formulaTableData = teamTableData;
      }
    } else if (designation.includes('manager') || designation === 'am') {
      formulaNodeText = "Assistant Manager Logic. Based on Team Total Recovery.";
      const grid = leadershipGrid?.filter(r => r.role === 'AM') || [];
      const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
      const headcount = record.team_headcount || 1;
      const targetMultiplier = 30;

      let rowHighlightIdx = -1;
      for (let i = sortedGrid.length - 1; i >= 0; i--) {
        const targetToCompare = sortedGrid[i].target_collection * targetMultiplier;
        const actualToCompare = record.team_collection;
        if (actualToCompare >= targetToCompare) {
          rowHighlightIdx = i; break;
        }
      }

      formulaTableData = {
        headers: ['PCP', 'Headcount', 'Total Recovery', 'Incentive', 'Amount', 'Additional', 'ZT', 'Deduction'],
        rows: sortedGrid.map((rule, i) => {
          const totalRecovery = rule.target_collection * targetMultiplier;
          const amt = totalRecovery * (parseFloat(rule.incentive_percentage) / 100);

          let additional = '';
          let zt = '';
          let deduction = '';

          if (rule.target_collection == 215000) {
            deduction = '1 ZT - 25% Incentive';
          } else if (rule.target_collection == 225000) {
            deduction = '2 ZT - 50% Incentive';
          } else {
            zt = 'With 0 ZT';
            if (rule.target_collection == 235000) {
              additional = formatCurrency(amt * 0.10);
            } else if (rule.target_collection == 240000) {
              additional = formatCurrency(amt * 0.15);
            } else if (rule.target_collection == 250000) {
              additional = formatCurrency(amt * 0.20);
            } else if (rule.target_collection >= 275000) {
              additional = formatCurrency(amt * 0.25);
            }
          }

          return {
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: headcount.toString(), highlighted: false },
              { val: formatCurrency(totalRecovery), highlighted: false },
              { val: parseFloat(rule.incentive_percentage).toFixed(2) + '%', highlighted: i === rowHighlightIdx },
              { val: formatCurrency(amt), highlighted: i === rowHighlightIdx },
              { val: additional, highlighted: i === rowHighlightIdx },
              { val: zt, highlighted: i === rowHighlightIdx },
              { val: deduction, highlighted: i === rowHighlightIdx }
            ]
          };
        })
      };
    } else {
      // Associate Logic
      if (assignedGrid === 'grid_2' && grid2Slabs && grid2Slabs.length > 0) {
        formulaNodeText = `Master Grid 2 — Axis Bank Slab Lookup. Percentage based on collection amount and vintage.`;

        const normalizedClient = (record.client || '').toLowerCase().replace('bank', '').trim();
        const normalizedProduct = (record.product || '').toLowerCase();
        const vintageDays = parseInt(record.vintage) || 0;

        const matchingSlabs = grid2Slabs.filter((slab: any) => {
          const sc = String(slab.client || '').toLowerCase().replace('bank', '').trim();
          const sp = String(slab.product || '').toLowerCase();
          return sc.includes(normalizedClient) && sp.includes(normalizedProduct);
        });

        // Pick vintage group: <90 or >91
        const vintageGroup = vintageDays < 90 ? '<90 Days' : '>91 Days';
        const vintageSlabs = matchingSlabs.filter((s: any) => String(s.vintage || '').includes(vintageDays < 90 ? '<90' : '>91'));
        const slabsToShow = vintageSlabs.length > 0 ? vintageSlabs : matchingSlabs.slice(0, 10);

        // Find highlighted row
        let highlightIdx = -1;
        const col = record.total_collection || 0;
        for (let i = slabsToShow.length - 1; i >= 0; i--) {
          const slab = slabsToShow[i];
          let minVal: number | null = null;
          const minStr = String(slab.min || '');
          if (typeof slab.min === 'number') minVal = slab.min;
          else {
            const cleaned = minStr.replace(/,/g, '').replace(/[<>]/g, '').trim();
            minVal = parseFloat(cleaned) || null;
          }
          if (minVal !== null && col >= minVal) {
            highlightIdx = i; break;
          }
        }

        formulaTableData = {
          headers: ['Vintage', 'Level', 'Min', 'Max', 'Payout %'],
          rows: slabsToShow.map((slab: any, i: number) => ({
            highlighted: i === highlightIdx,
            cells: [
              { val: slab.vintage, highlighted: false },
              { val: slab.level, highlighted: i === highlightIdx },
              { val: typeof slab.min === 'number' ? formatCurrency(slab.min) : String(slab.min), highlighted: i === highlightIdx },
              { val: typeof slab.max === 'number' ? formatCurrency(slab.max) : String(slab.max), highlighted: false },
              { val: slab.payout_pct + '%', highlighted: i === highlightIdx }
            ]
          }))
        };
      } else if (isSpecial) {
        formulaNodeText = "Special Exception Logic. Flat percentage payout based on special targets.";
        
        const grid = specialGridRules || [];
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);

        let rowHighlightIdx = -1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.total_collection >= sortedGrid[i].target_collection) {
            rowHighlightIdx = i; break;
          }
        }

        formulaTableData = {
          headers: ['Target Collection', 'Incentive Percentage'],
          rows: sortedGrid.map((rule, i) => ({
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: (parseFloat(rule.incentive_percentage) * 100).toFixed(2) + '%', highlighted: i === rowHighlightIdx }
            ]
          }))
        };
      } else if (vintageMonths <= 120) {
        formulaNodeText = `Associate Vintage Logic (Month ${Math.floor(vintageMonths / 30) || 0}). Fixed incentive payout based on collection.`;

        let targetColIdx = 1;
        if (vintageMonths <= 30) targetColIdx = 1;
        else if (vintageMonths <= 60) targetColIdx = 2;
        else if (vintageMonths <= 90) targetColIdx = 3;
        else targetColIdx = 4;

        const grid = associateVintageGrid || [];
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);

        let rowHighlightIdx = -1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.total_collection >= sortedGrid[i].target_collection) {
            rowHighlightIdx = i; break;
          }
        }

        formulaTableData = {
          headers: ['TARGET', '0 M', '1 M', '2 M', '3 M'],
          rows: sortedGrid.map((rule, i) => ({
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: formatCurrency(Number(rule.m0)), highlighted: i === rowHighlightIdx && targetColIdx === 1 },
              { val: Number(rule.m1) > 0 ? formatCurrency(Number(rule.m1)) : '', highlighted: i === rowHighlightIdx && targetColIdx === 2 },
              { val: Number(rule.m2) > 0 ? formatCurrency(Number(rule.m2)) : '', highlighted: i === rowHighlightIdx && targetColIdx === 3 },
              { val: Number(rule.m3) > 0 ? formatCurrency(Number(rule.m3)) : '', highlighted: i === rowHighlightIdx && targetColIdx === 4 }
            ]
          }))
        };
      } else {
        formulaNodeText = "Associate Tenured Logic (>3 Months). Percentage incentive based on collection and salary slab.";

        let colHighlightIdx = -1;
        if (salary < 16000) colHighlightIdx = 1;
        else if (salary >= 16000 && salary < 18000) colHighlightIdx = 2;
        else if (salary >= 18000 && salary < 24000) colHighlightIdx = 3;
        else colHighlightIdx = 4;

        const grid = associateTenuredGrid || [];
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);

        let rowHighlightIdx = -1;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (record.total_collection >= sortedGrid[i].target_collection) {
            rowHighlightIdx = i; break;
          }
        }

        formulaTableData = {
          headers: ['Coll.', '<16k', '16-18k', '18-24k', '>24k'],
          rows: sortedGrid.map((rule, i) => ({
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: parseFloat(rule.under_16k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 1 },
              { val: parseFloat(rule.between_16_18k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 2 },
              { val: parseFloat(rule.between_18_24k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 3 },
              { val: parseFloat(rule.over_24k).toFixed(2) + '%', highlighted: i === rowHighlightIdx && colHighlightIdx === 4 }
            ]
          }))
        };
      }
    }

    nodesList.push({
      id: 'rule',
      type: 'custom',
      position: { x: 450, y: 150 },
      data: {
        title: 'Calculation Engine',
        stripeColor: 'bg-amber-500',
        color: 'bg-amber-50 text-amber-600 border border-amber-100',
        icon: <Settings2 className="w-6 h-6" />,
        content: `Selected Slab: ${ruleName}\n${mathStr}`
      }
    });

    // 3. Formula Node
    nodesList.push({
      id: 'formula',
      type: 'custom',
      position: { x: 850, y: 150 },
      data: {
        title: 'Applied Matrix Lookup',
        stripeColor: 'bg-rose-500',
        color: 'bg-rose-50 text-rose-600 border border-rose-100',
        icon: <Percent className="w-6 h-6" />,
        content: formulaNodeText,
        tableData: formulaTableData,
        tables: formulaTables
      }
    });

    // 4. Output Node
    let finalIncentiveVal = record.final_incentive || record.incentive || 0;
    
    // Safety recalculate for ATL, TL & AM to combat cached API
    const desigLower = record.designation?.toLowerCase() || '';
    const isATL = desigLower === 'atl' || desigLower.includes('assistant team leader') || desigLower.includes('sme');
    const isTL = !isATL && (desigLower.includes('leader') || desigLower === 'tl');
    const isAM = desigLower.includes('manager') || desigLower === 'am';
    
    if (isATL || isTL || isAM) {
      if (leadershipGrid) {
        let role = 'TL';
        
        if (isATL) role = 'ATL';
        else if (isAM) role = 'AM';

        const fixedHeadcount = record.team_headcount || 1;

        const grid = leadershipGrid.filter(r => r.role === role);
        const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
        let matchedPercent = 0;
        let matchedTarget = 0;
        const targetMultiplier = role === 'ATL' ? 5 : (role === 'AM' ? 30 : 9);
        const tCollection = parseFloat(record.team_collection as any) || 0;
        for (let i = sortedGrid.length - 1; i >= 0; i--) {
          if (tCollection >= sortedGrid[i].target_collection * targetMultiplier) {
            matchedPercent = parseFloat(sortedGrid[i].incentive_percentage) / 100;
            matchedTarget = Number(sortedGrid[i].target_collection);
            break;
          }
        }
        const baseTeamInc = tCollection * matchedPercent;
        let additionalAmt = 0;
        if (role === 'AM') {
          if (matchedTarget == 235000) additionalAmt = baseTeamInc * 0.10;
          else if (matchedTarget == 240000) additionalAmt = baseTeamInc * 0.15;
          else if (matchedTarget == 250000) additionalAmt = baseTeamInc * 0.20;
          else if (matchedTarget >= 275000) additionalAmt = baseTeamInc * 0.25;
        }

        const indIncentive = parseFloat(record.individual_incentive as any) || 0;
        finalIncentiveVal = baseTeamInc + additionalAmt + indIncentive;
      }
    }

    let outputContent = `Earned Incentive: ${formatCurrency(finalIncentiveVal)}`;
    if (record.designation?.toLowerCase() === 'atl' || record.designation?.toLowerCase().includes('assistant team leader')) {
      if (!record.is_special) {
        outputContent = `Team Payout: ${formatCurrency(record.team_incentive || 0)}\nIndividual Payout: ${formatCurrency(record.individual_incentive || 0)}\nTotal Earned: ${formatCurrency(record.final_incentive || record.incentive || 0)}`;
      }
    }

    nodesList.push({
      id: 'output',
      type: 'custom',
      position: { x: 1850, y: 150 },
      data: {
        title: `Final Payout`,
        stripeColor: 'bg-emerald-500',
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        icon: <Wallet className="w-6 h-6" />,
        content: outputContent
      }
    });

    edgesList.push({ id: 'e1', source: 'input', target: 'rule', animated: true, style: { stroke: '#64748b', strokeWidth: 2 } });
    edgesList.push({ id: 'e2', source: 'rule', target: 'formula', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } });
    edgesList.push({ id: 'e3', source: 'formula', target: 'output', animated: true, style: { stroke: '#10b981', strokeWidth: 3 } });

    setNodes(nodesList);
    setEdges(edgesList);
  };

  return (
    <div className="flex flex-col h-[50vh] bg-slate-50 w-full border-b border-slate-200 shadow-inner relative">
      <div className="absolute top-4 right-4 z-20">
        <button onClick={onClose} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-100 shadow-sm transition-colors text-slate-500">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute top-4 left-6 z-10 bg-white/80 backdrop-blur-md px-2 py-1 rounded border border-slate-200 shadow-sm pointer-events-none">
        <h2 className="text-[10px] font-bold text-slate-800 leading-tight">Incentive Trace Engine</h2>
        <p className="text-[8px] font-medium text-slate-400 uppercase tracking-wide">{record.name} ({record.employee_id})</p>
      </div>
      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50/50"
        >
          <Background color="#cbd5e1" gap={20} size={2} />
          <Controls className="bg-white border-slate-200 shadow-lg rounded-xl overflow-hidden" />
        </ReactFlow>
      </div>
    </div>
  );
}
