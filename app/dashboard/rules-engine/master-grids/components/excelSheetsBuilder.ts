import { MasterGridData } from '../types';

export function buildExcelSheets(excelDbData: any, masterGrids: MasterGridData) {
  const list: any[] = [];
  const setCell = (celldata: any[], r: number, c: number, val: any, isHeader = false, formula?: string) => {
    let displayVal = val;
    if (val === null || val === undefined) displayVal = "";
    else if (val instanceof Date) displayVal = val.toISOString().split('T')[0];
    else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) displayVal = val.split('T')[0];

    const cellVal: any = { 
      v: displayVal, 
      m: String(displayVal), 
      bl: isHeader ? 1 : 0, 
      bg: isHeader ? "#e2e8f0" : null 
    };
    if (formula) cellVal.f = formula;
    celldata.push({ r, c, v: cellVal });
  };

  // 1. Grid 1 Live Calculations
  const calcCells: any[] = [];
  const calcHeaders = [
    "Employee Code", "Employee Name", "Designation", "Location", "Client", 
    "Product", "Salary (₹)", "DOJ", "Vintage (Months)", "Total Collected (₹)", 
    "Transactions", "TL Name", "AM Name", "Slab Rule Matched", "Incentive Rate (%)", "Calculated Payout (₹)"
  ];
  let r = 0;
  calcHeaders.forEach((h, idx) => setCell(calcCells, r, idx, h, true));
  r++;
  (excelDbData?.liveCalculations || []).forEach((row: any) => {
    setCell(calcCells, r, 0, row.employee_code || '—');
    setCell(calcCells, r, 1, row.employee_name || '—');
    setCell(calcCells, r, 2, row.designation || '—');
    setCell(calcCells, r, 3, row.location || '—');
    setCell(calcCells, r, 4, row.client || '—');
    setCell(calcCells, r, 5, row.product || '—');
    setCell(calcCells, r, 6, row.salary ? Number(row.salary) : 0);
    setCell(calcCells, r, 7, row.doj || '—');
    setCell(calcCells, r, 8, row.vintage_months ?? 0);
    setCell(calcCells, r, 9, row.total_collected ? Number(row.total_collected) : 0);
    setCell(calcCells, r, 10, row.transactions || 0);
    setCell(calcCells, r, 11, row.tl_name || '—');
    setCell(calcCells, r, 12, row.am_name || '—');
    setCell(calcCells, r, 13, row.slab_info || '—');
    setCell(calcCells, r, 14, row.incentive_pct || 0);
    const rowNum = r + 1;
    const formula = row.incentive_pct > 0 ? `=J${rowNum}*(O${rowNum}/100)` : undefined;
    setCell(calcCells, r, 15, row.calculated_incentive ? Math.round(Number(row.calculated_incentive)) : 0, false, formula);
    r++;
  });
  list.push({ name: "Grid 1 Calculations", index: 0, order: 0, status: 1, celldata: calcCells });

  // 2. Associate Tenured
  const tenuredCells: any[] = [];
  r = 0;
  setCell(tenuredCells, r, 0, "Target Collection (₹)", true);
  const tenuredCols = masterGrids.tenured_salary_ranges || [
    { key: 'under_16k', label: '<16k (%)' },
    { key: 'between_16_18k', label: '16k-18k (%)' },
    { key: 'between_18_24k', label: '18k-24k (%)' },
    { key: 'over_24k', label: '>24k (%)' }
  ];
  tenuredCols.forEach((col, idx) => setCell(tenuredCells, r, idx + 1, col.label, true));
  r++;
  (masterGrids.associateTenured || []).forEach((row) => {
    setCell(tenuredCells, r, 0, row.target_collection || 0);
    tenuredCols.forEach((col, idx) => setCell(tenuredCells, r, idx + 1, row[col.key] || 0));
    r++;
  });
  list.push({ name: "Associate Tenured", index: 1, order: 1, status: 0, celldata: tenuredCells });

  // 3. Associate Vintage
  const vintageCells: any[] = [];
  r = 0;
  setCell(vintageCells, r, 0, "Target Collection (₹)", true);
  ['Month 0 (₹)', 'Month 1 (₹)', 'Month 2 (₹)', 'Month 3 (₹)'].forEach((h, idx) => setCell(vintageCells, r, idx + 1, h, true));
  r++;
  (masterGrids.associateVintage || []).forEach((row) => {
    setCell(vintageCells, r, 0, row.target_collection || 0);
    setCell(vintageCells, r, 1, row.m0 || 0); 
    setCell(vintageCells, r, 2, row.m1 || 0);
    setCell(vintageCells, r, 3, row.m2 || 0); 
    setCell(vintageCells, r, 4, row.m3 || 0);
    r++;
  });
  list.push({ name: "Associate Vintage", index: 2, order: 2, status: 0, celldata: vintageCells });

  // 4. Leadership Matrix
  const leadershipCells: any[] = [];
  r = 0;
  setCell(leadershipCells, r, 0, "Role", true);
  setCell(leadershipCells, r, 1, "Target Collection (₹)", true);
  setCell(leadershipCells, r, 2, "Incentive Rate (%)", true);
  r++;
  (masterGrids.leadership || []).forEach((row) => {
    setCell(leadershipCells, r, 0, row.role || 'TL');
    setCell(leadershipCells, r, 1, row.target_collection || 0);
    setCell(leadershipCells, r, 2, row.incentive_percentage || 0);
    r++;
  });
  list.push({ name: "Leadership Matrix", index: 3, order: 3, status: 0, celldata: leadershipCells });

  // 5. Special Exceptions
  const specialCells: any[] = [];
  r = 0;
  setCell(specialCells, r, 0, "Target Collection (₹)", true);
  setCell(specialCells, r, 1, "Incentive Rate (%)", true);
  r++;
  (masterGrids.specialExceptions || []).forEach((row) => {
    setCell(specialCells, r, 0, row.target_collection || 0);
    setCell(specialCells, r, 1, row.incentive_percentage || 0);
    r++;
  });
  list.push({ name: "Special Exceptions", index: 4, order: 4, status: 0, celldata: specialCells });

  return list;
}
