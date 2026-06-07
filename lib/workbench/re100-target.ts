// F3 — RE100 ↔ Scope 2 target linkage. For a Scope-2-dominant company (semiconductor/electronics),
// renewable electricity is THE lever for the operational (Scope 1+2) target — but the tool tracked
// the RE100 % and the Scope 1+2 target separately. This reverse-solves the renewable share needed to
// land the primary Scope 1+2 target by renewables alone, and flags when even 100% renewable can't do
// it (a hard Scope-1 floor remains). RED LINE: a what-if holding Scope 1 and electricity use constant
// — not a forecast; clearly noted.

import { footprintSummary } from './scope3';
import { computeInventory } from './inventory';
import { targetTrajectory } from './target';
import type { CompanyProfile } from './profile';
import type { CountryCode } from '@/lib/types';
import type { BilingualText } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 10) / 10;

export interface Re100TargetLink {
  targetYear: number;
  targetEmissions: number; // the primary Scope 1+2 target allowance
  scope2LocationTonnes: number; // renewable-addressable Scope 2 (location-based)
  floorTonnes: number; // non-addressable by renewables (Scope 1 + typed facilities)
  currentRenewablePct: number; // current blended renewable share of Scope 2
  neededRenewablePct: number; // renewable share to hit the target by renewables alone (clamped 0–100)
  achievableByRenewablesAlone: boolean; // false when even 100% renewable leaves floor > target
  alreadyMeets: boolean; // current renewables already clear the target
}

/** Reverse-solve the renewable % needed to land the primary Scope 1+2 target by renewables alone.
 *  Returns null unless there's a primary scope12 target and some addressable (inventory) Scope 2. */
export function renewableForTarget(profile: CompanyProfile): Re100TargetLink | null {
  const tr = targetTrajectory(profile);
  if (!tr || tr.scope !== 'scope12') return null; // only the operational Scope 1+2 target

  const fp = footprintSummary(profile);
  // Renewable-addressable = inventory facilities' location-based Scope 2; also derive the current
  // blended renewable share from each facility's market-based vs location-based Scope 2.
  let scope2Location = 0;
  let scope2Market = 0;
  for (const f of profile.facilities) {
    if (!f.useInventory || !f.activities?.length) continue;
    const inv = computeInventory(f.activities, f.countryCode as CountryCode, f.renewablePct ?? 0);
    scope2Location += inv.scope2Tonnes;
    scope2Market += inv.scope2MarketTonnes;
  }
  scope2Location = round(scope2Location);
  if (scope2Location <= 0) return null;

  const floorTonnes = round(tr.actual - scope2Location); // Scope 1+2 actual minus addressable Scope 2
  const currentRenewablePct = round((1 - scope2Market / scope2Location) * 100);

  // market S1+2 = floor + scope2Location × (1 − r); set = targetEmissions → r = 1 − (target − floor)/scope2Location
  const rawNeeded = (1 - (tr.targetEmissions - floorTonnes) / scope2Location) * 100;
  const achievableByRenewablesAlone = rawNeeded <= 100 + 1e-9;
  const neededRenewablePct = round(Math.max(0, Math.min(100, rawNeeded)));
  const alreadyMeets = achievableByRenewablesAlone && currentRenewablePct >= neededRenewablePct;

  return {
    targetYear: tr.targetYear,
    targetEmissions: tr.targetEmissions,
    scope2LocationTonnes: scope2Location,
    floorTonnes,
    currentRenewablePct,
    neededRenewablePct,
    achievableByRenewablesAlone,
    alreadyMeets,
  };
}

export const RE100_TARGET_NOTE: BilingualText = {
  zhTW: '反推假設:Scope 1 與用電量維持現況,僅以提高綠電(市場基礎 Scope 2)達標所需比例;為情境試算,非預測。實務上能效、製程減量、Scope 1 削減亦可分攤缺口。',
  en: 'Reverse-solve assumes Scope 1 and electricity use stay constant, isolating the renewable share (market-based Scope 2) needed to hit the target — a what-if, not a forecast. In practice efficiency, process cuts and Scope 1 reductions also close the gap.',
};
