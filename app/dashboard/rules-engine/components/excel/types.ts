export interface CellValue {
  v: any;
  m?: string;
  bl?: number;
  bg?: string | null;
  f?: string;
}

export interface CellData {
  r: number;
  c: number;
  v: CellValue;
}

export interface Sheet {
  name: string;
  index: number;
  order?: number;
  status?: number;
  celldata?: CellData[];
}

export interface SelectedCellCoord {
  r: number;
  c: number;
}

export interface ExcelSpreadsheetProps {
  title: string;
  subtitle: string;
  initialData?: Sheet[];
  onSave?: (sheets: Sheet[]) => Promise<void>;
  hideBackButton?: boolean;
}
