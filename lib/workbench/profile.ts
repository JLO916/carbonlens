// V4 workbench — the single CompanyProfile that drives ALL compliance modules.
// One "me": industry / size / business model / EU-export are captured ONCE here and derived
// into the existing per-module *Input shapes (see derive.ts) — instead of re-asking per module.
// Portfolio-ready from day one: facilities[] (domestic carbon fee) + cbamProducts[] (CBAM lines).

import type { CountryCode } from '@/lib/types';
import type { ActivityLine } from './inventory';
import type {
  ListingType,
  CapitalTier,
  EmployeeBand,
  BusinessModel,
  FrameworkKey,
  CbamProductKey,
  EmissionsSource,
} from '@/lib/diagnose/types';

/** One emitting facility — feeds the domestic carbon-fee engine (Taiwan first; multi-country ready). */
export interface FacilityLine {
  id: string;
  label: string;
  countryCode: CountryCode;
  annualEmissionsTonnes: number; // Scope 1+2 — used when not building from activity data
  // V8: GHG-inventory build-up from activity data (electricity, fuels…). When useInventory is on,
  // the facility's emissions are computed from `activities` instead of the typed total.
  useInventory?: boolean;
  activities?: ActivityLine[];
  // G2: % of electricity from contracted renewables (PPA/REC/green tariff) — drives market-based
  // Scope 2 (GHG Protocol dual reporting) and RE100 progress. 0–100.
  renewablePct?: number;
  // Taiwan carbon-fee params (countrySpecific for taiwanCalculator):
  highCarbonLeakage: boolean;
  rateType: 'general' | 'preferA' | 'preferB';
  carbonCreditOffset: number; // tCO₂e offset
  /** Preferential rate + leakage coefficient legally require an MOENV-approved voluntary reduction
   *  plan (A1). When false, the workbench forces the general rate — no 優惠/CL applied. */
  hasApprovedReductionPlan: boolean;
}

/** One CBAM export line — feeds diagnoseCbam. A real manufacturer has several (multi-CN/product). */
export interface CbamProductLine {
  id: string;
  label: string;
  product: CbamProductKey;
  originCountry: string;
  cnCode?: string;
  annualVolumeTonnes: number;
  emissionsSource: EmissionsSource;
  actualSpecificEmissions?: number; // tCO₂e/t (actual path)
}

export interface CompanyProfile {
  schemaVersion: 1;
  company?: string;
  industry: string; // feeds listed + supply-chain (replaces 3× re-ask)
  // Disclosure (listed):
  listingType: ListingType;
  capitalTier: CapitalTier;
  hasSustainabilityReport: boolean;
  // Size + value-chain position:
  employeeBand: EmployeeBand;
  businessModel: BusinessModel;
  // Export posture:
  exportsToEU: boolean;
  exportSupplyChain: boolean;
  customerFrameworks: FrameworkKey[];
  // Portfolio:
  facilities: FacilityLine[];
  cbamProducts: CbamProductLine[];
  // Shared CBAM assumptions:
  etsPrice?: number; // central ETS price
  etsPriceLow?: number; // A3 — sensitivity band (defaults to central if unset)
  etsPriceHigh?: number;
  passThroughPct?: number;
  // Reduction lever (V4.3):
  targetReductionPct?: number;
  // Analysis year (drives both the carbon-fee period and the CBAM factor):
  year: number;
  // Base year for reduction targets / SBTi (P1c) — the reference year cuts are measured against:
  baseYear?: number;
}

/** Taiwan carbon-fee period band for a year (CL-coefficient schedule). */
export function taiwanPeriodForYear(year: number): 'period1_2025_2026' | 'period2_2027_2028' | 'period3_2029_2030' {
  if (year >= 2029) return 'period3_2029_2030';
  if (year >= 2027) return 'period2_2027_2028';
  return 'period1_2025_2026';
}

/** A sensible starting profile (stable IDs → deterministic in tests). */
export function emptyProfile(): CompanyProfile {
  return {
    schemaVersion: 1,
    industry: 'electronics',
    listingType: 'listed',
    capitalTier: 'under50',
    hasSustainabilityReport: true,
    employeeBand: 'from250to999',
    businessModel: 'odm_oem',
    exportsToEU: true,
    exportSupplyChain: true,
    customerFrameworks: ['sbti'],
    facilities: [
      {
        id: 'facility-1',
        label: '主要廠區',
        countryCode: 'tw',
        annualEmissionsTonnes: 50000,
        highCarbonLeakage: false,
        rateType: 'general',
        carbonCreditOffset: 0,
        hasApprovedReductionPlan: false,
      },
    ],
    cbamProducts: [
      {
        id: 'cbam-1',
        label: '出口品項 1',
        product: 'steel',
        originCountry: 'tw',
        annualVolumeTonnes: 5000,
        emissionsSource: 'official_default',
      },
    ],
    etsPrice: undefined,
    passThroughPct: undefined,
    targetReductionPct: undefined,
    year: 2026,
  };
}
