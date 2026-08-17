import * as XLSX from 'xlsx';
import { COLUMN_ORDER } from './constants';

export function buildTableCols(
  masterClientsList: any[],
  filterClient: string,
  filterProduct: string,
  masterColumns: any[],
  leadColumns: any[]
) {
  const selectedClientData = masterClientsList.find(
    (c: any) => c.name === filterClient && c.product_type === filterProduct
  );
  const clientRequiredCols: any[] = selectedClientData?.required_columns
    ? (Array.isArray(selectedClientData.required_columns)
        ? selectedClientData.required_columns
        : JSON.parse(selectedClientData.required_columns || '[]'))
    : [];

  return (clientRequiredCols.length > 0
    ? clientRequiredCols.map((colKey: string) => {
        const found = masterColumns.find((m: any) => m.key === colKey);
        return {
          key: colKey,
          label: found?.display || colKey,
          visible: true,
          type: colKey.includes('amount') || colKey === 'outstanding' || colKey === 'money_collected' ? 'amount' : 'text'
        };
      })
    : leadColumns.filter((c: any) => c.visible !== false)
  ).sort((a: any, b: any) => (COLUMN_ORDER[a.key?.toLowerCase()]?.order || 999) - (COLUMN_ORDER[b.key?.toLowerCase()]?.order || 999));
}

export function exportRecordsToExcel(records: any[], fileName = 'DPF_Records.xlsx') {
  if (!records.length) {
    alert('No records to export');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(records);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Records");
  XLSX.writeFile(wb, fileName);
}
