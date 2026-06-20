import { transitionOutlook } from '@/lib/workbench/transition';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

function tw(emissions: number): CompanyProfile {
  const p = emptyProfile();
  p.facilities = [{ ...p.facilities[0], countryCode: 'tw', annualEmissionsTonnes: emissions, useInventory: false }];
  return p;
}

describe('R4 ②④ — fee→ETS transition outlook (assumption-driven, illustrative)', () => {
  it('ETS cost = (emissions − free allocation) × assumed price; the fee uses the REAL engine', () => {
    const p = tw(32_000);
    const o = transitionOutlook(p, computeWorkbench(p), { allowancePriceTWD: 300, freeAllocationPct: 80 }, 0);
    expect(o.applies).toBe(true);
    expect(o.twEmissionsTonnes).toBe(32_000);
    expect(o.feeNowTWD).toBe(2_100_000); // (32,000 − 25,000) × 300 — real Taiwan engine
    expect(o.freeAllocationTonnes).toBe(25_600); // 80% of 32,000
    expect(o.etsLiableTonnes).toBe(6_400);
    expect(o.etsCostTWD).toBe(1_920_000); // 6,400 × 300 (illustrative)
  });

  it('④ asset face: reducing below the free allocation yields a sellable surplus; fee-after via real engine', () => {
    const p = tw(32_000);
    const o = transitionOutlook(p, computeWorkbench(p), { allowancePriceTWD: 300, freeAllocationPct: 80 }, 30);
    expect(o.reducedEmissionsTonnes).toBe(22_400); // −30%
    expect(o.surplusTonnes).toBe(3_200); // 25,600 free − 22,400 emitted
    expect(o.surplusValueTWD).toBe(960_000); // 3,200 × 300 (illustrative revenue)
    expect(o.etsAfterTWD).toBe(0); // 22,400 < 25,600 free → no allowances to buy
    expect(o.feeAfterTWD).toBe(0); // 22,400 < 25,000 K threshold → fee 0 (real engine)
    expect(o.residualTonnes).toBe(22_400);
  });

  it('does not apply without a Taiwan facility', () => {
    const p = tw(32_000);
    p.facilities = [{ ...p.facilities[0], countryCode: 'sg' }];
    expect(transitionOutlook(p, computeWorkbench(p)).applies).toBe(false);
  });

  it('a 0% free-allocation stress assumption makes all emissions ETS-liable', () => {
    const p = tw(10_000);
    const o = transitionOutlook(p, computeWorkbench(p), { allowancePriceTWD: 500, freeAllocationPct: 0 }, 0);
    expect(o.etsLiableTonnes).toBe(10_000);
    expect(o.etsCostTWD).toBe(5_000_000);
  });
});
