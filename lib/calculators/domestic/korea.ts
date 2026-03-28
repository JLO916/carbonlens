import { FormFieldConfig } from '@/lib/types';
import { convertToUSD, convertToEUR } from '@/lib/data/exchange-rates';
import { DomesticCarbonPriceCalculator, DomesticInput, DomesticResult } from './types';

const DEFAULT_KAU_PRICE = 9145; // KRW/tCO₂e (2025)

export const koreaCalculator: DomesticCarbonPriceCalculator = {
  countryCode: 'kr',
  countryName: { zhTW: '韓國', en: 'South Korea' },
  mechanismType: 'ets',

  calculate(input: DomesticInput): DomesticResult {
    const {
      freeAllowance = 0,
      kauPrice = DEFAULT_KAU_PRICE,
    } = input.countrySpecific;

    const notes: string[] = ['kr_ets_price_volatile'];

    const shortfall = Math.max(0, input.annualEmissions - freeAllowance);
    const totalCarbonCost = shortfall * kauPrice;

    const effectiveRate = input.annualEmissions > 0 ? totalCarbonCost / input.annualEmissions : 0;
    const totalCarbonCostUSD = convertToUSD(totalCarbonCost, 'KRW');
    const effectiveRateUSD = convertToUSD(effectiveRate, 'KRW');
    const deductibleForCBAM = convertToEUR(totalCarbonCost, 'KRW');

    if (shortfall === 0 && input.annualEmissions > 0) {
      notes.push('kr_surplus_allowance');
    }

    return {
      totalCarbonCost,
      totalCarbonCostUSD,
      effectiveRate,
      effectiveRateUSD,
      currency: 'KRW',
      chargeableEmissions: shortfall,
      breakdown: [
        { step: 'kr_step_annual_emissions', value: input.annualEmissions, unit: 'tCO₂e', explanation: 'kr_step_annual_emissions_desc' },
        { step: 'kr_step_free_allowance', value: freeAllowance, unit: 'tCO₂e', explanation: 'kr_step_free_allowance_desc' },
        { step: 'kr_step_shortfall', value: shortfall, unit: 'tCO₂e', explanation: 'kr_step_shortfall_desc' },
        { step: 'kr_step_kau_price', value: kauPrice, unit: 'KRW/tCO₂e', explanation: 'kr_step_kau_price_desc' },
        { step: 'kr_step_total_cost', value: totalCarbonCost, unit: 'KRW', explanation: 'kr_step_total_cost_desc' },
      ],
      deductibleForCBAM,
      notes,
    };
  },

  getFormFields(): FormFieldConfig[] {
    return [
      {
        key: 'freeAllowance',
        type: 'number',
        label: { zhTW: '免費配額 (tCO₂e)', en: 'Free Allowance (tCO₂e)' },
        defaultValue: 0,
        required: true,
        tooltip: { zhTW: '依產業別 benchmark 分配的免費配額', en: 'Free allocation based on industry benchmark' },
      },
      {
        key: 'kauPrice',
        type: 'number',
        label: { zhTW: 'KAU 市場價格 (KRW/tCO₂e)', en: 'KAU Market Price (KRW/tCO₂e)' },
        defaultValue: DEFAULT_KAU_PRICE,
        required: true,
        tooltip: { zhTW: 'ETS 配額市場價格波動大，請留意此為估算', en: 'ETS allowance prices are volatile — this is an estimate' },
      },
    ];
  },

  getDefaultParams() {
    return { freeAllowance: 0, kauPrice: DEFAULT_KAU_PRICE };
  },
};
