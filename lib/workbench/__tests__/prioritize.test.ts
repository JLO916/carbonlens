import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { rankObligations } from '@/lib/workbench/prioritize';

const TODAY = new Date('2026-06-01T00:00:00Z');

describe('rankObligations — do-this-first ordering', () => {
  it('A4: a near-deadline Phase-1 firm ranks disclosure (high effort) ABOVE the fee (high cost, low effort)', () => {
    const p: CompanyProfile = { ...emptyProfile(), capitalTier: 'over100', customerFrameworks: ['unsure'], exportSupplyChain: false };
    const items = rankObligations(computeWorkbench(p), TODAY);
    const rank = (k: string) => items.findIndex((i) => i.key === k);
    expect(rank('disclosure')).toBeLessThan(rank('domestic')); // effort/deadline beats cash-now (A4)
    expect(rank('disclosure')).toBeLessThan(rank('supply-chain'));
    expect(items[0].score).toBeGreaterThanOrEqual(items[items.length - 1].score); // sorted desc
  });

  it('domestic fee being paid now scores high; below-threshold scores low', () => {
    const paying = rankObligations(computeWorkbench(emptyProfile()), TODAY).find((i) => i.key === 'domestic')!;
    const belowK: CompanyProfile = { ...emptyProfile(), facilities: [{ ...emptyProfile().facilities[0], annualEmissionsTonnes: 10000 }] };
    const noFee = rankObligations(computeWorkbench(belowK), TODAY).find((i) => i.key === 'domestic')!;
    expect(paying.score).toBeGreaterThan(noFee.score);
    expect(noFee.score).toBeLessThan(20); // under the 25k K-value → no fee
  });

  it('non-EU exporter deprioritises CBAM', () => {
    const noEU: CompanyProfile = { ...emptyProfile(), exportsToEU: false };
    const cbam = rankObligations(computeWorkbench(noEU), TODAY).find((i) => i.key === 'cbam')!;
    expect(cbam.score).toBeLessThan(10);
  });
});
