import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';
import { cbamRampSeries } from '@/lib/workbench/ramp';

const actualProfile = (): CompanyProfile => ({
  ...emptyProfile(),
  etsPrice: 80,
  cbamProducts: [{ id: 'a', label: 'steel', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 5000, emissionsSource: 'actual', actualSpecificEmissions: 2.1 }],
});

describe('cbamRampSeries — 2026→2034 banded ramp', () => {
  it('actual line: central = low = high, rising by the CBAM factor each year', () => {
    const r = cbamRampSeries(actualProfile());
    expect(r.points).toHaveLength(9);
    expect(r.hasCentral).toBe(true);
    const y26 = r.points.find((p) => p.year === 2026)!;
    const y34 = r.points.find((p) => p.year === 2034)!;
    expect(y26.centralEUR).toBe(Math.round(5000 * 2.1 * 0.025 * 80)); // 21000
    expect(y26.lowEUR).toBe(y26.highEUR); // point = no band for actual
    expect(y34.centralEUR).toBe(Math.round(5000 * 2.1 * 1.0 * 80)); // 840000
    expect(y34.centralEUR!).toBeGreaterThan(y26.centralEUR!); // ramps up
  });

  it('range lookup gives an honest band (low≤high) with NO central', () => {
    const p = { ...actualProfile(), cbamProducts: [{ ...emptyProfile().cbamProducts[0] }] }; // official_default line
    const r = cbamRampSeries(p, [{ mode: 'range', min: 1.5, max: 2.5, n: 10, asOf: '2026-02-04' }]);
    expect(r.hasCentral).toBe(false);
    const y26 = r.points.find((p) => p.year === 2026)!;
    expect(y26.lowEUR).toBe(Math.round(5000 * 1.5 * 0.025 * 80)); // 15000
    expect(y26.highEUR).toBe(Math.round(5000 * 2.5 * 0.025 * 80)); // 25000
    expect(y26.lowEUR).toBeLessThan(y26.highEUR);
    expect(y26.centralEUR).toBeUndefined();
  });

  it('A3 ETS sensitivity: low/high ETS widen the band around the central line', () => {
    const r = cbamRampSeries({ ...actualProfile(), etsPriceLow: 60, etsPriceHigh: 120 });
    const y26 = r.points.find((p) => p.year === 2026)!;
    expect(y26.lowEUR).toBe(Math.round(5000 * 2.1 * 0.025 * 60)); // 15750
    expect(y26.centralEUR).toBe(Math.round(5000 * 2.1 * 0.025 * 80)); // 21000
    expect(y26.highEUR).toBe(Math.round(5000 * 2.1 * 0.025 * 120)); // 31500
    expect(y26.lowEUR).toBeLessThan(y26.centralEUR!);
    expect(y26.highEUR).toBeGreaterThan(y26.centralEUR!);
  });

  it('no ETS price → no ramp (still no estimate)', () => {
    expect(cbamRampSeries({ ...actualProfile(), etsPrice: undefined }).points).toHaveLength(0);
  });

  it('a locked official-default line (no lookup) is flagged and excluded, not zeroed', () => {
    const r = cbamRampSeries(emptyProfile() as CompanyProfile); // default line, no etsPrice → empty
    expect(r.points).toHaveLength(0);
    const withEts = cbamRampSeries({ ...emptyProfile(), etsPrice: 80 } as CompanyProfile, [undefined]);
    expect(withEts.lockedLines).toBe(1);
    expect(withEts.points.every((p) => p.lowEUR === 0)).toBe(true); // no usable lines → 0, but lockedLines flags why
  });
});

describe('R4 #7 — allocated lines populate the ramp (chart matches the P&L/deduction)', () => {
  it('an allocated CBAM line yields a non-empty central series and is NOT counted as locked', () => {
    const p: CompanyProfile = {
      ...emptyProfile(),
      etsPrice: 80,
      facilities: [{
        ...emptyProfile().facilities[0], id: 'f1', countryCode: 'tw', useInventory: true, annualEmissionsTonnes: 0,
        activities: [{ id: 'd', factorKey: 'diesel', amount: 1_000_000 }], // 1,000,000 L × 2.6063 = 2,606.3 t Scope 1
      }],
      cbamProducts: [{ id: 'c', label: 'steel', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'allocated', facilityId: 'f1' }],
    };
    const r = cbamRampSeries(p); // no lookups needed — allocated resolves from the facility inventory
    expect(r.lockedLines).toBe(0); // was wrongly 1 (treated as locked) before the fix
    expect(r.hasCentral).toBe(true);
    const y26 = r.points.find((x) => x.year === 2026)!;
    // SEE ≈ 2606.3 / 1000 = 2.606; obligation 2026 = 1000 × 2.606 × 0.025 × 80
    expect(y26.centralEUR).toBeGreaterThan(0);
    expect(y26.centralEUR).toBeCloseTo(Math.round(1000 * 2.606 * 0.025 * 80), -1);
  });
});
