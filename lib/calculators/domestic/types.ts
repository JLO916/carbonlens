import { CountryCode, CostBreakdown, FormFieldConfig } from '@/lib/types';

export interface DomesticInput {
  annualEmissions: number;          // tCO₂e (Scope 1+2)
  industryType: string;
  year: number;
  countrySpecific: Record<string, any>;
}

export interface DomesticResult {
  totalCarbonCost: number;          // local currency
  totalCarbonCostUSD: number;
  effectiveRate: number;            // local currency per tCO₂e
  effectiveRateUSD: number;
  currency: string;
  chargeableEmissions: number;
  breakdown: CostBreakdown[];
  deductibleForCBAM: number;        // EUR
  notes: string[];
}

export interface DomesticCarbonPriceCalculator {
  countryCode: CountryCode;
  countryName: { zhTW: string; en: string };
  mechanismType: 'carbon_tax' | 'ets' | 'carbon_fee' | 'hybrid';

  calculate(input: DomesticInput): DomesticResult;
  getFormFields(): FormFieldConfig[];
  getDefaultParams(): Record<string, any>;
}
