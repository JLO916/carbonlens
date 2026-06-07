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
    expect(tr.baseEmissions).toBe(50000); // = current footprint
  });
});
