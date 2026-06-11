import { koreaCalculator } from '../domestic/korea';
import { japanCalculator } from '../domestic/japan';
import { thailandCalculator } from '../domestic/thailand';
import { vietnamCalculator } from '../domestic/vietnam';
import { calculateCBAM } from '../cbam';
import { getCalculator } from '../domestic';
import { convertToEUR } from '@/lib/data/exchange-rates';

describe('Korea K-ETS — Validation Cases', () => {
  // KR-01: 鋼鐵業 1,000,000 tCO₂e, 免費配額 850,000, KAU=₩9,145 → ₩1,371,750,000
  it('KR-01: steel 1M, free 850K, KAU ₩9,145 → ₩1,371,750,000', () => {
    const result = koreaCalculator.calculate({
      annualEmissions: 1_000_000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { freeAllowance: 850_000, kauPrice: 9145 },
    });
    expect(result.chargeableEmissions).toBe(150_000);
    expect(result.totalCarbonCost).toBe(1_371_750_000);
  });

  // KR-02: 排放量 < 免費配額 → ₩0 (可出售剩餘)
  it('KR-02: emissions 800K < free 850K → ₩0 with surplus note', () => {
    const result = koreaCalculator.calculate({
      annualEmissions: 800_000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { freeAllowance: 850_000, kauPrice: 9145 },
    });
    expect(result.chargeableEmissions).toBe(0);
    expect(result.totalCarbonCost).toBe(0);
    expect(result.notes).toContain('kr_surplus_allowance');
  });
});

describe('Japan Carbon Tax + GX-ETS — Validation Cases', () => {
  // JP-01: 鋼鐵業 200,000 tCO₂e, 碳稅 ¥289 → ¥57,800,000
  it('JP-01: steel 200K, carbon tax only → ¥57,800,000', () => {
    const result = japanCalculator.calculate({
      annualEmissions: 200_000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { isGxEtsRegulated: false },
    });
    expect(result.totalCarbonCost).toBe(57_800_000);
  });

  // JP-02: 99,999 tCO₂e, below GX-ETS threshold → carbon tax only
  it('JP-02: 99,999 below GX-ETS threshold → tax only ¥28,899,711', () => {
    const result = japanCalculator.calculate({
      annualEmissions: 99_999,
      industryType: 'steel',
      year: 2026,
      countrySpecific: { isGxEtsRegulated: true, gxEtsPrice: 4100 },
    });
    // Carbon tax = 99,999 × 289 = ¥28,899,711
    expect(result.totalCarbonCost).toBe(99_999 * 289);
    expect(result.notes).toContain('jp_below_gx_ets_threshold');
  });

  // JP hybrid: both carbon tax + GX-ETS
  it('JP hybrid: 200K regulated, GX-ETS cost added to carbon tax', () => {
    const result = japanCalculator.calculate({
      annualEmissions: 200_000,
      industryType: 'steel',
      year: 2026,
      countrySpecific: { isGxEtsRegulated: true, gxEtsPrice: 4100, gxEtsFreeAllowance: 150_000 },
    });
    // Carbon tax = 200K × 289 = 57,800,000
    // GX-ETS = (200K - 150K) × 4100 = 50K × 4100 = 205,000,000
    // Total = 262,800,000
    expect(result.totalCarbonCost).toBe(57_800_000 + 205_000_000);
  });
});

describe('Thailand Carbon Tax — Validation Cases', () => {
  // TH-01: 柴油 1,000,000 公升, factor=0.0026 → THB 520,000
  it('TH-01: diesel 1M litres → 2,600 tCO₂ × THB200 = THB 520,000', () => {
    const result = thailandCalculator.calculate({
      annualEmissions: 0,
      industryType: 'power',
      year: 2025,
      countrySpecific: { inputMode: 'fuel', dieselLitres: 1_000_000 },
    });
    // 1,000,000 × 0.0026 = 2,600 tCO₂
    expect(result.chargeableEmissions).toBeCloseTo(2600);
    expect(result.totalCarbonCost).toBeCloseTo(520_000);
  });

  // TH-02 (R4 #1): 泰國碳稅內含於油品消費稅,僅及石油產品——外購電力不在稅基,
  // 辦公大樓 500,000 kWh 應為 THB 0(電力以「不課稅」列示,非課稅排放)。
  it('TH-02: office 500K kWh → THB 0 (electricity outside the oil-excise tax base)', () => {
    const result = thailandCalculator.calculate({
      annualEmissions: 0,
      industryType: 'other',
      year: 2025,
      countrySpecific: { inputMode: 'fuel', electricityKwh: 500_000 },
    });
    expect(result.chargeableEmissions).toBe(0);
    expect(result.totalCarbonCost).toBe(0);
    expect(result.notes).toContain('th_tax_base_oil_only');
    // 500,000 × 0.000519 = 259.5 tCO₂ still shown for context, marked excluded
    const excluded = result.breakdown.find((b) => b.step === 'th_step_electricity_excluded');
    expect(excluded?.value).toBeCloseTo(259.5);
  });
});

