// Shared types for the Carbon Compliance Exposure Diagnostic tool (碳合規暴露診斷工具).
// Brief: RECC_碳合規診斷工具_ClaudeCode_BuildBrief_v0.4.
// Data layer is separated from UI; every cited value carries a Citation (§5/§6).

import type { BilingualText } from '@/lib/types';

export type { BilingualText };

/** Provenance for every regulatory figure shown in the tool — honest-disclosure UI (§5/§6). */
export interface Citation {
  /** Human-readable source name(s). */
  source: BilingualText;
  /** Official document / version this value was synced from. */
  officialDocVersion: BilingualText;
  /** Sync / verification date, ISO-ish (YYYY-MM or YYYY-MM-DD). */
  asOfDate: string;
  /** Target next-review date (maintenance cadence) — surfaces freshness so a stale date isn't mistaken for current. */
  nextReview?: string;
  /** Optional canonical URL. */
  url?: string;
}

/** A single value paired with its citation — the unit of the cited data ledger (§6). */
export interface Cited<T> {
  value: T;
  citation: Citation;
}

// ---- Module 1: Listed-company disclosure (上市櫃揭露, §3A/§6A) ----

export type ListingType = 'listed' | 'otc'; // 上市 / 上櫃
export type CapitalTier = 'over100' | 'from50to100' | 'under50'; // 實收資本額級距 (億 NTD)
export type IfrsPhase = 1 | 2 | 3;

export interface ListedInput {
  listingType: ListingType;
  capitalTier: CapitalTier;
  hasSustainabilityReport: boolean; // 是否已編永續報告書
  industry: string; // 產業別 — qualitative context only (no sourced numeric weight)
}

export interface UrgencyComponent {
  key: 'deadline' | 'exposure' | 'scale';
  label: BilingualText;
  /** Normalized 0–1 sub-score. */
  raw01: number;
  /** Strategic weight — Brief §4, fixed 40/35/25. */
  weight: number;
  /** raw01 * weight. */
  weighted: number;
  rationale: BilingualText;
}

export interface UrgencyBreakdown {
  total: number; // 0–100, rounded
  components: UrgencyComponent[];
  /** Discloses that sub-scores are tool-defined adjustable parameters, not official figures. */
  methodologyNote: BilingualText;
}

export interface IfrsPhaseInfo {
  phase: IfrsPhase;
  capitalLabel: BilingualText;
  firmCount: BilingualText;
  compileFY: BilingualText; // 編製會計年度
  fileYear: number;
  /** Present ONLY when the source gives a day-precise date (phase 1). */
  fileDeadlineISO?: string;
  fileLabel: BilingualText; // 申報時程 at sourced precision
  citation: Citation;
}

export interface GriObligationInfo {
  applies: boolean;
  effectiveFrom: number;
  scopeNote: BilingualText;
  annualDeadlineLabel: BilingualText; // 每年 8/31 前
  basis: BilingualText; // GRI + SASB
  citation: Citation;
}

export interface ScopeItem {
  key: 'scope1' | 'scope2' | 'scope3';
  label: BilingualText;
  description: BilingualText;
  isHardest?: boolean;
}

export interface DisclosureScopeInfo {
  items: ScopeItem[];
  hardestNote: BilingualText; // Scope 3 為最大難點
  citation: Citation;
}

export interface ListedResult {
  input: ListedInput;
  gri: GriObligationInfo;
  ifrs: IfrsPhaseInfo;
  adoptionBasisNote: BilingualText;
  disclosureScope: DisclosureScopeInfo;
  urgency: UrgencyBreakdown;
}

// ---- Module 2: Supply-chain carbon demands (供應鏈碳要求, §3C/§6C) — qualitative ----

export type FrameworkKey = 're100' | 'sbti' | 'cdp' | 'unsure';
export type EmployeeBand = 'under250' | 'from250to999' | 'over1000';
export type PressureLevel = 'low' | 'medium' | 'high';

export interface SupplyChainInput {
  /** Which public commitments the key BRAND CUSTOMERS have made (user attests from public lists). */
  frameworks: FrameworkKey[];
  industry: string;
  exportSupplyChain: boolean; // 是否供應出口供應鏈
  employeeBand: EmployeeBand; // 員工規模 — CSRD value-chain cap threshold (<1,000)
}

export interface FrameworkExpectation {
  key: Exclude<FrameworkKey, 'unsure'>;
  name: BilingualText;
  commitment: BilingualText;
  expectedAsk: BilingualText;
}

