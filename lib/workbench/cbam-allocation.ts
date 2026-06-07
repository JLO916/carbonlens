// D3 — derive a CBAM good's specific embedded emissions (SEE) from a linked facility's inventory,
// instead of re-typing it by hand. Mass-allocates the facility's direct (and, where CBAM counts it,
// indirect) emissions across the goods drawn from that facility, by volume. RED LINE: this is a
// simple mass allocation for a starting figure — NOT a verified product LCA / monitoring-plan SEE.

import { computeInventory } from './inventory';
import { countsIndirect } from './reduction';
import type { CompanyProfile, CbamProductLine } from './profile';
import type { CountryCode } from '@/lib/types';

/** SEE (tCO₂e per tonne of product) allocated from the linked facility's inventory, or undefined. */
export function allocatedCbamSEE(profile: CompanyProfile, line: CbamProductLine): number | undefined {
  if (!line.facilityId) return undefined;
  const f = profile.facilities.find((x) => x.id === line.facilityId);
  if (!f || !f.useInventory || !f.activities || f.activities.length === 0) return undefined;

  const inv = computeInventory(f.activities, f.countryCode as CountryCode);
  // CBAM embedded emissions: steel/aluminium/hydrogen are DIRECT-only (Scope 1, Annex II);
  // cement/fertilizer also count indirect (Scope 1+2).
  const facilityEmbedded = countsIndirect(line.product) ? inv.totalTonnes : inv.scope1Tonnes;

  // allocate across all CBAM lines that draw from this facility on the 'allocated' basis, by volume
  const totalVol = profile.cbamProducts
    .filter((c) => c.facilityId === f.id && c.emissionsSource === 'allocated')
    .reduce((a, c) => a + Math.max(0, c.annualVolumeTonnes), 0);
  if (totalVol <= 0) return undefined;

  return Math.round((facilityEmbedded / totalVol) * 1000) / 1000;
}
