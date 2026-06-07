// Pure adapters: ONE CompanyProfile → the existing per-module *Input shapes. This is the
// glue that lets the three diagnostic engines + the Taiwan carbon-fee engine all run off a
// single profile (no re-asking industry/size/EU-export). Reuses the existing types verbatim.

import type { CompanyProfile, FacilityLine } from './profile';
import { taiwanPeriodForYear } from './profile';
import { facilityEmissionsTonnes } from './inventory';
import { getCalculator } from '@/lib/calculators/domestic';
import type { CountryCode } from '@/lib/types';
import type { ListedInput, SupplyChainInput, CbamInput } from '@/lib/diagnose/types';
import type { DomesticInput } from '@/lib/calculators/domestic/types';

export function toListedInput(p: CompanyProfile): ListedInput {
  return {
    listingType: p.listingType,
    capitalTier: p.capitalTier,
    hasSustainabilityReport: p.hasSustainabilityReport,
    industry: p.industry,
  };
}

export function toSupplyChainInput(p: CompanyProfile): SupplyChainInput {
  return {
    frameworks: p.customerFrameworks,
    industry: p.industry,
    exportSupplyChain: p.exportSupplyChain,
    employeeBand: p.employeeBand,
    businessModel: p.businessModel,
  };
}

/** One CbamInput per export line, injecting the shared year / ETS price / pass-through / EU flag. */
export function toCbamInputs(p: CompanyProfile): CbamInput[] {
  return p.cbamProducts.map((line) => ({
    exportsToEU: p.exportsToEU,
    product: line.product,
    originCountry: line.originCountry,
    annualVolumeTonnes: line.annualVolumeTonnes,
    year: p.year,
    emissionsSource: line.emissionsSource,
    actualSpecificEmissions: line.actualSpecificEmissions,
    etsPrice: p.etsPrice,
    cnCode: line.cnCode,
    passThroughPct: p.passThroughPct,
  }));
}

/** One DomesticInput per facility for the country's carbon-pricing engine (taiwanCalculator etc.).
 *  A1 gating: the preferential rate AND the carbon-leakage coefficient legally require an
 *  MOENV-approved voluntary reduction plan — without it we force the general rate (no 優惠/CL). */
export function toDomesticInput(facility: FacilityLine, p: CompanyProfile): DomesticInput {
  const cc = facility.countryCode as CountryCode;
  const annualEmissions = facilityEmissionsTonnes(facility);
  // P2c — non-Taiwan facilities run their own country's engine with that engine's default params
  // (indicative; the Taiwan-specific A1 gating / rate / leakage do not apply abroad).
  if (cc !== 'tw') {
    return {
      annualEmissions,
      industryType: p.industry,
      year: p.year,
      countrySpecific: getCalculator(cc).getDefaultParams(),
    };
  }
  const gated = !facility.hasApprovedReductionPlan;
  return {
    annualEmissions,
    industryType: p.industry,
    year: p.year,
    countrySpecific: {
      rateType: gated ? 'general' : facility.rateType,
      highCarbonLeakage: gated ? false : facility.highCarbonLeakage,
      period: taiwanPeriodForYear(p.year),
      carbonCreditOffset: facility.carbonCreditOffset,
    },
  };
}

/** Whether a facility's chosen preferential rate / leakage is currently being WITHHELD for lack of
 *  an approved plan (so the UI can flag it). */
export function feeGated(facility: FacilityLine): boolean {
  return !facility.hasApprovedReductionPlan && (facility.rateType !== 'general' || facility.highCarbonLeakage);
}
