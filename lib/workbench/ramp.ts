// CBAM cost RAMP 2026→2034 (critique: a single-year number hides the phase-in story — small now,
// big later, so prepare now). Reuses cbamFactorForYear. The band is derived ONLY from sourced
// inputs (the official category min–max, or the user's actual SEE) — NO fabricated spread:
//   low/high = Σ volume × (min|max embedded) × CBAM-factor[year] × ETS price
//   central  = only when every line has a single point value (CN-exact or actual); never invented.

import { cbamFactorForYear } from '@/lib/diagnose/data/cbam';
import type { CompanyProfile } from './profile';
import type { CbamDefaultLookup } from '@/lib/diagnose/logic/cbam';

export interface RampPoint {
  year: number;
  lowEUR: number;
  highEUR: number;
  centralEUR?: number;
}
export interface CbamRamp {
  points: RampPoint[];
  lockedLines: number;
  hasCentral: boolean;
  etsPrice?: number;
}

const RAMP_YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];

/** Per-line embedded-emission band (tCO₂e/t). null = locked (official-default, no lookup). */
function lineEmissionBand(
  line: CompanyProfile['cbamProducts'][number],
  lookup: CbamDefaultLookup | undefined,
): { low: number; high: number; central?: number } | null {
  if (line.emissionsSource === 'actual') {
    const a = line.actualSpecificEmissions;
    return a && a > 0 ? { low: a, high: a, central: a } : null;
  }
  if (!lookup) return null; // official-default path, not unlocked → locked
  if (lookup.mode === 'cn') return { low: lookup.value, high: lookup.value, central: lookup.value };
  return { low: lookup.min, high: lookup.max }; // range: honest band, NO central
}

export function cbamRampSeries(profile: CompanyProfile, lookups: (CbamDefaultLookup | undefined)[] = []): CbamRamp {
  const ets = profile.etsPrice;
  if (!ets || ets <= 0 || !profile.exportsToEU) return { points: [], lockedLines: 0, hasCentral: false, etsPrice: ets };

  const bands = profile.cbamProducts.map((line, i) => ({ line, band: lineEmissionBand(line, lookups[i]) }));
  const lockedLines = bands.filter((b) => b.band === null).length;
  const usable = bands.filter((b): b is { line: typeof b.line; band: { low: number; high: number; central?: number } } => b.band !== null);
  const hasCentral = usable.length > 0 && usable.every((b) => b.band.central !== undefined);

  const points = RAMP_YEARS.map((year) => {
    const f = cbamFactorForYear(year);
    const low = usable.reduce((a, b) => a + b.line.annualVolumeTonnes * b.band.low * f * ets, 0);
    const high = usable.reduce((a, b) => a + b.line.annualVolumeTonnes * b.band.high * f * ets, 0);
    const central = hasCentral ? usable.reduce((a, b) => a + b.line.annualVolumeTonnes * (b.band.central as number) * f * ets, 0) : undefined;
    return { year, lowEUR: Math.round(low), highEUR: Math.round(high), centralEUR: central !== undefined ? Math.round(central) : undefined };
  });

  return { points, lockedLines, hasCentral, etsPrice: ets };
}
