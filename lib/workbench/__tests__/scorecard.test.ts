import {
  currentStatus, evaluateRequirement, evaluateCustomer, scorecardSummary,
  customerFromTemplate, SCORECARD_TEMPLATES, type CustomerLine, type CustomerRequirement,
} from '@/lib/workbench/scorecard';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

function supplier(): CompanyProfile {
  const p = emptyProfile();
  p.facilities = [{
    id: 'f', label: 'fab', countryCode: 'tw', annualEmissionsTonnes: 0, useInventory: true, renewablePct: 40,
    activities: [{ id: 'e', factorKey: 'electricity', amount: 10_000_000 }],
    highCarbonLeakage: false, rateType: 'general', carbonCreditOffset: 0, hasApprovedReductionPlan: false,
  }];
  p.cbamProducts = [];
  p.scope3 = [
    { id: 's1', category: 1, label: 'mat', method: 'manual', tonnesDirect: 50000 },
    { id: 's11', category: 11, label: 'use', method: 'manual', tonnesDirect: 80000 },
  ];
  p.baseYear = 2024; p.targetYear = 2030; p.baseYearEmissionsTonnes = 6000; p.targetReductionPct = 42; p.targetScope = 'scope12';
  p.cycleStage = 'assured';
  p.products = [{ id: 'p', name: 'A', annualUnits: 1000 }];
  p.selfRatings = { cdp: 'B', ecovadis: 'silver' };
  return p;
}
const r = (dimension: any, kind: any, extra: any = {}): CustomerRequirement => ({ id: dimension + kind, dimension, kind, ...extra });

describe('CS — customer scorecard engine', () => {
  it('reads current status from the computed profile + self-ratings (nothing fabricated)', () => {
    const s = currentStatus(supplier());
    expect(s.hasScope12).toBe(true);
    expect(s.hasScope3).toBe(true);
    expect(s.scope3Categories).toBe(2);
    expect(s.reductionPct).toBe(42);
    expect(s.sbtiAligned).toBe(true); // 42%/6yr = 7%/yr ≥ 4.2 (rate qualifies)
    expect(s.sbtiCommitment).toBe('none'); // R4 #8 — but no SBTi commitment self-declared
    expect(s.renewablePct).toBeCloseTo(40, 0);
    expect(s.assured).toBe(true);
    expect(s.hasPcf).toBe(true);
    expect(s.ratings.cdp).toBe('B');
  });

  it('evaluates a requirement against the threshold per dimension', () => {
    const s = currentStatus(supplier());
    expect(evaluateRequirement(r('target', 'gate', { minPct: 30, byYear: 2030 }), s).status).toBe('met'); // 42% ≥ 30 by 2030
    expect(evaluateRequirement(r('target', 'gate', { minPct: 50 }), s).status).toBe('partial'); // 42 < 50
    expect(evaluateRequirement(r('renewable', 'scored', { minPct: 30 }), s).status).toBe('met'); // 40 ≥ 30
    expect(evaluateRequirement(r('renewable', 'gate', { minPct: 100, byYear: 2030 }), s).status).toBe('partial'); // 40 < 100, has some
    expect(evaluateRequirement(r('cdp', 'scored', { tier: 'C' }), s).status).toBe('met'); // B ≥ C
    expect(evaluateRequirement(r('cdp', 'gate', { tier: 'A' }), s).status).toBe('unmet'); // B < A
    // R4 #8 — rate qualifies but no commitment → PARTIAL, never a green met (no false "we're SBTi")
    expect(evaluateRequirement(r('sbti', 'gate'), s).status).toBe('partial');
    const committed = currentStatus({ ...supplier(), selfRatings: { ...supplier().selfRatings, sbti: 'committed' } });
    expect(evaluateRequirement(r('sbti', 'gate'), committed).status).toBe('met');
    expect(evaluateRequirement(r('sbti', 'gate'), committed).have.en).toBe('Committed'); // R4 #9 — bilingual have/need
    const noRate = currentStatus({ ...supplier(), targetReductionPct: 6 }); // 6%/6yr = 1%/yr < 4.2, no commitment
    expect(evaluateRequirement(r('sbti', 'gate'), noRate).status).toBe('unmet');
    expect(evaluateRequirement(r('netzero', 'gate'), s).status).toBe('unmet'); // 42% target, no ≥90 net-zero
    expect(evaluateRequirement(r('ecovadis', 'gate', { tier: 'gold' }), s).status).toBe('unmet'); // silver < gold
  });

  it('classifies order risk: failed gate → at-risk; scored gap only → watch; all met → preferred', () => {
    const s = currentStatus(supplier());
    const preferred: CustomerLine = { id: 'a', name: 'A', requirements: [r('scope12', 'gate'), r('target', 'gate', { minPct: 30 }), r('cdp', 'scored', { tier: 'C' })] };
    expect(evaluateCustomer(preferred, s).risk).toBe('preferred');
    const watch: CustomerLine = { id: 'b', name: 'B', requirements: [r('scope12', 'gate'), r('renewable', 'scored', { minPct: 100 }) /* 40<100 → scored gap */] };
    expect(evaluateCustomer(watch, s).risk).toBe('watch');
    const atRisk: CustomerLine = { id: 'c', name: 'C', requirements: [r('ecovadis', 'gate', { tier: 'gold' }) /* fail */] };
    expect(evaluateCustomer(atRisk, s).risk).toBe('at-risk');
  });

  it('summary sorts at-risk first and surfaces the highest-leverage gap across customers', () => {
    const p = supplier();
    // two customers both gated on EcoVadis Gold (which the supplier fails) → fixing it unblocks both
    p.scorecardCustomers = [
      { id: 'x', name: 'X', importance: 'minor', requirements: [r('ecovadis', 'gate', { tier: 'gold' })] },
      { id: 'y', name: 'Y', importance: 'key', requirements: [r('ecovadis', 'gate', { tier: 'gold' }), r('scope12', 'gate')] },
      { id: 'z', name: 'Z', requirements: [r('scope12', 'gate'), r('target', 'gate', { minPct: 30 })] }, // all met → preferred
    ];
    const sum = scorecardSummary(p);
    expect(sum.atRisk).toBe(2);
    expect(sum.customers[0].risk).toBe('at-risk');
    expect(sum.customers[sum.customers.length - 1].customer.name).toBe('Z'); // preferred last
    // EcoVadis is the top-leverage gap (blocks 2 customers)
    expect(sum.leverage[0].dimension).toBe('ecovadis');
    expect(sum.leverage[0].unblocks).toBe(2);
  });

  it('templates build a sensible requirement set from public frameworks', () => {
    const tpl = SCORECARD_TEMPLATES.find((t) => t.key === 'generic-reduction')!;
    const c = customerFromTemplate(tpl, '客戶A');
    expect(c.name).toBe('客戶A');
    expect(c.requirements.some((req) => req.dimension === 'target' && req.kind === 'gate')).toBe(true);
    expect(SCORECARD_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });
});
