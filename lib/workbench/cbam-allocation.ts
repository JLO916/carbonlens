// D3 — derive a CBAM good's specific embedded emissions (SEE) from a linked facility's inventory,
// instead of re-typing it by hand. Mass-allocates the facility's direct (and, where CBAM counts it,
// indirect) emissions across the goods drawn from that facility, by volume. RED LINE: this is a
// simple mass allocation for a starting figure — NOT a verified product LCA / monitoring-plan SEE.

import { computeInventory } from './inventory';
import { countsIndirect } from './reduction';
import type { CompanyProfile, CbamProductLine } from './profile';
import type { CountryCode } from '@/lib/types';

export interface AllocatedSEEInfo {
  see: number; // tCO₂e per tonne of product
  denominatorTonnes: number; // the allocation denominator actually used
  /** true when ANY pooled line lacks 廠年總產量 and fell back to its EU export volume — the correct
   *  denominator is the activity level (total output, Reg (EU) 2023/1773), so the SEE is likely
   *  OVERSTATED whenever exports are only part of production. */
  exportVolumeFallback: boolean;
}

/** SEE allocated from the linked facility's inventory, with the denominator actually used.
 *  Denominator per pooled line = its facility annual OUTPUT when given (never below its export
 *  volume — exports can't exceed production), else its export volume (flagged as fallback). */
export function allocatedCbamSEEInfo(profile: CompanyProfile, line: CbamProductLine): AllocatedSEEInfo | undefined {
  if (!line.facilityId) return undefined;
  const f = profile.facilities.find((x) => x.id === line.facilityId);
  if (!f || !f.useInventory || !f.activities || f.activities.length === 0) return undefined;

  const inv = computeInventory(f.activities, f.countryCode as CountryCode);
  // CBAM embedded emissions: steel/aluminium/hydrogen are DIRECT-only (Scope 1, Annex II);
  // cement/fertilizer also count indirect (Scope 1+2).
  const facilityEmbedded = countsIndirect(line.product) ? inv.totalTonnes : inv.scope1Tonnes;

  // pool = all CBAM lines drawing from this facility on the 'allocated' basis
  let denominator = 0;
  let exportVolumeFallback = false;
  for (const c of profile.cbamProducts.filter((x) => x.facilityId === f.id && x.emissionsSource === 'allocated')) {
    const vol = Math.max(0, c.annualVolumeTonnes);
    const output = c.facilityAnnualOutputTonnes;
    if (output != null && output > 0) denominator += Math.max(output, vol);
    else { denominator += vol; exportVolumeFallback = true; }
  }
  if (denominator <= 0) return undefined;

  return {
    see: Math.round((facilityEmbedded / denominator) * 1000) / 1000,
    denominatorTonnes: Math.round(denominator * 1000) / 1000,
    exportVolumeFallback,
  };
}

/** SEE (tCO₂e per tonne of product) allocated from the linked facility's inventory, or undefined. */
export function allocatedCbamSEE(profile: CompanyProfile, line: CbamProductLine): number | undefined {
  return allocatedCbamSEEInfo(profile, line)?.see;
}
