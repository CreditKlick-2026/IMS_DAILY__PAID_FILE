import * as XLSX from 'xlsx';

const normalize = (s: string) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

export function parseAndValidateWorkbook(
  data: Uint8Array,
  activeHeaders: any[]
): {
  validationResult: any;
  validatedData: { valid: any[]; invalid: any[] } | null;
  errorMessage?: string;
} {
  const workbook = XLSX.read(data, { type: 'array' });
  let best: any = null;
  let maxMatches = -1;

  for (const sName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    if (!rows?.length) continue;

    for (let i = 0; i < Math.min(50, rows.length); i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const nRow = row.map(k => normalize(String(k)));
      let matches = 0;
      activeHeaders.forEach((req: any) => {
        if (req.labels?.some((l: string) => nRow.includes(normalize(l)))) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        const hRow = row.map(k => normalize(String(k)));
        const missing: string[] = [];
        const found: string[] = [];
        activeHeaders.forEach((req: any) => {
          if (req.labels?.some((l: string) => hRow.includes(normalize(l)))) found.push(req.display);
          else missing.push(req.display);
        });
        best = {
          isValid: missing.length === 0,
          missingHeaders: missing,
          foundHeaders: found,
          rowCount: rows.length - (i + 1),
          sheetName: sName,
          headerIndex: i
        };
      }
    }
  }

  if (!best || maxMatches === 0) {
    return {
      validationResult: { isValid: false, missingHeaders: activeHeaders.map((r: any) => r.display), foundHeaders: [], rowCount: 0 },
      validatedData: null,
      errorMessage: "No matching headers found in any sheet. Please check column names."
    };
  }

  let validatedData: { valid: any[]; invalid: any[] } | null = null;
  if (best.isValid) {
    const sheet = workbook.Sheets[best.sheetName];
    const allData = XLSX.utils.sheet_to_json(sheet, { range: best.headerIndex }) as any[];
    const validRows: any[] = [];
    const invalidRows: any[] = [];

    allData.forEach((row: any, idx: number) => {
      const get = (keys: string[]) => {
        for (const k of keys) {
          const target = normalize(k);
          const foundKey = Object.keys(row).find(r => normalize(r) === target);
          if (foundKey !== undefined && row[foundKey] !== undefined && row[foundKey] !== '') return row[foundKey];
        }
        return null;
      };
      const accNo = get(['Account_No', 'Account No', 'LAN', 'Loan No']);
      const errors = [];
      if (!accNo) errors.push("Missing Account No");
      if (errors.length > 0) invalidRows.push({ _rowIndex: idx + 2, _errors: errors, ...row });
      else validRows.push({ _rowIndex: idx + 2, ...row });
    });
    validatedData = { valid: validRows, invalid: invalidRows };
  }

  return { validationResult: best, validatedData };
}