describe('Vietnam — Validation Cases', () => {
  // VN-01: 80,000 tCO₂e, no formal carbon price → VND 0
  it('VN-01: steel 80K, no carbon price → VND 0 with warning', () => {
    const result = vietnamCalculator.calculate({
      annualEmissions: 80_000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { scenarioCarbonPrice: 0 },
    });
    expect(result.totalCarbonCost).toBe(0);
    expect(result.deductibleForCBAM).toBe(0);
    expect(result.notes).toContain('vn_no_formal_carbon_price');
    expect(result.notes).toContain('vn_cbam_full_exposure');
  });
});

describe('Cross-country CBAM comparison (CBAM-05 / LC-05)', () => {
  // Same product: 5,000t BF-BOF steel, EU ETS €80, 2026
  const baseInput = {
    productType: 'steel_bof' as const,
    importVolume: 5000,
    specificEmbeddedEmissions: 2.1,
    useDefaultEmissions: false,
    year: 2026,
    euEtsPrice: 80,
  };

  it('CBAM-05: Vietnam net CBAM > Taiwan > Korea', () => {
    // Vietnam: no domestic carbon price
    const vnResult = calculateCBAM({ ...baseInput, domesticCarbonPricePaid: 0, originCountry: 'vn' });

    // Taiwan: some domestic carbon price (estimate)
    const twCalc = getCalculator('tw');
    const twDomestic = twCalc.calculate({
      annualEmissions: 100_000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { rateType: 'preferB', highCarbonLeakage: true, period: 'period1_2025_2026' },
    });
    const twDeductEUR = twDomestic.deductibleForCBAM * 0.3; // 30% exported to EU
    const twResult = calculateCBAM({ ...baseInput, domesticCarbonPricePaid: twDeductEUR, originCountry: 'tw' });

    // Korea: K-ETS price deduction
    const krCalc = getCalculator('kr');
    const krDomestic = krCalc.calculate({
      annualEmissions: 1_000_000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { freeAllowance: 850_000, kauPrice: 9145 },
    });
    const krDeductEUR = krDomestic.deductibleForCBAM * 0.1; // 10% to EU
    const krResult = calculateCBAM({ ...baseInput, domesticCarbonPricePaid: krDeductEUR, originCountry: 'kr' });

    // LC-05: Vietnam ≥ all others
    expect(vnResult.netCBAMCost).toBeGreaterThan(twResult.netCBAMCost);
    expect(vnResult.netCBAMCost).toBeGreaterThan(krResult.netCBAMCost);
    // Vietnam > Taiwan > Korea (Korea has larger ETS deduction)
    expect(twResult.netCBAMCost).toBeGreaterThan(krResult.netCBAMCost);
  });
});

describe('Logic Consistency Checks (LC)', () => {
  it('LC-01: CBAM deduction ≤ CBAM total cost for all countries', () => {
    const result = calculateCBAM({
      productType: 'steel_bof',
      importVolume: 5000,
      specificEmbeddedEmissions: 2.1,
      useDefaultEmissions: false,
      year: 2026,
      euEtsPrice: 80,
      domesticCarbonPricePaid: 999999, // huge deduction
      originCountry: 'tw',
    });
    expect(result.netCBAMCost).toBeGreaterThanOrEqual(0);
  });

  it('LC-04: zero emissions → zero cost for all countries', () => {
    const codes = ['tw', 'sg', 'kr', 'jp', 'th', 'vn'] as const;
    for (const code of codes) {
      const calc = getCalculator(code);
      const result = calc.calculate({
        annualEmissions: 0,
        industryType: 'steel',
        year: 2025,
        countrySpecific: calc.getDefaultParams(),
      });
      expect(result.totalCarbonCost).toBe(0);
    }
  });

  it('LC-06: CBAM cost increases from 2026 to 2034', () => {
    const years = [2026, 2028, 2030, 2034];
    const results = years.map(year =>
      calculateCBAM({
        productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1,
        useDefaultEmissions: false, year, euEtsPrice: 80, domesticCarbonPricePaid: 0, originCountry: 'vn',
      })
    );
    for (let i = 1; i < results.length; i++) {
      expect(results[i].netCBAMCost).toBeGreaterThan(results[i - 1].netCBAMCost);
    }
  });
});
