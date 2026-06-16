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
  onClose
}: {
  record: any,
  specialGridRules?: any[],
  associateTenuredGrid?: any[],
  associateVintageGrid?: any[],
  leadershipGrid?: any[],
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
    if (record.designation?.toLowerCase() === 'atl') {
      ruleName = "SME Team (ATL) Percent Slab";
      mathStr = `Team Collection: ${formatCurrency(record.team_collection)}\nHeadcount: ${record.team_headcount}\nPCP: ${formatCurrency(record.pcp)}\nApplied Rate: ${record.incentive_percent}`;
    } else if (record.designation?.toLowerCase().includes('leader') || record.designation?.toLowerCase() === 'tl') {
      ruleName = "Team Leader Percent Slab";
      mathStr = `Team Collection: ${formatCurrency(record.team_collection)}\nHeadcount: ${record.team_headcount}\nPCP: ${formatCurrency(record.pcp)}\nApplied Rate: ${record.incentive_percent}`;
    } else if (record.designation?.toLowerCase().includes('manager') || record.designation?.toLowerCase() === 'am') {
      ruleName = "AM Percent Slab";
      mathStr = `Team Collection: ${formatCurrency(record.team_collection)}\nHeadcount: ${record.team_headcount}\nPCP: ${formatCurrency(record.pcp)}\nApplied Rate: ${record.incentive_percent}`;
    } else {
      if (record.is_special) {
        ruleName = "Special Exception (>=3.5L)";
        mathStr = `Rule: Special Exception Override\nTarget: ${formatCurrency(record.total_collection)}\nApplied Rate: ${record.incentive_percent}`;
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

    const designation = (record.designation || '').toLowerCase();
    const vintageMonths = parseInt(record.vintage) || 0;
    const salary = parseFloat(record.salary) || 25000;
    const isSpecial = record.is_special || false;

    formulaNodeText = "Standard Logic Applied";

    if (designation.includes('leader') || designation === 'tl' || designation === 'atl') {
      const role = designation.includes('atl') ? 'ATL' : 'TL';
      formulaNodeText = `Leadership Logic (${role}). Based on Team PCP.`;
      const grid = leadershipGrid?.filter(r => r.role === role) || [];
      const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
      const headcount = record.team_headcount || 1;

      let rowHighlightIdx = -1;
      for (let i = sortedGrid.length - 1; i >= 0; i--) {
        if (record.pcp >= sortedGrid[i].target_collection) {
          rowHighlightIdx = i; break;
        }
      }

      formulaTableData = {
        headers: ['PCP', 'Headcount', 'Total Recovery', 'Incentive %', 'Amount'],
        rows: sortedGrid.map((rule, i) => {
          const totalRecovery = rule.target_collection * headcount;
          const amt = totalRecovery * (parseFloat(rule.incentive_percentage) / 100);
          return {
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: headcount.toString(), highlighted: false },
              { val: formatCurrency(totalRecovery), highlighted: false },
              { val: parseFloat(rule.incentive_percentage).toFixed(2) + '%', highlighted: i === rowHighlightIdx },
              { val: formatCurrency(amt), highlighted: i === rowHighlightIdx }
            ]
          };
        })
      };
    } else if (designation.includes('manager') || designation === 'am') {
      formulaNodeText = "Assistant Manager Logic. Based on Team PCP.";
      const grid = leadershipGrid?.filter(r => r.role === 'AM') || [];
      const sortedGrid = [...grid].sort((a, b) => a.target_collection - b.target_collection);
      const headcount = record.team_headcount || 1;

      let rowHighlightIdx = -1;
      for (let i = sortedGrid.length - 1; i >= 0; i--) {
        if (record.pcp >= sortedGrid[i].target_collection) {
          rowHighlightIdx = i; break;
        }
      }

      formulaTableData = {
        headers: ['PCP', 'Headcount', 'Total Recovery', 'Incentive', 'Amount'],
        rows: sortedGrid.map((rule, i) => {
          const totalRecovery = rule.target_collection * headcount;
          const amt = totalRecovery * (parseFloat(rule.incentive_percentage) / 100);
          return {
            highlighted: i === rowHighlightIdx,
            cells: [
              { val: formatCurrency(rule.target_collection), highlighted: i === rowHighlightIdx },
              { val: headcount.toString(), highlighted: false },
              { val: formatCurrency(totalRecovery), highlighted: false },
              { val: parseFloat(rule.incentive_percentage).toFixed(2) + '%', highlighted: i === rowHighlightIdx },
              { val: formatCurrency(amt), highlighted: i === rowHighlightIdx }
            ]
          };
        })
      };
    } else {
      // Associate Logic
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
        tableData: formulaTableData
      }
    });

    // 4. Output Node
    nodesList.push({
      id: 'output',
      type: 'custom',
      position: { x: 1850, y: 150 },
      data: {
        title: `${new Date().toLocaleString('en-US', { month: 'long' })} Payout`,
        stripeColor: 'bg-emerald-500',
        color: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        icon: <Wallet className="w-6 h-6" />,
        content: `Earned Incentive: ${formatCurrency(record.final_incentive || record.incentive || 0)}`
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
