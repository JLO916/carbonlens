import { taiwanCalculator } from '../domestic/taiwan';
import { DomesticInput } from '../domestic/types';

describe('Taiwan Carbon Fee Calculator — Validation Cases', () => {
  // TW-01: 鋼鐵業, 100,000 tCO₂e, 高碳洩漏, 優惠B, 第一期 → NT$2,000,000
  it('TW-01: steel 100K, high CL, preferB, period1 → NT$2,000,000', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 100000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { rateType: 'preferB', highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    expect(result.chargeableEmissions).toBe(20000);
    expect(result.totalCarbonCost).toBe(2_000_000);
  });

  // TW-02: 半導體, 50,000 tCO₂e, 非高碳洩漏, 一般費率 → NT$7,500,000
  it('TW-02: semiconductor 50K, non-high CL, general → NT$7,500,000', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 50000,
      industryType: 'semiconductor',
      year: 2025,
      countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    expect(result.chargeableEmissions).toBe(25000);
    expect(result.totalCarbonCost).toBe(7_500_000);
  });

  // TW-03: 水泥業, 200,000 tCO₂e, 高碳洩漏, 優惠A, 第一期 → NT$2,000,000
  it('TW-03: cement 200K, high CL, preferA, period1 → NT$2,000,000', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 200000,
      industryType: 'cement',
      year: 2025,
      countrySpecific: { rateType: 'preferA', highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    // (200,000-0)×0.2×50 = 40,000×50 = 2,000,000
    expect(result.chargeableEmissions).toBe(40000);
    expect(result.totalCarbonCost).toBe(2_000_000);
  });

  // TW-04: 排放量剛好 25,000 tCO₂e, 非高碳洩漏 → NT$0
  it('TW-04: exactly 25K emissions, non-high CL → NT$0', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 25000,
      industryType: 'manufacturing',
      year: 2025,
      countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    expect(result.chargeableEmissions).toBe(0);
    expect(result.totalCarbonCost).toBe(0);
  });

  // TW-05: 排放量 24,999 tCO₂e → 低於門檻，碳費為 0
  it('TW-05: 24,999 emissions, below K-value threshold → NT$0', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 24999,
      industryType: 'manufacturing',
      year: 2025,
      countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    expect(result.chargeableEmissions).toBe(0);
    expect(result.totalCarbonCost).toBe(0);
    // Should include a below-threshold note
    expect(result.notes).toContain('tw_below_threshold');
  });

  // TW-06: 石化業, 500,000 tCO₂e, 高碳洩漏, 第一期 — 三種費率比較
  it('TW-06: 500K high CL period1, general=30M > B=10M > A=5M', () => {
    const base = {
      annualEmissions: 500000,
      industryType: 'petrochemicals',
      year: 2025,
      countrySpecific: { highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    } as const;

    const general = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'general' } });
    const preferB = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'preferB' } });
    const preferA = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'preferA' } });

    // 500K×0.2=100K chargeable
    expect(general.chargeableEmissions).toBe(100000);
    expect(general.totalCarbonCost).toBe(30_000_000);
    expect(preferB.totalCarbonCost).toBe(10_000_000);
    expect(preferA.totalCarbonCost).toBe(5_000_000);
    // Must satisfy: general > B > A
    expect(general.totalCarbonCost).toBeGreaterThan(preferB.totalCarbonCost);
    expect(preferB.totalCarbonCost).toBeGreaterThan(preferA.totalCarbonCost);
  });

  // TW-07: 同 TW-06 但第三期 CL=0.6
  it('TW-07: 500K high CL period3, general=90M > B=30M > A=15M', () => {
    const base = {
      annualEmissions: 500000,
      industryType: 'petrochemicals',
      year: 2029,
      countrySpecific: { highCarbonLeakage: true, period: 'period3_2029_2030', carbonCreditOffset: 0 },
    } as const;

    const general = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'general' } });
    const preferB = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'preferB' } });
    const preferA = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'preferA' } });

    // 500K×0.6=300K chargeable
    expect(general.chargeableEmissions).toBe(300000);
    expect(general.totalCarbonCost).toBe(90_000_000);
    expect(preferB.totalCarbonCost).toBe(30_000_000);
    expect(preferA.totalCarbonCost).toBe(15_000_000);
  });

  // TW-08: 中鋼 ~20M tCO₂e, 高碳洩漏, 優惠B, 第一期 → ~NT$400M (允許 10% 誤差)
  it('TW-08: 中鋼 reference 20M, high CL, preferB, period1 → ~NT$400M', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 20_000_000,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { rateType: 'preferB', highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    // 20M×0.2×100 = 400M
    expect(result.totalCarbonCost).toBe(400_000_000);
  });

  // LC-04: 排放量=0 → 碳成本=0
  it('LC-04: zero emissions → zero cost', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 0,
      industryType: 'steel',
      year: 2025,
      countrySpecific: { rateType: 'general', highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    expect(result.totalCarbonCost).toBe(0);
    expect(result.chargeableEmissions).toBe(0);
  });

  // LC-02: 收費排放量永遠 ≥ 0
  it('LC-02: chargeable emissions are never negative', () => {
    const result = taiwanCalculator.calculate({
      annualEmissions: 10000,
      industryType: 'manufacturing',
      year: 2025,
      countrySpecific: { rateType: 'general', highCarbonLeakage: false, period: 'period1_2025_2026', carbonCreditOffset: 0 },
    });
    expect(result.chargeableEmissions).toBeGreaterThanOrEqual(0);
  });

  // LC-03: general > preferB > preferA for any input
  it('LC-03: rate ordering holds for any emissions value', () => {
    [1000, 50000, 500000, 10_000_000].forEach(emissions => {
      const base = {
        annualEmissions: emissions,
        industryType: 'steel',
        year: 2025,
        countrySpecific: { highCarbonLeakage: true, period: 'period1_2025_2026', carbonCreditOffset: 0 },
      };
      const g = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'general' } });
      const b = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'preferB' } });
      const a = taiwanCalculator.calculate({ ...base, countrySpecific: { ...base.countrySpecific, rateType: 'preferA' } });
      expect(g.totalCarbonCost).toBeGreaterThanOrEqual(b.totalCarbonCost);
      expect(b.totalCarbonCost).toBeGreaterThanOrEqual(a.totalCarbonCost);
    });
  });
});
