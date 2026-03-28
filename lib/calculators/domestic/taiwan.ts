import { FormFieldConfig } from '@/lib/types';
import { convertToUSD, convertToEUR } from '@/lib/data/exchange-rates';
import { DomesticCarbonPriceCalculator, DomesticInput, DomesticResult } from './types';

// Taiwan Carbon Fee rates
const RATES: Record<string, number> = {
  general: 300,    // NT$/tCO₂e
  preferA: 50,     // SBTi pathway
  preferB: 100,    // Technical benchmark
};

// K-value (free emissions threshold)
const K_VALUES = {
  highCarbonLeakage: 0,
  nonHighCarbonLeakage: 25000,
};

// Carbon Leakage (CL) coefficients by period
const CL_COEFFICIENTS: Record<string, number> = {
  'period1_2025_2026': 0.2,
  'period2_2027_2028': 0.4,
  'period3_2029_2030': 0.6,
  'non_high_carbon_leakage': 1.0,
};

function getCLPeriod(year: number): string {
  if (year <= 2026) return 'period1_2025_2026';
  if (year <= 2028) return 'period2_2027_2028';
  return 'period3_2029_2030';
}

export const taiwanCalculator: DomesticCarbonPriceCalculator = {
  countryCode: 'tw',
  countryName: { zhTW: '台灣', en: 'Taiwan' },
  mechanismType: 'carbon_fee',

  calculate(input: DomesticInput): DomesticResult {
    const {
      rateType = 'general',
      highCarbonLeakage = false,
      period = 'period1_2025_2026',
      carbonCreditOffset = 0,
    } = input.countrySpecific;

    const rate = RATES[rateType] ?? RATES.general;
    const kValue = highCarbonLeakage ? K_VALUES.highCarbonLeakage : K_VALUES.nonHighCarbonLeakage;
    const clCoefficient = highCarbonLeakage
      ? CL_COEFFICIENTS[period] ?? CL_COEFFICIENTS.period1_2025_2026
      : CL_COEFFICIENTS.non_high_carbon_leakage;

    // Step 1: Calculate emissions after K-value deduction
    const emissionsAfterK = Math.max(0, input.annualEmissions - kValue);

    // Step 2: Apply CL coefficient
    const chargeableEmissions = emissionsAfterK * clCoefficient;

    // Step 3: Subtract carbon credit offsets
    const netChargeableEmissions = Math.max(0, chargeableEmissions - carbonCreditOffset);

    // Step 4: Calculate carbon fee
    const totalCarbonCost = netChargeableEmissions * rate;

    const effectiveRate = input.annualEmissions > 0
      ? totalCarbonCost / input.annualEmissions
      : 0;

    const totalCarbonCostUSD = convertToUSD(totalCarbonCost, 'TWD');
    const effectiveRateUSD = convertToUSD(effectiveRate, 'TWD');
    const deductibleForCBAM = convertToEUR(totalCarbonCost, 'TWD');

    const notes: string[] = [];
    if (!highCarbonLeakage && input.annualEmissions < kValue) {
      notes.push('tw_below_threshold');
    }
    if (highCarbonLeakage) {
      notes.push('tw_high_carbon_leakage_note');
    }
    notes.push('tw_cbam_scope_note');

    return {
      totalCarbonCost,
      totalCarbonCostUSD,
      effectiveRate,
      effectiveRateUSD,
      currency: 'TWD',
      chargeableEmissions: netChargeableEmissions,
      breakdown: [
        {
          step: 'tw_step_annual_emissions',
          value: input.annualEmissions,
          unit: 'tCO₂e',
          explanation: 'tw_step_annual_emissions_desc',
        },
        {
          step: 'tw_step_k_value',
          value: kValue,
          unit: 'tCO₂e',
          explanation: highCarbonLeakage ? 'tw_k_value_high_cl' : 'tw_k_value_non_high_cl',
        },
        {
          step: 'tw_step_emissions_after_k',
          value: emissionsAfterK,
          unit: 'tCO₂e',
          explanation: 'tw_step_emissions_after_k_desc',
        },
        {
          step: 'tw_step_cl_coefficient',
          value: clCoefficient,
          unit: '',
          explanation: `tw_cl_${period}`,
        },
        {
          step: 'tw_step_chargeable_emissions',
          value: chargeableEmissions,
          unit: 'tCO₂e',
          explanation: 'tw_step_chargeable_emissions_desc',
        },
        ...(carbonCreditOffset > 0
          ? [{
              step: 'tw_step_carbon_credit_offset',
              value: carbonCreditOffset,
              unit: 'tCO₂e',
              explanation: 'tw_step_carbon_credit_offset_desc',
            }]
          : []),
        {
          step: 'tw_step_rate',
          value: rate,
          unit: 'TWD/tCO₂e',
          explanation: `tw_rate_${rateType}`,
        },
        {
          step: 'tw_step_total_cost',
          value: totalCarbonCost,
          unit: 'TWD',
          explanation: 'tw_step_total_cost_desc',
        },
      ],
      deductibleForCBAM,
      notes,
    };
  },

  getFormFields(): FormFieldConfig[] {
    return [
      {
        key: 'rateType',
        type: 'select',
        label: { zhTW: '費率類型', en: 'Rate Type' },
        options: [
          { value: 'general', label: { zhTW: '一般費率 (NT$300/tCO₂e)', en: 'General Rate (NT$300/tCO₂e)' } },
          { value: 'preferA', label: { zhTW: '優惠 A — SBTi 行業別削減率 (NT$50/tCO₂e)', en: 'Preferential A — SBTi Pathway (NT$50/tCO₂e)' } },
          { value: 'preferB', label: { zhTW: '優惠 B — 技術標竿削減率 (NT$100/tCO₂e)', en: 'Preferential B — Technical Benchmark (NT$100/tCO₂e)' } },
        ],
        defaultValue: 'general',
        required: true,
        tooltip: { zhTW: '台灣碳費分三種費率：一般費率 NT$300/tCO₂e；優惠 A（NT$50）適用於承諾 SBTi 科學基礎減量目標的企業；優惠 B（NT$100）適用於達到行業技術標竿的企業。選擇優惠費率需符合環境部碳費三子法的資格條件。', en: 'Taiwan has three carbon fee rates: General (NT$300/tCO₂e); Preferential A (NT$50) for companies committed to SBTi science-based reduction targets; Preferential B (NT$100) for companies meeting industry technical benchmarks. Qualifying for preferential rates requires meeting criteria under Taiwan EPA carbon fee regulations.' },
      },
      {
        key: 'highCarbonLeakage',
        type: 'toggle',
        label: { zhTW: '高碳洩漏風險產業', en: 'High Carbon Leakage Risk Industry' },
        defaultValue: false,
        required: true,
        tooltip: { zhTW: '「碳洩漏」指企業因碳成本過高，將生產外移至碳管制較鬆的國家。台灣對高碳洩漏風險產業（如鋼鐵、水泥）取消 K 值（免徵額=0），但給予 CL 係數折減（第一期僅收 20%），以平衡減碳目標與產業競爭力。', en: '"Carbon leakage" occurs when companies relocate production to countries with looser carbon regulations due to high carbon costs. Taiwan removes the K-value exemption (K=0) for high leakage risk industries (steel, cement, etc.) but applies a CL coefficient discount (only 20% charged in Period 1) to balance decarbonization goals with industrial competitiveness.' },
      },
      {
        key: 'period',
        type: 'select',
        label: { zhTW: '計算期別', en: 'Calculation Period' },
        options: [
          { value: 'period1_2025_2026', label: { zhTW: '第一期 2025-2026（CL=0.2）', en: 'Period 1: 2025-2026 (CL=0.2)' } },
          { value: 'period2_2027_2028', label: { zhTW: '第二期 2027-2028（CL=0.4）', en: 'Period 2: 2027-2028 (CL=0.4)' } },
          { value: 'period3_2029_2030', label: { zhTW: '第三期 2029-2030（CL=0.6）', en: 'Period 3: 2029-2030 (CL=0.6)' } },
        ],
        defaultValue: 'period1_2025_2026',
        required: true,
        tooltip: { zhTW: 'CL 係數（碳洩漏係數）是台灣碳費對高碳洩漏風險產業的分期折減機制：第一期僅收 20%、第二期收 40%、第三期收 60%。此係數僅適用於被認定為高碳洩漏風險的產業；非高碳洩漏產業的 CL 係數固定為 1.0（全額徵收）。', en: 'The CL coefficient (Carbon Leakage coefficient) is Taiwan\'s phased discount for high carbon leakage risk industries: Period 1 charges only 20%, Period 2: 40%, Period 3: 60%. This coefficient only applies to industries designated as high carbon leakage risk; non-high-risk industries have a fixed CL of 1.0 (full charge).' },
      },
      {
        key: 'carbonCreditOffset',
        type: 'number',
        label: { zhTW: '碳權扣抵數量 (tCO₂e)', en: 'Carbon Credit Offsets (tCO₂e)' },
        defaultValue: 0,
        required: false,
        tooltip: { zhTW: '企業可購買經環境部認可的碳權（如國內自願減量額度或國際碳權）來抵扣部分應繳碳費的排放量。碳權代表經第三方驗證的減排成果，1 單位碳權 = 1 tCO₂e 的減排量。', en: 'Companies can purchase carbon credits approved by the EPA (domestic voluntary reduction credits or international credits) to offset part of their chargeable emissions. Each carbon credit represents 1 tCO₂e of verified emission reduction by a third party.' },
      },
    ];
  },

  getDefaultParams(): Record<string, any> {
    return {
      rateType: 'general',
      highCarbonLeakage: false,
      period: 'period1_2025_2026',
      carbonCreditOffset: 0,
    };
  },
};
