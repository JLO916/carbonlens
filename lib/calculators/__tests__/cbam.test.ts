import { calculateCBAM } from '../cbam';
import { CBAMInput } from '@/lib/types';

describe('CBAM Calculator', () => {
  // CBAM-03: De minimis exemption
  it('CBAM-03: should apply de minimis exemption for ≤50t (except H₂/electricity)', () => {
    const input: CBAMInput = {
      productType: 'steel_bof',
      importVolume: 30,
      specificEmbeddedEmissions: 2.1,
      useDefaultEmissions: false,
      year: 2026,
      euEtsPrice: 80,
      domesticCarbonPricePaid: 0,
      originCountry: 'vn',
    };
    const result = calculateCBAM(input);
    expect(result.isExempt).toBe(true);
    expect(result.netCBAMCost).toBe(0);
  });

  it('CBAM-03: should NOT exempt hydrogen from de minimis', () => {
    const input: CBAMInput = {
      productType: 'hydrogen_smr',
      importVolume: 30,
      specificEmbeddedEmissions: 9.0,
      useDefaultEmissions: false,
      year: 2026,
      euEtsPrice: 80,
      domesticCarbonPricePaid: 0,
      originCountry: 'other',
    };
    const result = calculateCBAM(input);
    expect(result.isExempt).toBe(false);
  });

  // CBAM-01: Taiwan steel export, EU benchmark based
  // 內含排放=5000×2.1=10,500
  // 免費配額=1.286×0.975×5000=6,269.25
  // 淨排放=10,500-6,269.25=4,230.75
  // 成本=4,230.75×€80=€338,460
  it('CBAM-01: steel BF-BOF 5000t from Taiwan, 2026, EU ETS €80', () => {
    const input: CBAMInput = {
      productType: 'steel_bof',
      importVolume: 5000,
      specificEmbeddedEmissions: 2.1,
      useDefaultEmissions: false,
      year: 2026,
      euEtsPrice: 80,
      domesticCarbonPricePaid: 0,
      originCountry: 'tw',
    };
    const result = calculateCBAM(input);

    expect(result.grossEmissions).toBe(10500);
    // Free allocation = 1.286 × 0.975 × 5000 = 6269.25
    expect(result.freeAllocation).toBeCloseTo(6269.25);
    // Net emissions = 10500 - 6269.25 = 4230.75
    expect(result.netEmissions).toBeCloseTo(4230.75);
    // Gross CBAM = 4230.75 × 80 = 338,460
    expect(result.totalCBAMCost).toBeCloseTo(338460);
    // No domestic deduction yet
    expect(result.netCBAMCost).toBeCloseTo(338460);
  });

  // CBAM-02: Same as CBAM-01 but with Taiwan domestic carbon price deducted
  // Taiwan paid NT$2M, 30% exported to EU → deductible = 2M×30% = NT$600K
  // At EUR/TWD=34 → €17,647
  // Net CBAM = 338,460 - 17,647 ≈ €320,813
  it('CBAM-02: same as CBAM-01 with domestic deduction NT$2M, 30% EU export', () => {
    const domesticCostTWD = 2_000_000;
    const exportPercentage = 0.30;
    const eurTwdRate = 34;
    const deductibleEUR = (domesticCostTWD * exportPercentage) / eurTwdRate;

    const input: CBAMInput = {
      productType: 'steel_bof',
      importVolume: 5000,
      specificEmbeddedEmissions: 2.1,
      useDefaultEmissions: false,
      year: 2026,
      euEtsPrice: 80,
      domesticCarbonPricePaid: deductibleEUR,
      originCountry: 'tw',
    };
    const result = calculateCBAM(input);

    expect(deductibleEUR).toBeCloseTo(17647.06, 0);
    expect(result.totalCBAMCost).toBeCloseTo(338460);
    expect(result.domesticCreditDeduction).toBeCloseTo(17647.06, 0);
    // Net = 338460 - 17647 ≈ 320813
    expect(result.netCBAMCost).toBeCloseTo(320813, -1);
  });

  // CBAM-04: Default vs actual emissions
  it('CBAM-04: default emissions should cost more than actual (2026 +10% surcharge)', () => {
    const baseInput = {
      productType: 'steel_bof',
      importVolume: 5000,
      year: 2026,
      euEtsPrice: 80,
      domesticCarbonPricePaid: 0,
      originCountry: 'vn' as const,
    };

    const actualResult = calculateCBAM({
      ...baseInput,
      specificEmbeddedEmissions: 2.1,
      useDefaultEmissions: false,
    });

    const defaultResult = calculateCBAM({
      ...baseInput,
      specificEmbeddedEmissions: 0,
      useDefaultEmissions: true,
    });

    // Default (2.1×1.10=2.31) > actual (2.1) → higher cost
    expect(defaultResult.grossEmissions).toBeGreaterThan(actualResult.grossEmissions);
    expect(defaultResult.netCBAMCost).toBeGreaterThan(actualResult.netCBAMCost);
  });

  // CBAM cost should increase year-over-year as free allocation decreases
  it('LC-06: CBAM cost increases from 2026 to 2034', () => {
    const years = [2026, 2027, 2028, 2029, 2030, 2034];
    const results = years.map(year =>
      calculateCBAM({
        productType: 'steel_bof',
        importVolume: 5000,
        specificEmbeddedEmissions: 2.1,
        useDefaultEmissions: false,
        year,
        euEtsPrice: 80,
        domesticCarbonPricePaid: 0,
        originCountry: 'vn',
      })
    );

    for (let i = 1; i < results.length; i++) {
      expect(results[i].netCBAMCost).toBeGreaterThan(results[i - 1].netCBAMCost);
    }
  });

  // In 2034, free allocation = 0, full cost
  it('2034: full CBAM cost with no free allocation', () => {
    const result = calculateCBAM({
      productType: 'steel_bof',
      importVolume: 5000,
      specificEmbeddedEmissions: 2.1,
      useDefaultEmissions: false,
      year: 2034,
      euEtsPrice: 80,
      domesticCarbonPricePaid: 0,
      originCountry: 'vn',
    });

    expect(result.cbamFactor).toBe(0); // no free allocation
    expect(result.freeAllocation).toBe(0);
    expect(result.netEmissions).toBe(10500);
    expect(result.netCBAMCost).toBe(840000); // 10500 × 80
  });
});
