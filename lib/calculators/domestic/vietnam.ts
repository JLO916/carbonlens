import { FormFieldConfig } from '@/lib/types';
import { convertToUSD, convertToEUR } from '@/lib/data/exchange-rates';
import { DomesticCarbonPriceCalculator, DomesticInput, DomesticResult } from './types';

export const vietnamCalculator: DomesticCarbonPriceCalculator = {
  countryCode: 'vn',
  countryName: { zhTW: '越南', en: 'Vietnam' },
  mechanismType: 'ets',

  calculate(input: DomesticInput): DomesticResult {
    const {
      scenarioCarbonPrice = 0, // USD/tCO₂e for scenario simulation
    } = input.countrySpecific;

    const notes: string[] = [
      'vn_no_formal_carbon_price',
      'vn_cbam_full_exposure',
    ];

    // Vietnam has no formal carbon price — cost is 0 (or scenario-based)
    const priceVND = scenarioCarbonPrice * 25400; // convert USD to VND
    const totalCarbonCost = input.annualEmissions * priceVND;

    const effectiveRate = priceVND;
    const totalCarbonCostUSD = input.annualEmissions * scenarioCarbonPrice;
    const effectiveRateUSD = scenarioCarbonPrice;
    const deductibleForCBAM = scenarioCarbonPrice > 0
      ? convertToEUR(totalCarbonCost, 'VND')
      : 0;

    if (scenarioCarbonPrice > 0) {
      notes.push('vn_scenario_simulation');
    }

    return {
      totalCarbonCost,
      totalCarbonCostUSD,
      effectiveRate,
      effectiveRateUSD,
      currency: 'VND',
      chargeableEmissions: input.annualEmissions,
      breakdown: [
        { step: 'vn_step_annual_emissions', value: input.annualEmissions, unit: 'tCO₂e', explanation: 'vn_step_annual_emissions_desc' },
        { step: 'vn_step_carbon_price', value: scenarioCarbonPrice, unit: 'USD/tCO₂e', explanation: 'vn_step_carbon_price_desc' },
        { step: 'vn_step_total_cost', value: totalCarbonCost, unit: 'VND', explanation: 'vn_step_total_cost_desc' },
      ],
      deductibleForCBAM,
      notes,
    };
  },

  getFormFields(): FormFieldConfig[] {
    return [
      {
        key: 'scenarioCarbonPrice',
        type: 'number',
        label: { zhTW: '情境模擬碳價 (USD/tCO₂e)', en: 'Scenario Carbon Price (USD/tCO₂e)' },
        defaultValue: 0,
        required: false,
        tooltip: { zhTW: '越南目前無正式碳價。此為情境模擬用，市場預估初期 USD 1-5', en: 'Vietnam has no formal carbon price. For scenario simulation only (est. USD 1-5 initially)' },
      },
    ];
  },

  getDefaultParams() {
    return { scenarioCarbonPrice: 0 };
  },
};
