import * as XLSX from 'xlsx';

const normalize = (s: string) => String(s || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

export function parseAndValidateKekaWorkbook(
  data: Uint8Array,
  kekaColumns: any[]
): {
  isValid: boolean;
  missingHeaders: string[];
  foundHeaders: string[];
  rowCount: number;
} {
  const wb = XLSX.read(data, { type: 'array' });
  let best: any = null;
  let maxMatches = -1;

  for (const sName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sName], { header: 1 }) as any[][];
    if (!rows?.length) continue;

    for (let i = 0; i < Math.min(50, rows.length); i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const nRow = row.map(k => normalize(String(k)));
      let matches = 0;
      kekaColumns.forEach(req => {
        if (req.labels?.some((l: string) => nRow.includes(normalize(l)))) matches++;
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        const hRow = row.map(k => normalize(String(k)));
        const missing: string[] = [];
        const found: string[] = [];
        kekaColumns.forEach(req => {
          if (req.labels?.some((l: string) => hRow.includes(normalize(l)))) found.push(req.display);
          else missing.push(req.display);
        });
        best = {
          isValid: missing.length === 0,
          missingHeaders: missing,
          foundHeaders: found,
          rowCount: rows.length - (i + 1)
        };
      }
    }
  }

  return best || {
    isValid: false,
    missingHeaders: kekaColumns.map(r => r.display),
    foundHeaders: [],
    rowCount: 0
  };
}
