import { singaporeCalculator } from '../domestic/singapore';

describe('Singapore Carbon Tax Calculator — Validation Cases', () => {
  // SG-01: 煉油廠, 500,000 tCO₂e, 2026年, Rate=SGD45 → SGD 22,500,000
  it('SG-01: refinery 500K, 2026 → SGD 22,500,000', () => {
    const result = singaporeCalculator.calculate({
      annualEmissions: 500000,
      industryType: 'refining',
      year: 2026,
      countrySpecific: { internationalCarbonCredits: 0 },
    });
    expect(result.totalCarbonCost).toBe(22_500_000);
    expect(result.currency).toBe('SGD');
  });

  // SG-02: 電力設施, 100,000 tCO₂e, 2024年, Rate=SGD25 → SGD 2,500,000
  it('SG-02: power facility 100K, 2024 → SGD 2,500,000', () => {
    const result = singaporeCalculator.calculate({
      annualEmissions: 100000,
      industryType: 'power',
      year: 2024,
      countrySpecific: { internationalCarbonCredits: 0 },
    });
    expect(result.totalCarbonCost).toBe(2_500_000);
  });

  // SG-03: 排放量 24,999 tCO₂e（低於門檻）→ 不適用
  it('SG-03: 24,999 below 25K threshold → zero cost', () => {
    const result = singaporeCalculator.calculate({
      annualEmissions: 24999,
      industryType: 'manufacturing',
      year: 2026,
      countrySpecific: { internationalCarbonCredits: 0 },
    });
    expect(result.totalCarbonCost).toBe(0);
    expect(result.chargeableEmissions).toBe(0);
    expect(result.notes).toContain('sg_below_threshold');
  });

  // SG-04: 200,000 tCO₂e, 2026, 使用5%國際碳權抵扣 (10,000噸) → SGD 8,550,000
  it('SG-04: 200K with 5% carbon credits (10K) → SGD 8,550,000', () => {
    const result = singaporeCalculator.calculate({
      annualEmissions: 200000,
      industryType: 'petrochemicals',
      year: 2026,
      countrySpecific: { internationalCarbonCredits: 10000 },
    });
    // (200,000 - 10,000) × 45 = 190,000 × 45 = 8,550,000
    expect(result.chargeableEmissions).toBe(190000);
    expect(result.totalCarbonCost).toBe(8_550_000);
  });

  // SG-04 edge: carbon credits exceed 5% cap
  it('SG-04 edge: credits capped at 5% of emissions', () => {
    const result = singaporeCalculator.calculate({
      annualEmissions: 200000,
      industryType: 'petrochemicals',
      year: 2026,
      countrySpecific: { internationalCarbonCredits: 50000 }, // 50K > 5% of 200K = 10K
    });
    // Capped at 10,000
    expect(result.chargeableEmissions).toBe(190000);
    expect(result.totalCarbonCost).toBe(8_550_000);
  });

  // LC-04: zero emissions → zero cost
  it('LC-04: zero emissions → zero cost', () => {
    const result = singaporeCalculator.calculate({
      annualEmissions: 0,
      industryType: 'power',
      year: 2026,
      countrySpecific: { internationalCarbonCredits: 0 },
    });
    expect(result.totalCarbonCost).toBe(0);
  });
});
