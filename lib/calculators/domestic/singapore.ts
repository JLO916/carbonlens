import { FormFieldConfig } from '@/lib/types';
import { convertToUSD, convertToEUR } from '@/lib/data/exchange-rates';
import { DomesticCarbonPriceCalculator, DomesticInput, DomesticResult } from './types';

const RATES_BY_YEAR: Record<number, number> = {
  2024: 25,
  2025: 25,
  2026: 45,
  2027: 45,
  2028: 65, // midpoint of 50-80
  2029: 65,
  2030: 80,
};

const THRESHOLD = 25000; // tCO₂e per facility

function getRateForYear(year: number): number {
  if (year <= 2025) return 25;
  if (year <= 2027) return 45;
  if (year <= 2029) return 65;
  return 80;
}

export const singaporeCalculator: DomesticCarbonPriceCalculator = {
  countryCode: 'sg',
  countryName: { zhTW: '新加坡', en: 'Singapore' },
  mechanismType: 'carbon_tax',

  calculate(input: DomesticInput): DomesticResult {
    const {
      internationalCarbonCredits = 0,
    } = input.countrySpecific;

    const rate = getRateForYear(input.year);
    const notes: string[] = [];

    // Check threshold
    if (input.annualEmissions < THRESHOLD) {
      notes.push('sg_below_threshold');
      return {
        totalCarbonCost: 0,
        totalCarbonCostUSD: 0,
        effectiveRate: 0,
        effectiveRateUSD: 0,
        currency: 'SGD',
        chargeableEmissions: 0,
        breakdown: [{
          step: 'sg_step_below_threshold',
          value: input.annualEmissions,
          unit: 'tCO₂e',
          explanation: 'sg_below_threshold_desc',
        }],
        deductibleForCBAM: 0,
        notes,
      };
    }

    // Max 5% offset via international carbon credits
    const maxCreditOffset = input.annualEmissions * 0.05;
    const creditOffset = Math.min(internationalCarbonCredits, maxCreditOffset);
    const chargeableEmissions = input.annualEmissions - creditOffset;
    const totalCarbonCost = chargeableEmissions * rate;

    const effectiveRate = input.annualEmissions > 0 ? totalCarbonCost / input.annualEmissions : 0;
    const totalCarbonCostUSD = convertToUSD(totalCarbonCost, 'SGD');
    const effectiveRateUSD = convertToUSD(effectiveRate, 'SGD');
    const deductibleForCBAM = convertToEUR(totalCarbonCost, 'SGD');

    if (creditOffset > 0) {
      notes.push('sg_carbon_credit_applied');
    }

    return {
      totalCarbonCost,
      totalCarbonCostUSD,
      effectiveRate,
      effectiveRateUSD,
      currency: 'SGD',
      chargeableEmissions,
      breakdown: [
        { step: 'sg_step_annual_emissions', value: input.annualEmissions, unit: 'tCO₂e', explanation: 'sg_step_annual_emissions_desc' },
        { step: 'sg_step_rate', value: rate, unit: 'SGD/tCO₂e', explanation: `sg_rate_${input.year}` },
        ...(creditOffset > 0 ? [{
          step: 'sg_step_carbon_credits', value: creditOffset, unit: 'tCO₂e', explanation: 'sg_step_carbon_credits_desc',
        }] : []),
        { step: 'sg_step_chargeable', value: chargeableEmissions, unit: 'tCO₂e', explanation: 'sg_step_chargeable_desc' },
        { step: 'sg_step_total_cost', value: totalCarbonCost, unit: 'SGD', explanation: 'sg_step_total_cost_desc' },
      ],
      deductibleForCBAM,
      notes,
    };
  },

  getFormFields(): FormFieldConfig[] {
    return [
      {
        key: 'internationalCarbonCredits',
        type: 'number',
        label: { zhTW: '國際碳權抵扣 (tCO₂e)', en: 'International Carbon Credits (tCO₂e)' },
        defaultValue: 0,
        required: false,
        tooltip: { zhTW: '最多可抵扣應稅排放量的 5%', en: 'Max 5% of taxable emissions can be offset' },
      },
    ];
  },

  getDefaultParams(): Record<string, any> {
    return { internationalCarbonCredits: 0 };
  },
};
