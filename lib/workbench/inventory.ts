// GHG-inventory builder (V8) — turn ACTIVITY DATA into a facility's emissions with full calculation
// lineage (the 80% of ESG work the tool previously skipped). Each line: amount × factor = tCO₂e,
// with the factor + source traceable for assurance. Pure + testable.

import { FACTOR_BY_KEY, gridFactorFor, type EmissionFactor, type Scope } from './emission-factors';
import type { FacilityLine } from './profile';
import type { BilingualText } from '@/lib/diagnose/types';
import type { CountryCode } from '@/lib/types';

/** Data-quality tier for an activity line (drives the assurance audit trail). */
export type DataQuality = 'measured' | 'invoice' | 'estimate';

export const DATA_QUALITY_LABEL: Record<DataQuality, BilingualText> = {
  measured: { zhTW: '實測（計量器／CEMS）', en: 'Measured (meter/CEMS)' },
  invoice: { zhTW: '發票／帳單', en: 'Invoice/bill' },
  estimate: { zhTW: '估算', en: 'Estimate' },
};

/** One activity-data line (e.g. 1,200,000 kWh electricity, 5,000 L diesel). */
export interface ActivityLine {
  id: string;
  factorKey: string; // → EMISSION_FACTORS
  amount: number; // in the factor's activity unit
  customFactor?: number; // override kgCO₂e/unit (facility-specific or newer version)
  // P1b — assurance metadata (does NOT change the computed tonnes; travels into the inventory sheet):
  dataQuality?: DataQuality; // measured (CEMS/meter) > invoice (台電/油單) > estimate
  evidenceNote?: string; // 佐證來源, e.g. 台電電費單 2025/01–12、加油發票
  uncertaintyPct?: number; // optional ± uncertainty for the activity figure
  // F2 — abatement destruction/removal efficiency % (0–100). For abated F-gases / flared streams the
  // reported emission is consumption × factor × (1 − DRE) (IPCC Tier 2b). Needs verified abatement
  // data; default undefined = no abatement (conservative gross).
  abatementPct?: number;
}

export interface InventoryLineResult {
  line: ActivityLine;
  factor: EmissionFactor | undefined;
  effectiveFactor: number; // customFactor ?? factor.kgco2ePerUnit
  isOverride: boolean;
  scope: Scope;
  grossTonnes: number; // amount × effectiveFactor / 1000 (before abatement)
  abatementPct: number; // F2 — destruction/removal efficiency applied (0 when none)
  tonnes: number; // reported = grossTonnes × (1 − abatementPct/100)
}

/** E2 — combined ± uncertainty over the QUANTIFIED portion of the inventory (the lines that carry a
 *  ±%), plus how much of total emissions that portion covers. The "last mile" assurance asks for. */
export interface InventoryUncertainty {
  pct: number; // combined ±% of the covered emissions (quadrature, independent-sources assumption)
  coveragePct: number; // share of total emissions that carry an uncertainty figure
}

/** E2 — share of total emissions by data-quality tier (assurance scores the data trail). */
export interface DataQualityMix {
  measured: number; // %
  invoice: number;
  estimate: number;
  unspecified: number;
}

export interface InventoryResult {
  lines: InventoryLineResult[];
  totalTonnes: number; // location-based total (scope1 + scope2 location)
  scope1Tonnes: number;
  scope2Tonnes: number; // location-based Scope 2 (grid factor)
  // G2 — GHG Protocol Scope 2 dual reporting + RE100:
  scope2MarketTonnes: number; // market-based Scope 2 (after contracted renewables)
  totalMarketTonnes: number; // scope1 + scope2Market
  renewablePct: number; // 0–100, the RE100 progress figure applied
  // E2 — assurance rollups (collected per line in P1b, summarised here):
  uncertainty?: InventoryUncertainty; // combined ±% over the quantified portion
  dataQualityMix: DataQualityMix; // % of emissions by data-quality tier
}

