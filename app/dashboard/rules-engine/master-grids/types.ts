export interface SalaryRange {
  key: string;
  min: number;
  max: number;
  label: string;
}

export interface ColumnMappings {
  collection: string;
  salary: string;
  doj: string;
  designation: string;
  tl_name: string;
  am_name: string;
  employee_code: string;
  employee_name: string;
}

export interface Grid1Mapping {
  locations: string[];
  clients: string[];
  products: string[];
}

export interface MasterGridData {
  associateTenured: any[];
  associateVintage: any[];
  leadership: any[];
  specialExceptions: any[];
  grid1_mapping?: Grid1Mapping;
  column_mappings?: ColumnMappings;
  tenured_salary_ranges?: SalaryRange[];
}

export interface SimulationStats {
  totalPayout: number;
  qualifyingCount: number;
  totalEmployees: number;
  avgPayout: number;
}

export interface SandboxEvaluation {
  slabInfo: string;
  ratePct: number;
  payout: number;
  formulaDesc: string;
}
