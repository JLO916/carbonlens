import { targetTrajectory, SBTI_NEARTERM_ANNUAL_PCT } from '@/lib/workbench/target';
import { emptyProfile } from '@/lib/workbench/profile';

function targeted() {
  const p = emptyProfile(); // one typed facility = 50,000 t (the "actual" footprint)
  p.baseYear = 2024;
  p.targetYear = 2030;
  p.targetReductionPct = 30;
  p.baseYearEmissionsTonnes = 60000;
  p.year = 2026;
  return p;
}

describe('C1 — target trajectory (managed target)', () => {
  it('returns null until base year + target year + target % are all set', () => {
    expect(targetTrajectory(emptyProfile())).toBeNull();
  });

  it('builds the linear pathway, this-year allowance, gap and on-track status', () => {
    const tr = targetTrajectory(targeted())!;
    expect(tr.targetEmissions).toBe(42000); // 60,000 × (1 − 0.30)
    // linear: 2026 allowance = 60,000 − (60,000−42,000)×(2/6) = 54,000
    expect(tr.thisYearTarget).toBe(54000);
    expect(tr.actual).toBe(50000); // current footprint
    expect(tr.gap).toBe(-4000); // 50,000 − 54,000 → ahead of the line
    expect(tr.onTrack).toBe(true);
    // series spans base→target inclusive
    expect(tr.series[0]).toEqual({ year: 2024, target: 60000 });
    expect(tr.series[tr.series.length - 1]).toEqual({ year: 2030, target: 42000 });
  });

  it('flags SBTi 1.5°C alignment by implied annual %', () => {
    const aligned = targetTrajectory(targeted())!; // 30%/6yr = 5%/yr ≥ 4.2
    expect(aligned.impliedAnnualPct).toBe(5);
    expect(aligned.sbtiAligned).toBe(true);
    const weak = targetTrajectory({ ...targeted(), targetReductionPct: 20 })!; // 20%/6 = 3.33%/yr
    expect(weak.sbtiAligned).toBe(false);
    expect(SBTI_NEARTERM_ANNUAL_PCT).toBe(4.2);
  });

  it('uses current footprint as base when base-year emissions are blank (flagged)', () => {
    const p = targeted();
    p.baseYearEmissionsTonnes = undefined;
    const tr = targetTrajectory(p)!;
    expect(tr.baseAssumed).toBe(true);
    expect(tr.baseEmissions).toBe(50000); // = current Scope 1+2 (default scope12)
  });

  it('D1: actual is measured on the TARGET SCOPE — base (Scope 1+2) vs whole footprint is apples-to-oranges', () => {
    const p = targeted(); // typed facility = 50,000 t Scope 1+2
    p.scope3 = [{ id: 's', category: 11, label: 'use', method: 'manual', tonnesDirect: 100000 }]; // total footprint = 150,000
    // default scope12 → actual is Scope 1+2 only (50,000), NOT the 150,000 whole footprint
    const s12 = targetTrajectory(p)!;
    expect(s12.scope).toBe('scope12');
    expect(s12.actual).toBe(50000);
    // explicit scope123 → actual is the whole footprint
    const s123 = targetTrajectory({ ...p, targetScope: 'scope123' })!;
    expect(s123.scope).toBe('scope123');
    expect(s123.actual).toBe(150000);
  });
});
