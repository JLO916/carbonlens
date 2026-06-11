/**
 * Full re-verification of ALL validation spreadsheet cases.
 * Matches every row in 驗證總表.
 */
import { taiwanCalculator } from '../domestic/taiwan';
import { singaporeCalculator } from '../domestic/singapore';
import { koreaCalculator } from '../domestic/korea';
import { japanCalculator } from '../domestic/japan';
import { thailandCalculator } from '../domestic/thailand';
import { vietnamCalculator } from '../domestic/vietnam';
import { calculateCBAM } from '../cbam';
import { getCalculator } from '../domestic';

describe('FULL VERIFICATION — 驗證總表', () => {
  // ======== TAIWAN ========
  test('TW-01: steel 100K, high CL, preferB, period1 → NT$2,000,000', () => {
    const r = taiwanCalculator.calculate({ annualEmissions: 100000, industryType: 'steel', year: 2025, countrySpecific: { rateType: 'preferB', highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 } });
    expect(r.totalCarbonCost).toBe(2_000_000);
    expect(r.chargeableEmissions).toBe(20_000);
  });
  test('TW-02: semi 50K, non-high CL, general → NT$7,500,000', () => {
    const r = taiwanCalculator.calculate({ annualEmissions: 50000, industryType: 'semiconductor', year: 2025, countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 } });
    expect(r.totalCarbonCost).toBe(7_500_000);
  });
  test('TW-03: cement 200K, high CL, preferA → NT$2,000,000', () => {
    const r = taiwanCalculator.calculate({ annualEmissions: 200000, industryType: 'cement', year: 2025, countrySpecific: { rateType: 'preferA', highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 } });
    expect(r.totalCarbonCost).toBe(2_000_000);
    expect(r.chargeableEmissions).toBe(40_000);
  });
  test('TW-04: exactly 25K → NT$0', () => {
    const r = taiwanCalculator.calculate({ annualEmissions: 25000, industryType: 'mfg', year: 2025, countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 } });
    expect(r.totalCarbonCost).toBe(0);
  });
  test('TW-05: 24,999 below threshold → NT$0 + note', () => {
    const r = taiwanCalculator.calculate({ annualEmissions: 24999, industryType: 'mfg', year: 2025, countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 } });
    expect(r.totalCarbonCost).toBe(0);
    expect(r.notes).toContain('tw_below_threshold');
  });
  test('TW-06: 500K high CL period1 → 30M/10M/5M', () => {
    const cs = { highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 };
    const g = taiwanCalculator.calculate({ annualEmissions: 500000, industryType: 'petro', year: 2025, countrySpecific: { ...cs, rateType: 'general' } });
    const b = taiwanCalculator.calculate({ annualEmissions: 500000, industryType: 'petro', year: 2025, countrySpecific: { ...cs, rateType: 'preferB' } });
    const a = taiwanCalculator.calculate({ annualEmissions: 500000, industryType: 'petro', year: 2025, countrySpecific: { ...cs, rateType: 'preferA' } });
    expect(g.totalCarbonCost).toBe(30_000_000);
    expect(b.totalCarbonCost).toBe(10_000_000);
    expect(a.totalCarbonCost).toBe(5_000_000);
  });
  test('TW-07: 500K high CL period3 → 90M/30M/15M', () => {
    const cs = { highCarbonLeakage: true, period: 'period3_2029_2030', carbonCreditOffset: 0 };
    const g = taiwanCalculator.calculate({ annualEmissions: 500000, industryType: 'petro', year: 2029, countrySpecific: { ...cs, rateType: 'general' } });
    const b = taiwanCalculator.calculate({ annualEmissions: 500000, industryType: 'petro', year: 2029, countrySpecific: { ...cs, rateType: 'preferB' } });
    const a = taiwanCalculator.calculate({ annualEmissions: 500000, industryType: 'petro', year: 2029, countrySpecific: { ...cs, rateType: 'preferA' } });
    expect(g.totalCarbonCost).toBe(90_000_000);
    expect(b.totalCarbonCost).toBe(30_000_000);
    expect(a.totalCarbonCost).toBe(15_000_000);
  });
  test('TW-08: 中鋼 20M → NT$400M', () => {
    const r = taiwanCalculator.calculate({ annualEmissions: 20_000_000, industryType: 'steel', year: 2025, countrySpecific: { rateType: 'preferB', highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 } });
    expect(r.totalCarbonCost).toBe(400_000_000);
  });

  // ======== SINGAPORE ========
  test('SG-01: 500K 2026 → SGD 22,500,000', () => {
    expect(singaporeCalculator.calculate({ annualEmissions: 500000, industryType: 'refining', year: 2026, countrySpecific: { internationalCarbonCredits: 0 } }).totalCarbonCost).toBe(22_500_000);
  });
  test('SG-02: 100K 2024 → SGD 2,500,000', () => {
    expect(singaporeCalculator.calculate({ annualEmissions: 100000, industryType: 'power', year: 2024, countrySpecific: { internationalCarbonCredits: 0 } }).totalCarbonCost).toBe(2_500_000);
  });
  test('SG-03: 24,999 → not applicable', () => {
    const r = singaporeCalculator.calculate({ annualEmissions: 24999, industryType: 'mfg', year: 2026, countrySpecific: { internationalCarbonCredits: 0 } });
    expect(r.totalCarbonCost).toBe(0);
    expect(r.notes).toContain('sg_below_threshold');
  });
  test('SG-04: 200K with 5% credits → SGD 8,550,000', () => {
    expect(singaporeCalculator.calculate({ annualEmissions: 200000, industryType: 'petro', year: 2026, countrySpecific: { internationalCarbonCredits: 10000 } }).totalCarbonCost).toBe(8_550_000);
  });

  // ======== KOREA ========
  test('KR-01: 1M free 850K → ₩1,371,750,000', () => {
    expect(koreaCalculator.calculate({ annualEmissions: 1_000_000, industryType: 'steel', year: 2025, countrySpecific: { freeAllowance: 850_000, kauPrice: 9145 } }).totalCarbonCost).toBe(1_371_750_000);
  });
  test('KR-02: 800K < 850K free → ₩0', () => {
    const r = koreaCalculator.calculate({ annualEmissions: 800_000, industryType: 'steel', year: 2025, countrySpecific: { freeAllowance: 850_000, kauPrice: 9145 } });
    expect(r.totalCarbonCost).toBe(0);
    expect(r.notes).toContain('kr_surplus_allowance');
  });

  // ======== JAPAN ========
  test('JP-01: 200K carbon tax → ¥57,800,000', () => {
    expect(japanCalculator.calculate({ annualEmissions: 200_000, industryType: 'steel', year: 2025, countrySpecific: { isGxEtsRegulated: false } }).totalCarbonCost).toBe(57_800_000);
  });
  test('JP-02: 99,999 below GX-ETS → ¥28,899,711', () => {
    const r = japanCalculator.calculate({ annualEmissions: 99_999, industryType: 'steel', year: 2026, countrySpecific: { isGxEtsRegulated: true, gxEtsPrice: 4100 } });
    expect(r.totalCarbonCost).toBe(99_999 * 289);
    expect(r.notes).toContain('jp_below_gx_ets_threshold');
  });

  // ======== THAILAND ========
  test('TH-01: diesel 1M L → THB 520,000', () => {
    const r = thailandCalculator.calculate({ annualEmissions: 0, industryType: 'power', year: 2025, countrySpecific: { inputMode: 'fuel', dieselLitres: 1_000_000 } });
    expect(Math.round(r.totalCarbonCost)).toBe(520_000);
  });
  test('TH-02: electricity 500K kWh → THB 0 (oil-products-only tax base; electricity excluded)', () => {
    const r = thailandCalculator.calculate({ annualEmissions: 0, industryType: 'other', year: 2025, countrySpecific: { inputMode: 'fuel', electricityKwh: 500_000 } });
    expect(Math.round(r.totalCarbonCost)).toBe(0);
    expect(r.notes).toContain('th_tax_base_oil_only');
    expect(r.breakdown.some((b) => b.step === 'th_step_electricity_excluded')).toBe(true);
  });
  test('TH-03: workbench taxable-tonnes path → tax on oil share, blended effective rate', () => {
    const r = thailandCalculator.calculate({ annualEmissions: 4_275, industryType: 'other', year: 2025, countrySpecific: { taxableEmissionsTonnes: 260.63 } });
    expect(Math.round(r.totalCarbonCost)).toBe(52_126);
    expect(r.chargeableEmissions).toBeCloseTo(260.63, 2);
    expect(r.effectiveRate).toBeCloseTo(52_126 / 4_275, 1);
  });

  // ======== VIETNAM ========
  test('VN-01: 80K no price → VND 0 + warnings', () => {
    const r = vietnamCalculator.calculate({ annualEmissions: 80_000, industryType: 'steel', year: 2025, countrySpecific: { scenarioCarbonPrice: 0 } });
    expect(r.totalCarbonCost).toBe(0);
    expect(r.deductibleForCBAM).toBe(0);
    expect(r.notes).toContain('vn_no_formal_carbon_price');
    expect(r.notes).toContain('vn_cbam_full_exposure');
  });

  // ======== CBAM ========
  test('CBAM-01: TW steel 5000t BF-BOF → ≈€338,460', () => {
    const r = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 0, originCountry: 'tw' });
    expect(r.grossEmissions).toBe(10500);
    expect(r.freeAllocation).toBeCloseTo(6269.25);
    expect(r.totalCBAMCost).toBeCloseTo(338460, -1);
  });
  test('CBAM-02: TW deduction NT$2M×30%/34 → net ≈€320,813', () => {
    const deduct = (2_000_000 * 0.30) / 34;
    const r = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: deduct, originCountry: 'tw' });
    expect(r.netCBAMCost).toBeCloseTo(320813, -1);
  });
  test('CBAM-03: ≤50t exempt', () => {
    const r = calculateCBAM({ productType: 'steel_bof', importVolume: 30, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 0, originCountry: 'vn' });
    expect(r.isExempt).toBe(true);
    expect(r.netCBAMCost).toBe(0);
  });
  test('CBAM-04: default > actual', () => {
    const act = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 0, originCountry: 'vn' });
    const def = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 0, useDefaultEmissions: true, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 0, originCountry: 'vn' });
    expect(def.netCBAMCost).toBeGreaterThan(act.netCBAMCost);
  });
  test('CBAM-05: VN > TW > KR', () => {
    const vn = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 0, originCountry: 'vn' });
    const tw = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 1000, originCountry: 'tw' });
    const kr = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 5000, originCountry: 'kr' });
    expect(vn.netCBAMCost).toBeGreaterThan(tw.netCBAMCost);
    expect(tw.netCBAMCost).toBeGreaterThan(kr.netCBAMCost);
  });

  // ======== LOGIC CHECKS ========
  test('LC-01: CBAM deduction never negative', () => {
    const r = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80, domesticCarbonPricePaid: 9_999_999, originCountry: 'tw' });
    expect(r.netCBAMCost).toBeGreaterThanOrEqual(0);
  });
  test('LC-02: chargeable emissions ≥ 0', () => {
    const r = taiwanCalculator.calculate({ annualEmissions: 1000, industryType: 'mfg', year: 2025, countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 } });
    expect(r.chargeableEmissions).toBeGreaterThanOrEqual(0);
  });
  test('LC-03: general > preferB > preferA', () => {
    for (const e of [1000, 100000, 10_000_000]) {
      const cs = { highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 };
      const g = taiwanCalculator.calculate({ annualEmissions: e, industryType: 'steel', year: 2025, countrySpecific: { ...cs, rateType: 'general' } });
      const b = taiwanCalculator.calculate({ annualEmissions: e, industryType: 'steel', year: 2025, countrySpecific: { ...cs, rateType: 'preferB' } });
      const a = taiwanCalculator.calculate({ annualEmissions: e, industryType: 'steel', year: 2025, countrySpecific: { ...cs, rateType: 'preferA' } });
      expect(g.totalCarbonCost).toBeGreaterThanOrEqual(b.totalCarbonCost);
      expect(b.totalCarbonCost).toBeGreaterThanOrEqual(a.totalCarbonCost);
    }
  });
  test('LC-04: zero emissions → zero cost all countries', () => {
    const calcs = [taiwanCalculator, singaporeCalculator, koreaCalculator, japanCalculator, thailandCalculator, vietnamCalculator];
    for (const c of calcs) {
      const r = c.calculate({ annualEmissions: 0, industryType: 'steel', year: 2025, countrySpecific: c.getDefaultParams() });
      expect(r.totalCarbonCost).toBe(0);
    }
  });
  test('LC-05: VN CBAM ≥ all others', () => {
    const base = { productType: 'steel_bof' as const, importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: 2026, euEtsPrice: 80 };
    const vn = calculateCBAM({ ...base, domesticCarbonPricePaid: 0, originCountry: 'vn' });
    for (const [code, deduct] of [['tw', 1000], ['sg', 2000], ['kr', 5000], ['jp', 500], ['th', 300]] as const) {
      const r = calculateCBAM({ ...base, domesticCarbonPricePaid: deduct, originCountry: code });
      expect(vn.netCBAMCost).toBeGreaterThanOrEqual(r.netCBAMCost);
    }
  });
  test('LC-06: CBAM cost increases 2026→2034', () => {
    const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
    let prev = 0;
    for (const y of years) {
      const r = calculateCBAM({ productType: 'steel_bof', importVolume: 5000, specificEmbeddedEmissions: 2.1, useDefaultEmissions: false, year: y, euEtsPrice: 80, domesticCarbonPricePaid: 0, originCountry: 'vn' });
      expect(r.netCBAMCost).toBeGreaterThanOrEqual(prev);
      prev = r.netCBAMCost;
    }
  });
});
