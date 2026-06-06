import { CountryCode } from '@/lib/types';
import { cbamFactorForYear } from '@/lib/diagnose/data/cbam';

// Carbon price projections by country (local currency)
export const CARBON_PRICE_PROJECTIONS: Record<CountryCode, Record<number, number>> = {
  tw: { 2025: 300, 2026: 300, 2027: 300, 2028: 500, 2029: 500, 2030: 1200, 2031: 1200, 2032: 1500, 2033: 1500, 2034: 1800 },
  sg: { 2025: 25, 2026: 45, 2027: 45, 2028: 65, 2029: 65, 2030: 80, 2031: 80, 2032: 80, 2033: 80, 2034: 80 },
  kr: { 2025: 9145, 2026: 12000, 2027: 12000, 2028: 18000, 2029: 18000, 2030: 25000, 2031: 25000, 2032: 30000, 2033: 30000, 2034: 35000 },
  jp: { 2025: 289, 2026: 289, 2027: 289, 2028: 1500, 2029: 1500, 2030: 3300, 2031: 3300, 2032: 4000, 2033: 4000, 2034: 5000 },
  th: { 2025: 200, 2026: 200, 2027: 200, 2028: 200, 2029: 400, 2030: 600, 2031: 600, 2032: 800, 2033: 800, 2034: 1000 },
  vn: { 2025: 0, 2026: 0, 2027: 50000, 2028: 75000, 2029: 75000, 2030: 150000, 2031: 150000, 2032: 200000, 2033: 200000, 2034: 250000 },
};

/** @deprecated Superseded by `cbamFactorForYear` (lib/diagnose/data/cbam.ts), which is sourced to
 *  Directive 2003/87/EC Art. 10a(1a). This table disagreed at 2029–2033 (e.g. 2030: 0.25 vs 0.485)
 *  and is kept only for reference. Do NOT use for new code. */
export const CBAM_EFFECTIVE_RATE: Record<number, number> = {
  2025: 0, 2026: 0.025, 2027: 0.05, 2028: 0.10, 2029: 0.175,
  2030: 0.25, 2031: 0.35, 2032: 0.50, 2033: 0.75, 2034: 1.0,
};

export interface ScenarioPoint {
  year: number;
  domesticCostUSD: number;
  cbamCostEUR: number;
}

export function generateScenario(
  countryCode: CountryCode,
  annualEmissions: number,
  exchangeRate: number,
): ScenarioPoint[] {
  const projections = CARBON_PRICE_PROJECTIONS[countryCode];
  const years = Object.keys(projections).map(Number).sort();

  return years.map(year => {
    const localRate = projections[year];
    const domesticCostUSD = (annualEmissions * localRate) / exchangeRate;
    const cbamRate = cbamFactorForYear(year); // sourced CBAM factor (Directive 2003/87/EC 10a(1a))
    // Simplified CBAM cost estimate: emissions × €80 × cbam_factor
    const cbamCostEUR = annualEmissions * 80 * cbamRate;

    return { year, domesticCostUSD, cbamCostEUR };
  });
}
