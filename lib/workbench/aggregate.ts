// V4 workbench aggregation — runs ALL engines off one CompanyProfile and produces the unified
// "carbon P&L" (domestic fee + CBAM obligation + disclosure/supply-chain posture). Pure: the
// CBAM official-default lookups are KV-gated + async, so the CLIENT fetches them and passes them
// in (aligned to cbamProducts[]). A locked line is FLAGGED, never silently zeroed (red line).

import type { CompanyProfile, FacilityLine, CbamProductLine } from './profile';
import { toListedInput, toSupplyChainInput, toCbamInputs, toDomesticInput } from './derive';
import { diagnoseListed } from '@/lib/diagnose/logic/listed';
import { diagnoseSupplyChain } from '@/lib/diagnose/logic/supply-chain';
import { diagnoseCbam, type CbamDefaultLookup } from '@/lib/diagnose/logic/cbam';
import { getCalculator } from '@/lib/calculators/domestic';
import type { ListedResult, SupplyChainResult, CbamResult } from '@/lib/diagnose/types';
import type { DomesticResult } from '@/lib/calculators/domestic/types';
import type { CountryCode } from '@/lib/types';

export interface WorkbenchResult {
  year: number;
  listed: ListedResult;
  supplyChain: SupplyChainResult;
  cbam: {
    lines: { line: CbamProductLine; result: CbamResult }[];
    totalObligationEUR?: number; // sum of the year's CBAM obligation across priced lines
    totalGrossEUR?: number; // sum of the 2034 full amount (pre-factor)
    totalExporterShareEUR?: number; // sum of pass-through share, if set
    pricedLines: number;
    lockedLines: number; // official-default lines still awaiting unlock (NOT zeroed)
  };
  domestic: {
    facilities: { facility: FacilityLine; result: DomesticResult }[];
    totalFeeTWD: number; // sum of Taiwan facilities (same currency)
    totalFeeUSD: number; // sum of ALL facilities in USD (cross-currency comparable)
  };
}

const sumDefined = (xs: (number | undefined)[]): number | undefined => {
  const present = xs.filter((x): x is number => typeof x === 'number');
  return present.length ? present.reduce((a, b) => a + b, 0) : undefined;
};

/** Run the whole profile. `cbamLookups[i]` corresponds to profile.cbamProducts[i] (or undefined → locked). */
export function computeWorkbench(profile: CompanyProfile, cbamLookups: (CbamDefaultLookup | undefined)[] = []): WorkbenchResult {
  const listed = diagnoseListed(toListedInput(profile));
  const supplyChain = diagnoseSupplyChain(toSupplyChainInput(profile));

  const cbamInputs = toCbamInputs(profile);
  const lines = cbamInputs.map((input, i) => ({
    line: profile.cbamProducts[i],
    result: diagnoseCbam(input, cbamLookups[i]),
  }));
  const lockedLines = lines.filter((l) => l.result.exposure.defaultsLocked).length;
  const pricedLines = lines.filter((l) => l.result.exposure.indicativeExposureEUR !== undefined).length;

  const domesticFacilities = profile.facilities.map((facility) => ({
    facility,
    result: getCalculator(facility.countryCode as CountryCode).calculate(toDomesticInput(facility, profile)),
  }));
  const totalFeeTWD = domesticFacilities
    .filter((f) => f.facility.countryCode === 'tw')
    .reduce((a, f) => a + f.result.totalCarbonCost, 0);
  const totalFeeUSD = domesticFacilities.reduce((a, f) => a + f.result.totalCarbonCostUSD, 0);

  return {
    year: profile.year,
    listed,
    supplyChain,
    cbam: {
      lines,
      totalObligationEUR: sumDefined(lines.map((l) => l.result.exposure.indicativeExposureEUR)),
      totalGrossEUR: sumDefined(lines.map((l) => l.result.exposure.grossExposureEUR)),
      totalExporterShareEUR: sumDefined(lines.map((l) => l.result.exposure.exporterShareEUR)),
      pricedLines,
      lockedLines,
    },
    domestic: { facilities: domesticFacilities, totalFeeTWD, totalFeeUSD },
  };
}
