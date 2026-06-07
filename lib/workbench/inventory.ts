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
}

export interface InventoryLineResult {
  line: ActivityLine;
  factor: EmissionFactor | undefined;
  effectiveFactor: number; // customFactor ?? factor.kgco2ePerUnit
  isOverride: boolean;
  scope: Scope;
  tonnes: number; // amount × effectiveFactor / 1000
}

export interface InventoryResult {
  lines: InventoryLineResult[];
  totalTonnes: number;
  scope1Tonnes: number;
  scope2Tonnes: number;
}

const round = (x: number) => Math.round(x * 1000) / 1000;

/** Compute a facility inventory from its activity lines, with per-line lineage. `countryCode` makes
 *  the electricity (Scope 2) factor follow that country's grid (G1) — so a Vietnam plant uses
 *  Vietnam's 0.6592, not Taiwan's 0.474 — unless the line carries an explicit override. */
export function computeInventory(activities: ActivityLine[], countryCode?: CountryCode): InventoryResult {
  const lines: InventoryLineResult[] = activities.map((line) => {
    let factor = FACTOR_BY_KEY[line.factorKey];
    if (line.factorKey === 'electricity' && countryCode && factor) {
      const gf = gridFactorFor(countryCode);
      factor = { ...factor, kgco2ePerUnit: gf.kgco2ePerUnit, source: gf.source };
    }
    const isOverride = typeof line.customFactor === 'number' && line.customFactor >= 0;
    const effectiveFactor = isOverride ? (line.customFactor as number) : factor?.kgco2ePerUnit ?? 0;
    const scope: Scope = factor?.scope ?? 1;
    const tonnes = round((Math.max(0, line.amount) * effectiveFactor) / 1000);
    return { line, factor, effectiveFactor, isOverride, scope, tonnes };
  });
  const scope1Tonnes = round(lines.filter((l) => l.scope === 1).reduce((a, l) => a + l.tonnes, 0));
  const scope2Tonnes = round(lines.filter((l) => l.scope === 2).reduce((a, l) => a + l.tonnes, 0));
  return { lines, totalTonnes: round(scope1Tonnes + scope2Tonnes), scope1Tonnes, scope2Tonnes };
}

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