const round = (x: number) => Math.round(x * 1000) / 1000;

/** Compute a facility inventory from its activity lines, with per-line lineage. `countryCode` makes
 *  the electricity (Scope 2) factor follow that country's grid (G1) — so a Vietnam plant uses
 *  Vietnam's 0.6592, not Taiwan's 0.474 — unless the line carries an explicit override. */
export function computeInventory(activities: ActivityLine[], countryCode?: CountryCode, renewablePct = 0): InventoryResult {
  const lines: InventoryLineResult[] = activities.map((line) => {
    let factor = FACTOR_BY_KEY[line.factorKey];
    if (line.factorKey === 'electricity' && countryCode && factor) {
      const gf = gridFactorFor(countryCode);
      factor = { ...factor, kgco2ePerUnit: gf.kgco2ePerUnit, source: gf.source };
    }
    const isOverride = typeof line.customFactor === 'number' && line.customFactor >= 0;
    const effectiveFactor = isOverride ? (line.customFactor as number) : factor?.kgco2ePerUnit ?? 0;
    const scope: Scope = factor?.scope ?? 1;
    const grossTonnes = round((Math.max(0, line.amount) * effectiveFactor) / 1000);
    // F2 — abatement (DRE): reported emission = gross × (1 − DRE). Only reduces; clamps to 0–100.
    const abatementPct = Math.max(0, Math.min(100, line.abatementPct ?? 0));
    const tonnes = round(grossTonnes * (1 - abatementPct / 100));
    return { line, factor, effectiveFactor, isOverride, scope, grossTonnes, abatementPct, tonnes };
  });
  const scope1Tonnes = round(lines.filter((l) => l.scope === 1).reduce((a, l) => a + l.tonnes, 0));
  const scope2Tonnes = round(lines.filter((l) => l.scope === 2).reduce((a, l) => a + l.tonnes, 0));
  // G2 — market-based Scope 2: contracted renewables (PPA/REC) zero out that share. Simplified
  // (residual ≈ grid factor); strict accounting uses a residual-mix factor.
  const r = Math.max(0, Math.min(100, renewablePct)) / 100;
  const scope2MarketTonnes = round(scope2Tonnes * (1 - r));
  const total = scope1Tonnes + scope2Tonnes;

  // E2 — combine per-line ± uncertainty in quadrature (independent-sources assumption), expressed as
  // ±% of the QUANTIFIED portion, plus that portion's coverage of total emissions. Lines without a
  // ±% are excluded from the combination and surfaced via coverage (honest, not silently zeroed).
  const withU = lines.filter((l) => typeof l.line.uncertaintyPct === 'number' && (l.line.uncertaintyPct as number) > 0 && l.tonnes > 0);
  const coveredTonnes = withU.reduce((a, l) => a + l.tonnes, 0);
  const absU = Math.sqrt(withU.reduce((a, l) => { const abs = l.tonnes * ((l.line.uncertaintyPct as number) / 100); return a + abs * abs; }, 0));
  const uncertainty: InventoryUncertainty | undefined = coveredTonnes > 0
    ? { pct: round((absU / coveredTonnes) * 100), coveragePct: total > 0 ? round((coveredTonnes / total) * 100) : 0 }
    : undefined;

  // E2 — data-quality mix: share of emissions by tier (lines without a tier → unspecified).
  const tierTonnes = (q: DataQuality | 'unspecified') => lines.filter((l) => (l.line.dataQuality ?? 'unspecified') === q).reduce((a, l) => a + l.tonnes, 0);
  const pctOf = (x: number) => (total > 0 ? round((x / total) * 100) : 0);
  const dataQualityMix: DataQualityMix = {
    measured: pctOf(tierTonnes('measured')),
    invoice: pctOf(tierTonnes('invoice')),
    estimate: pctOf(tierTonnes('estimate')),
    unspecified: pctOf(tierTonnes('unspecified')),
  };

  return {
    lines,
    totalTonnes: round(total),
    scope1Tonnes,
    scope2Tonnes,
    scope2MarketTonnes,
    totalMarketTonnes: round(scope1Tonnes + scope2MarketTonnes),
    renewablePct: round(r * 100),
    uncertainty,
    dataQualityMix,
  };
}