export interface SupplyChainResult {
  input: SupplyChainInput;
  /** Qualitative tool synthesis — NOT a $ amount, NOT a specific brand demand. */
  pressureLevel: PressureLevel;
  pressureRationale: BilingualText;
  pressureNote: BilingualText;
  /** Per selected concrete framework; empty when only 'unsure'. */
  expectations: FrameworkExpectation[];
  unsureNote?: BilingualText;
  scope3: { points: BilingualText[]; industryNote?: BilingualText; citation: Citation };
  transmission: { text: BilingualText; citation: Citation };
  csrdProtection: { protected: boolean; text: BilingualText; citation: Citation };
  frameworksCitation: Citation;
}

// ---- Module 3: CBAM exposure (§3B/§6B/§7) — conditional range; defaults via synced cache ----

export type CbamProductKey = 'cement' | 'steel' | 'aluminum' | 'fertilizer' | 'electricity' | 'hydrogen';
export type EmissionsSource = 'actual' | 'official_default';

export interface CbamInput {
  exportsToEU: boolean;
  product: CbamProductKey;
  originCountry: string;
  annualVolumeTonnes: number;
  year: number; // 2026 | 2027 | 2028 — mark-up schedule
  emissionsSource: EmissionsSource;
  actualSpecificEmissions?: number; // tCO₂e per tonne (actual-data path)
  etsPrice?: number; // EUR per tCO₂e — user-set, conditional (§3B)
}

export interface CbamExposure {
  deMinimisExempt: boolean;
  /** Official-default path is unavailable until a verified sync populates the live cache (§7.3). */
  defaultsLocked: boolean;
  totalEmissions?: number; // tCO₂e, incl. mark-up
  markupApplied?: number; // e.g. 0.10
  etsPrice?: number;
  indicativeExposureEUR?: number; // emissions(incl. mark-up) × ETS price
  // Official-default path (unlocked after human baseline confirmation):
  fromOfficialDefault?: boolean;
  defaultPerTonne?: number; // marked-up median emission factor (tCO₂e/t)
  defaultN?: number; // sample size behind the median
  defaultAsOf?: string;
  exposureMinEUR?: number; // category min–max spread → exposure range
  exposureMaxEUR?: number;
}

export interface CbamResult {
  input: CbamInput;
  exposure: CbamExposure;
  timeline: { label: BilingualText; value: BilingualText }[];
  penaltyNote: BilingualText;
  deMinimisNote: BilingualText;
  markupNote: BilingualText;
  disclosures: BilingualText[]; // §5 CBAM-specific honest disclosure
  citations: Citation[];
  cacheStatus: CbamCacheStatus;
}

// CBAM synced cache + sync pipeline (§6B data structure, §7 mechanism)

export interface CbamDefaultValue {
  cnCode: string;
  product: string;
  country: string;
  directDefaultTco2ePerT: number;
  source: string;
  officialDocVersion: string;
  asOfDate: string;
}

export interface CbamGridFactor {
  country: string;
  tco2ePerMwh: number;
  source: string;
  officialDocVersion: string;
  asOfDate: string;
}

export type CbamCacheStatus = 'locked' | 'live' | 'pending_human_baseline';

export interface CbamCache {
  status: CbamCacheStatus;
  defaultValues: CbamDefaultValue[];
  gridFactors: CbamGridFactor[];
  meta: {
    officialDocVersion: BilingualText;
    asOfDate: string | null; // null until a verified sync
    syncedAt: string | null;
    note?: BilingualText;
  };
}

/** §7.2 anomaly-check thresholds (configurable; conservative defaults). */
export interface AnomalyThresholds {
  singleValuePct: number; // 0.15
  batchPct: number; // 0.10
  structurePct: number; // 0.05
}

export interface AnomalyResult {
  passed: boolean;
  needsHumanBaseline: boolean;
  reasons: string[];
}

// ---- Lead capture / routing (§4, §7.3) ----

export type ModuleKey = 'listed' | 'supply-chain' | 'cbam';

/** Union of per-module inputs carried in a lead payload. */
export type DiagnosticInput = ListedInput | SupplyChainInput | CbamInput;

export type LeadPool = 'individual' | 'enterprise';

export interface LeadRoutingResult {
  recommendedPool: LeadPool;
  signals: BilingualText[];
}

/** Signals used to route a lead to the individual/enterprise pool (§4). */
export interface RoutingInput {
  capitalTier?: CapitalTier;
  employeeBand?: EmployeeBand;
  exportSupplyChain?: boolean;
  euExporter?: boolean; // CBAM module — exports to the EU
  role?: string;
  email?: string;
}

export interface LeadPayload {
  email: string;
  role?: string;
  company?: string;
  module: ModuleKey;
  pool: LeadPool;
  /** Module-1 urgency (0–100). */
  score?: number;
  /** Module-2 qualitative pressure. */
  pressureLevel?: PressureLevel;
  input: DiagnosticInput;
}
