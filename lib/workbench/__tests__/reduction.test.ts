import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { applyReduction, REDUCTION_LEVERS } from '@/lib/workbench/reduction';

describe('applyReduction — one lever flows through the real engines (no abatement costs)', () => {
  it('20% target lowers facility emissions → lower Taiwan carbon fee', () => {
    const base = emptyProfile();
    const reduced = applyReduction(base, 20);
    expect(reduced.facilities[0].annualEmissionsTonnes).toBe(40000); // 50000 × 0.8
    const feeBase = computeWorkbench(base).domestic.totalFeeTWD; // (50000−25000)×300 = 7,500,000
    const feeReduced = computeWorkbench(reduced).domestic.totalFeeTWD; // (40000−25000)×300 = 4,500,000
    expect(feeReduced).toBeLessThan(feeBase);
    expect(feeReduced).toBe(4_500_000);
  });

  it('20% target lowers ACTUAL CBAM SEE but leaves official-default lines untouched', () => {
    const p: CompanyProfile = {
      ...emptyProfile(),
      cbamProducts: [
        { id: 'a', label: 'actual', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 5000, emissionsSource: 'actual', actualSpecificEmissions: 2.0 },
        { id: 'b', label: 'default', product: 'aluminum', originCountry: 'tw', annualVolumeTonnes: 3000, emissionsSource: 'official_default' },
      ],
    };
    const reduced = applyReduction(p, 20);
    expect(reduced.cbamProducts[0].actualSpecificEmissions).toBe(1.6); // 2.0 × 0.8
    expect(reduced.cbamProducts[1].actualSpecificEmissions).toBeUndefined(); // default path unchanged
  });

  it('0% is a no-op', () => {
    const base = emptyProfile();
    expect(applyReduction(base, 0)).toBe(base);
  });

  it('RED LINE: reduction levers carry NO cost/abatement NUMBERS (qualitative only)', () => {
    for (const lever of REDUCTION_LEVERS) {
      expect(Object.keys(lever).sort()).toEqual(['name', 'note']); // structurally only name + note — no cost field
      // no currency-amount anywhere (NT$123 / €123 / $123 / USD 123 / 123 元)
      expect(JSON.stringify(lever)).not.toMatch(/NT\$\s?\d|€\s?\d|\$\s?\d|USD\s?\d|\d\s?元/i);
    }
  });
});
