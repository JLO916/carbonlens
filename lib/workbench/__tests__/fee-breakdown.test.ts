import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { feeBreakdown } from '@/lib/workbench/fee-breakdown';

describe('feeBreakdown — show your work, honouring A1 gating', () => {
  it('general non-leakage 50k: 50,000 − 25,000 × 1.0 = 25,000 × NT$300 = NT$7,500,000', () => {
    const p = emptyProfile();
    const { facility, result } = computeWorkbench(p).domestic.facilities[0];
    const { steps } = feeBreakdown(facility, p, result);
    const join = steps.map((s) => `${s.label.zhTW}=${s.value}`).join(' | ');
    expect(steps[0].value).toContain('50,000'); // annual
    expect(join).toContain('25,000'); // chargeable
    expect(steps.find((s) => s.label.zhTW.includes('費率'))!.value).toContain('NT$300'); // general rate
    expect(steps[steps.length - 1].value).toBe('NT$7,500,000'); // total
  });

  it('gating: 優惠B + leakage WITHOUT plan is shown at the general NT$300 rate (not NT$100)', () => {
    const p: CompanyProfile = {
      ...emptyProfile(),
      facilities: [{ ...emptyProfile().facilities[0], rateType: 'preferB', highCarbonLeakage: true, hasApprovedReductionPlan: false }],
    };
    const { facility, result } = computeWorkbench(p).domestic.facilities[0];
    const { steps, gated } = feeBreakdown(facility, p, result);
    expect(gated).toBe(true);
    const rateStep = steps.find((s) => s.label.zhTW.includes('費率'))!;
    expect(rateStep.value).toContain('NT$300'); // forced general — NOT the NT$100 they picked
    expect(rateStep.value).not.toContain('100'); // the picked pref-B rate is withheld
  });
});
