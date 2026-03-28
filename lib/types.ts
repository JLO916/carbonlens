export type CountryCode = 'tw' | 'th' | 'vn' | 'sg' | 'kr' | 'jp';

export interface BilingualText {
  zhTW: string;
  en: string;
}

export interface CountryConfig {
  code: CountryCode;
  name: BilingualText;
  flag: string;
  currency: string;
  currencySymbol: string;
  mechanism: BilingualText;
  mechanismType: 'carbon_tax' | 'ets' | 'carbon_fee' | 'hybrid';
  currentRate: { value: number; unit: string; year: number };
  status: 'active' | 'planned' | 'pilot';
  cbamRelevance: 'high' | 'medium' | 'low';
  keyIndustries: string[];
}

// CBAM types
export interface CBAMInput {
  productType: string;
  importVolume: number;              // tonnes of product
  specificEmbeddedEmissions: number; // tCO₂e per tonne of product
  useDefaultEmissions: boolean;
  year: number;
  euEtsPrice: number;                // EUR per tCO₂e
  domesticCarbonPricePaid: number;   // EUR total already paid in origin country
  originCountry: CountryCode | 'other';
  euBenchmark?: number;              // EU ETS benchmark (tCO₂e/t product), auto-filled if omitted
}

export interface CBAMResult {
  totalCBAMCost: number;             // EUR (gross, before domestic deduction)
  totalCBAMCostUSD: number;
  grossEmissions: number;            // tCO₂e
  freeAllocation: number;            // tCO₂e (EU benchmark × phase-out factor × volume)
  netEmissions: number;              // tCO₂e (gross - free allocation)
  cbamFactor: number;                // phase-out factor (% free allocation remaining)
  cbamCertificatePrice: number;
  domesticCreditDeduction: number;   // EUR
  netCBAMCost: number;               // EUR (after domestic deduction)
  breakdown: CostBreakdown[];
  notes: string[];
  isExempt: boolean;
}

export interface CostBreakdown {
  step: string;
  value: number;
  unit: string;
  explanation: string;
}

export interface FormFieldConfig {
  key: string;
  type: 'number' | 'select' | 'toggle' | 'radio';
  label: BilingualText;
  options?: { value: string; label: BilingualText }[];
  defaultValue: any;
  required: boolean;
  tooltip?: BilingualText;
}
