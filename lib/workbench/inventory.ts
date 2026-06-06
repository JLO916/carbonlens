// GHG-inventory builder (V8) — turn ACTIVITY DATA into a facility's emissions with full calculation
// lineage (the 80% of ESG work the tool previously skipped). Each line: amount × factor = tCO₂e,
// with the factor + source traceable for assurance. Pure + testable.

import { FACTOR_BY_KEY, type EmissionFactor, type Scope } from './emission-factors';
import type { FacilityLine } from './profile';

/** One activity-data line (e.g. 1,200,000 kWh electricity, 5,000 L diesel). */
export interface ActivityLine {
  id: string;
  factorKey: string; // → EMISSION_FACTORS
  amount: number; // in the factor's activity unit
  customFactor?: number; // override kgCO₂e/unit (facility-specific or newer version)
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

/** Compute a facility inventory from its activity lines, with per-line lineage. */
export function computeInventory(activities: ActivityLine[]): InventoryResult {
  const lines: InventoryLineResult[] = activities.map((line) => {
    const factor = FACTOR_BY_KEY[line.factorKey];
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
  if (facility.useInventory && facility.activities && facility.activities.length > 0) {
    return computeInventory(facility.activities).totalTonnes;
  }
  return facility.annualEmissionsTonnes;
}