/** F2 — note for the abatement (DRE) reduction, so it isn't taken as a free unsourced cut. */
export const ABATEMENT_NOTE: BilingualText = {
  zhTW: '減排設備去除率(DRE):已裝廢氣燃燒/電漿洗滌等末端處理時,申報排放 = 用量 × 係數 ×（1−DRE)。半導體含氟氣體常 90–99%。須附查證之破壞去除效率(IPCC Tier 2b;精確盤查另計氣體利用率與副產物)。未填=不抵減(保守毛排放)。',
  en: 'Abatement (DRE): with end-of-pipe combustion/plasma scrubbing, reported = consumption × factor × (1 − DRE). Semiconductor F-gases are often 90–99%. Requires a verified destruction/removal efficiency (IPCC Tier 2b; precise inventories also model gas utilization + byproducts). Blank = no reduction (conservative gross).',
};

/** E2 — methodology note for the aggregated uncertainty (so the rollup isn't a black box). */
export const UNCERTAINTY_NOTE: BilingualText = {
  zhTW: '整體不確定性以各活動數據的 ±% 在「平方和開根號(quadrature)」下合併,假設各排放源彼此獨立(GHG Protocol / IPCC 誤差傳遞);僅涵蓋有填 ±% 的項目,涵蓋率另列。此為指示性,非完整蒙地卡羅不確定性分析。',
  en: 'Overall uncertainty combines each activity figure’s ±% in quadrature (root-sum-of-squares), assuming sources are independent (GHG Protocol / IPCC error propagation). It covers only lines that carry a ±%; coverage is shown separately. Indicative — not a full Monte-Carlo uncertainty assessment.',
};

/** The emissions a facility contributes — from its built inventory when present, else the typed total. */
export function facilityEmissionsTonnes(facility: FacilityLine): number {
  if (facility.useInventory) {
    const t = computeInventory(facility.activities ?? [], facility.countryCode as CountryCode).totalTonnes;
    // Inventory mode but the built total is still 0 (no/zero activity data) → fall back to the typed
    // total so the carbon fee is NEVER silently zeroed mid-inventory (P0 trust fix). The UI flags it.
    if (t > 0) return t;
    return facility.annualEmissionsTonnes || 0;
  }
  return facility.annualEmissionsTonnes;
}

/** Emissions-basis status — drives the UI warning when inventory mode is on but the built total is
 *  still 0, so the fee transparently falls back to the typed total instead of silently dropping to 0. */
export interface FacilityEmissionsStatus {
  usingInventory: boolean;
  inventoryTotalTonnes: number; // the actual computed inventory (0 while incomplete)
  feeBasisTonnes: number; // what actually feeds the carbon fee (inventory, or typed fallback)
  typedTotalTonnes: number; // the preserved "type total" value
  inventoryIncomplete: boolean; // inventory mode + built total 0 → using typed fallback
}

export function facilityEmissionsStatus(facility: FacilityLine): FacilityEmissionsStatus {
  const usingInventory = !!facility.useInventory;
  const inventoryTotalTonnes = usingInventory ? computeInventory(facility.activities ?? [], facility.countryCode as CountryCode).totalTonnes : 0;
  const typedTotalTonnes = facility.annualEmissionsTonnes || 0;
  return {
    usingInventory,
    inventoryTotalTonnes,
    feeBasisTonnes: facilityEmissionsTonnes(facility),
    typedTotalTonnes,
    inventoryIncomplete: usingInventory && inventoryTotalTonnes === 0,
  };
}
