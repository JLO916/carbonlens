// V4 workbench — the single CompanyProfile that drives ALL compliance modules.
// One "me": industry / size / business model / EU-export are captured ONCE here and derived
// into the existing per-module *Input shapes (see derive.ts) — instead of re-asking per module.
// Portfolio-ready from day one: facilities[] (domestic carbon fee) + cbamProducts[] (CBAM lines).

import type { CountryCode } from '@/lib/types';
import type { ActivityLine } from './inventory';
import type { Scope3Line } from './scope3';
import type { TargetDef } from './target';
import type { CustomerLine, SelfRatings } from './scorecard';
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

/** One product/SKU for per-product carbon-footprint allocation (S3). */
export interface ProductLine {
  id: string;
  name: string;
  annualUnits: number; // units produced/shipped per year
  weightPerUnit?: number; // allocation weight per unit — mass (kg) or revenue ($); ignored when basis='equal'
}

/** One CBAM export line — feeds diagnoseCbam. A real manufacturer has several (multi-CN/product). */
export interface CbamProductLine {
  id: string;
  label: string;
  product: CbamProductKey;
  originCountry: string;
  cnCode?: string;
  annualVolumeTonnes: number;
  // 'allocated' (D3) derives the SEE from a linked facility's inventory, allocated by volume.
  emissionsSource: EmissionsSource | 'allocated';
  actualSpecificEmissions?: number; // tCO₂e/t (actual path)
  facilityId?: string; // which facility produces this good (for inventory allocation)
  // R4 #3 — the facility's TOTAL annual production of this good (t). Reg (EU) 2023/1773 allocates
  // embedded emissions over the activity level (total output), NOT the EU export volume; without
  // this the SEE is overstated by total÷exports (≈7× for a 15%-export fastener plant).
  facilityAnnualOutputTonnes?: number;
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
  // C1 — target management: base-year footprint + target year drive the SBTi-style trajectory.
  baseYearEmissionsTonnes?: number; // base-year emissions ON the target scope (if blank, current assumed)
  targetYear?: number; // the year the reduction target is to be met (SBTi near-term ≈ 2030)
  targetScope?: 'scope12' | 'scope123' | 'scope3'; // which boundary the PRIMARY target covers (default scope12)
  // E1 — a real SBTi commitment is a SET of targets (near-term Scope 1+2 + near-term Scope 3 +
  // long-term net-zero). The legacy fields above are the primary target; these are the extras.
  extraTargets?: TargetDef[];
  // G3 — Scope 3 quantification + product carbon footprint:
  scope3?: Scope3Line[];
  annualUnitsSold?: number; // units/yr (e.g. servers) for the per-unit PCF allocation
  unitLabel?: string; // what a "unit" is, e.g. 台 / server
  // S3 — per-SKU product carbon footprint (org-footprint allocation; ISO 14067 screening, NOT a
  // verified LCA). Brands increasingly ask for product-level carbon on the quote/declaration.
  products?: ProductLine[];
  pcfBasis?: 'equal' | 'mass' | 'revenue'; // what weightPerUnit means (allocation key)
  pcfBoundary?: 'scope12' | 'total'; // operations only (S1+2) vs incl. value chain (+ Scope 3)
  // R4 #3 — how much of the year's total output the product list covers (%). The allocation pool is
  // org footprint × this share; leaving it blank assumes 100% and the UI/declaration say so — a
  // 2-SKU list covering 5% of output otherwise overstates per-unit PCF ~20×.
  pcfCoveragePct?: number;
  // C4 — where this profile is in the annual ESG cycle:
  cycleStage?: 'measure' | 'review' | 'assure' | 'assured' | 'filed' | 'disclosed';
  // CS — customer scorecard: each brand customer's carbon/ESG requirements (the "No ESG, No Order"
  // tracker) + self-declared external ratings the tool can't compute (CDP/EcoVadis/S&P CSA).
  scorecardCustomers?: CustomerLine[];
  selfRatings?: SelfRatings;
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
