import { renewableForTarget } from '@/lib/workbench/re100-target';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

// One inventory facility: 10M kWh elec → 4,740 t Scope 2 (location); 100k L diesel → 260.63 t Scope 1.
// scope12 actual = 5,000.63; the Scope-1 floor (not addressable by renewables) = 260.63.
function fab(renewablePct = 0): CompanyProfile {
  const p = emptyProfile();
  p.facilities = [{
    id: 'fab', label: 'fab', countryCode: 'tw', annualEmissionsTonnes: 0, useInventory: true, renewablePct,
    activities: [
      { id: 'e', factorKey: 'electricity', amount: 10_000_000 },
      { id: 'd', factorKey: 'diesel', amount: 100_000 },
    ],
    highCarbonLeakage: false, rateType: 'general', carbonCreditOffset: 0, hasApprovedReductionPlan: false,
  }];
  p.cbamProducts = [];
  p.scope3 = [];
  p.baseYear = 2024; p.targetYear = 2030; p.baseYearEmissionsTonnes = 6000; p.targetReductionPct = 40; // target = 3,600
  p.targetScope = 'scope12';
  return p;
}

describe('F3 — RE100 ↔ Scope 1+2 target reverse-solve', () => {
  it('reverse-solves the renewable % needed to hit the Scope 1+2 target by renewables alone', () => {
    const re = renewableForTarget(fab(0))!;
    expect(re.scope2LocationTonnes).toBeCloseTo(4740, 0);
    expect(re.floorTonnes).toBeCloseTo(260.63, 0); // = Scope 1 (not addressable by renewables)
    expect(re.targetEmissions).toBeCloseTo(3600, 0);
    // r = 1 − (3600 − 260.63)/4740 = 29.5%
    expect(re.neededRenewablePct).toBeCloseTo(29.5, 0);
    expect(re.currentRenewablePct).toBe(0);
    expect(re.achievableByRenewablesAlone).toBe(true);
    expect(re.alreadyMeets).toBe(false);
  });

  it('derives the current blended renewable share and flags when it already meets the target', () => {
    const re = renewableForTarget(fab(50))!; // 50% renewable now, needed only 29.5%
    expect(re.currentRenewablePct).toBeCloseTo(50, 0);
    expect(re.alreadyMeets).toBe(true);
  });

  it('flags when renewables alone cannot hit the target (a hard Scope-1 floor remains)', () => {
    const p = fab(0);
    p.targetReductionPct = 96; // target = 240 t < floor 260.63 → unreachable by renewables alone
    const re = renewableForTarget(p)!;
    expect(re.achievableByRenewablesAlone).toBe(false);
    expect(re.floorTonnes).toBeGreaterThan(re.targetEmissions);
    expect(re.neededRenewablePct).toBe(100); // clamped
  });

  it('returns null when the primary target is not Scope 1+2, or there is no addressable Scope 2', () => {
    expect(renewableForTarget({ ...fab(0), targetScope: 'scope123' })).toBeNull();
    // no inventory Scope 2 (typed facility only)
    const typed = emptyProfile();
    typed.baseYear = 2024; typed.targetYear = 2030; typed.targetReductionPct = 40;
    expect(renewableForTarget(typed)).toBeNull();
  });
});
