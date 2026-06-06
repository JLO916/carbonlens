// Pure adapters: ONE CompanyProfile → the existing per-module *Input shapes. This is the
// glue that lets the three diagnostic engines + the Taiwan carbon-fee engine all run off a
// single profile (no re-asking industry/size/EU-export). Reuses the existing types verbatim.

import type { CompanyProfile, FacilityLine } from './profile';
import { taiwanPeriodForYear } from './profile';
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

/** One DomesticInput per facility for the country's carbon-pricing engine (taiwanCalculator etc.). */
export function toDomesticInput(facility: FacilityLine, p: CompanyProfile): DomesticInput {
  return {
    annualEmissions: facility.annualEmissionsTonnes,
    industryType: p.industry,
    year: p.year,
    countrySpecific: {
      rateType: facility.rateType,
      highCarbonLeakage: facility.highCarbonLeakage,
      period: taiwanPeriodForYear(p.year),
      carbonCreditOffset: facility.carbonCreditOffset,
    },
  };
}
