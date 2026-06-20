import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';
import { computeWorkbench } from '@/lib/workbench/aggregate';

describe('computeWorkbench — unified P&L over one profile', () => {
  it('runs all engines; Taiwan fee = (emissions − K) × CL × rate (50k t, non-leakage)', () => {
    const r = computeWorkbench(emptyProfile());
    // 50,000 − 25,000 = 25,000 × 1.0 × NT$300 = 7,500,000
    expect(r.domestic.totalFeeTWD).toBe(7_500_000);
    expect(r.domestic.totalFeeUSD).toBeGreaterThan(0);
    // R4 #5 — single TW facility: all USD is the Taiwan equivalent, none overseas
    expect(r.domestic.taiwanFeeUSD).toBeCloseTo(r.domestic.totalFeeUSD, 6);
    expect(r.domestic.overseasFeeUSD).toBe(0);
    expect(r.listed.ifrs.phase).toBe(3); // under50
    expect(['low', 'medium', 'high']).toContain(r.supplyChain.pressureLevel);
  });

  it('R4 #5 — splits domestic USD into Taiwan vs overseas (no NT$0 ≈ US$x conflation)', () => {
    const p: CompanyProfile = {
      ...emptyProfile(),
      facilities: [
        // TW facility below the 25,000 t K threshold → fee NT$0
        { ...emptyProfile().facilities[0], id: 'tw', countryCode: 'tw', annualEmissionsTonnes: 10_000 },
        // Singapore facility → a real SGD tax, contributes only to overseas USD
        { ...emptyProfile().facilities[0], id: 'sg', countryCode: 'sg', annualEmissionsTonnes: 100_000 },
      ],
    };
    const r = computeWorkbench(p);
    expect(r.domestic.totalFeeTWD).toBe(0); // TW below threshold
    expect(r.domestic.taiwanFeeUSD).toBe(0); // → its USD equivalent is also 0 (no phantom conflation)
    expect(r.domestic.overseasFeeUSD).toBeGreaterThan(0); // all USD comes from Singapore
    expect(r.domestic.totalFeeUSD).toBeCloseTo(r.domestic.overseasFeeUSD, 6);
  });

  it('CBAM portfolio total = sum of the individual line obligations (actual-data lines)', () => {
    const p: CompanyProfile = {
      ...emptyProfile(),
      year: 2026, // CBAM factor 2.5%
      etsPrice: 80,
      cbamProducts: [
        { id: 'a', label: 'steel', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 5000, emissionsSource: 'actual', actualSpecificEmissions: 2.1 },
        { id: 'b', label: 'alu', product: 'aluminum', originCountry: 'tw', annualVolumeTonnes: 3000, emissionsSource: 'actual', actualSpecificEmissions: 8.0 },
      ],
    };
    const r = computeWorkbench(p);
    const expected = Math.round(5000 * 2.1 * 80 * 0.025) + Math.round(3000 * 8.0 * 80 * 0.025); // 21000 + 48000
    expect(r.cbam.totalObligationEUR).toBe(expected);
    expect(r.cbam.pricedLines).toBe(2);
    expect(r.cbam.lockedLines).toBe(0);
  });

  it('a locked official-default line is FLAGGED, never silently zeroed (red line)', () => {
    const r = computeWorkbench(emptyProfile()); // default line is official_default, no lookup → locked
    expect(r.cbam.lockedLines).toBe(1);
    expect(r.cbam.totalObligationEUR).toBeUndefined(); // not 0
    expect(r.cbam.pricedLines).toBe(0);
  });
});
