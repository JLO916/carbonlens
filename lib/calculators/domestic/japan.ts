import { FormFieldConfig } from '@/lib/types';
import { convertToUSD, convertToEUR } from '@/lib/data/exchange-rates';
import { DomesticCarbonPriceCalculator, DomesticInput, DomesticResult } from './types';

const CARBON_TAX_RATE = 289; // JPY/tCO₂e (fixed since 2016)
const GX_ETS_THRESHOLD = 100000; // tCO₂e
const DEFAULT_GX_ETS_PRICE = 4100; // JPY/tCO₂e mid-range of 2,600-5,600

export const japanCalculator: DomesticCarbonPriceCalculator = {
  countryCode: 'jp',
  countryName: { zhTW: '日本', en: 'Japan' },
  mechanismType: 'hybrid',

  calculate(input: DomesticInput): DomesticResult {
    const {
      isGxEtsRegulated = false,
      gxEtsPrice = DEFAULT_GX_ETS_PRICE,
      gxEtsFreeAllowance = 0,
    } = input.countrySpecific;

    const notes: string[] = [];

    // Part 1: Carbon tax (applies to all fossil fuel consumption)
    const carbonTaxCost = input.annualEmissions * CARBON_TAX_RATE;

    // Part 2: GX-ETS (only for regulated entities ≥ 100,000 tCO₂e, from 2026)
    let gxEtsCost = 0;
    let gxEtsShortfall = 0;
    const gxEtsApplies = isGxEtsRegulated && input.annualEmissions >= GX_ETS_THRESHOLD && input.year >= 2026;

    if (gxEtsApplies) {
      gxEtsShortfall = Math.max(0, input.annualEmissions - gxEtsFreeAllowance);
      gxEtsCost = gxEtsShortfall * gxEtsPrice;
      notes.push('jp_gx_ets_price_tbd');
    } else if (input.annualEmissions < GX_ETS_THRESHOLD) {
      notes.push('jp_below_gx_ets_threshold');
    }

    notes.push('jp_carbon_tax_cbam_uncertainty');

    const totalCarbonCost = carbonTaxCost + gxEtsCost;
    const effectiveRate = input.annualEmissions > 0 ? totalCarbonCost / input.annualEmissions : 0;
    const totalCarbonCostUSD = convertToUSD(totalCarbonCost, 'JPY');
    const effectiveRateUSD = convertToUSD(effectiveRate, 'JPY');
    // For CBAM: carbon tax deductibility is uncertain, GX-ETS is more clearly deductible
    const deductibleForCBAM = convertToEUR(gxEtsCost, 'JPY'); // conservative: only GX-ETS

    const breakdown = [
      { step: 'jp_step_annual_emissions', value: input.annualEmissions, unit: 'tCO₂e', explanation: 'jp_step_annual_emissions_desc' },
      { step: 'jp_step_carbon_tax_rate', value: CARBON_TAX_RATE, unit: 'JPY/tCO₂e', explanation: 'jp_step_carbon_tax_rate_desc' },
      { step: 'jp_step_carbon_tax_cost', value: carbonTaxCost, unit: 'JPY', explanation: 'jp_step_carbon_tax_cost_desc' },
    ];

    if (gxEtsApplies) {
      breakdown.push(
        { step: 'jp_step_gx_ets_free', value: gxEtsFreeAllowance, unit: 'tCO₂e', explanation: 'jp_step_gx_ets_free_desc' },
        { step: 'jp_step_gx_ets_shortfall', value: gxEtsShortfall, unit: 'tCO₂e', explanation: 'jp_step_gx_ets_shortfall_desc' },
        { step: 'jp_step_gx_ets_price', value: gxEtsPrice, unit: 'JPY/tCO₂e', explanation: 'jp_step_gx_ets_price_desc' },
        { step: 'jp_step_gx_ets_cost', value: gxEtsCost, unit: 'JPY', explanation: 'jp_step_gx_ets_cost_desc' },
      );
    }

    breakdown.push(
      { step: 'jp_step_total_cost', value: totalCarbonCost, unit: 'JPY', explanation: 'jp_step_total_cost_desc' },
    );

    return {
      totalCarbonCost,
      totalCarbonCostUSD,
      effectiveRate,
      effectiveRateUSD,
      currency: 'JPY',
      chargeableEmissions: input.annualEmissions,
      breakdown,
      deductibleForCBAM,
      notes,
    };
  },

  getFormFields(): FormFieldConfig[] {
    return [
      {
        key: 'isGxEtsRegulated',
        type: 'toggle',
        label: { zhTW: 'GX-ETS 受管制企業', en: 'GX-ETS Regulated Entity' },
        defaultValue: false,
        required: true,
        tooltip: { zhTW: '2026年起年排放≥10萬噸企業須參與 GX-ETS', en: 'From 2026, entities with ≥100K tCO₂e must participate in GX-ETS' },
      },
      {
        key: 'gxEtsPrice',
        type: 'number',
        label: { zhTW: 'GX-ETS 配額價格 (JPY/tCO₂e)', en: 'GX-ETS Allowance Price (JPY/tCO₂e)' },
        defaultValue: DEFAULT_GX_ETS_PRICE,
        required: false,
        tooltip: { zhTW: 'J-Credit 參考價格 ¥2,600-5,600', en: 'J-Credit reference range ¥2,600-5,600' },
      },
      {
        key: 'gxEtsFreeAllowance',
        type: 'number',
        label: { zhTW: 'GX-ETS 免費配額 (tCO₂e)', en: 'GX-ETS Free Allowance (tCO₂e)' },
        defaultValue: 0,
        required: false,
        tooltip: { zhTW: '配額分配方式待定', en: 'Allocation method TBD' },
      },
    ];
  },

  getDefaultParams() {
    return { isGxEtsRegulated: false, gxEtsPrice: DEFAULT_GX_ETS_PRICE, gxEtsFreeAllowance: 0 };
  },
};
