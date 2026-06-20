import { targetTrajectory, allTargetTrajectories, SBTI_NEARTERM_ANNUAL_PCT } from '@/lib/workbench/target';
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

describe('E1 — multiple targets (a set of SBTi commitments)', () => {
  it('returns the primary (legacy fields) plus each extra target, each on its OWN boundary', () => {
    const p = targeted(); // primary: Scope 1+2, base 60k, −30% by 2030; actual S1+2 = 50,000
    p.scope3 = [{ id: 's', category: 1, label: 'materials', method: 'manual', tonnesDirect: 200000 }];
    p.extraTargets = [
      { id: 't-s3', label: '近期 Scope 3', scope: 'scope3', baseYear: 2024, baseEmissionsTonnes: 250000, targetYear: 2030, targetReductionPct: 25 },
      { id: 't-nz', label: '2050 淨零', scope: 'scope123', baseYear: 2024, baseEmissionsTonnes: 260000, targetYear: 2050, targetReductionPct: 90 },
    ];
    const all = allTargetTrajectories(p);
    expect(all.length).toBe(3);
    // primary first, on Scope 1+2
    expect(all[0].id).toBe('primary');
    expect(all[0].scope).toBe('scope12');
    expect(all[0].actual).toBe(50000);
    // Scope 3 target → actual is the Scope 3 slice, not the whole footprint
    const s3 = all.find((t) => t.id === 't-s3')!;
    expect(s3.scope).toBe('scope3');
    expect(s3.actual).toBe(200000);
    expect(s3.label).toBe('近期 Scope 3');
    // net-zero (scope123) → actual is the whole footprint = 50,000 + 200,000
    const nz = all.find((t) => t.id === 't-nz')!;
    expect(nz.actual).toBe(250000);
    expect(nz.targetEmissions).toBe(26000); // 260,000 × (1 − 0.90)
  });

  it('skips an incoherent extra target without dropping the coherent ones', () => {
    const p = targeted();
    p.extraTargets = [
      { id: 'bad', scope: 'scope3', baseYear: 2030, targetYear: 2024, targetReductionPct: 25 }, // target before base
      { id: 'ok', scope: 'scope3', baseYear: 2024, baseEmissionsTonnes: 100000, targetYear: 2030, targetReductionPct: 25 },
    ];
    expect(allTargetTrajectories(p).map((t) => t.id).sort()).toEqual(['ok', 'primary']);
  });

  it('returns the extras even when the primary (legacy fields) is blank', () => {
    const p = emptyProfile();
    p.extraTargets = [{ id: 'x', scope: 'scope12', baseYear: 2024, baseEmissionsTonnes: 50000, targetYear: 2030, targetReductionPct: 42 }];
    const all = allTargetTrajectories(p);
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('x');
    expect(all[0].sbtiAligned).toBe(true); // 42%/6yr = 7%/yr ≥ 4.2
  });

  it('R4 #2 — a typo year like 2000050 is clamped to 2100, never a multi-million-point series', () => {
    const p = targeted();
    p.extraTargets = [{ id: 'typo', scope: 'scope12', baseYear: 2024, baseEmissionsTonnes: 34000, targetYear: 2000050, targetReductionPct: 90 }];
    const all = allTargetTrajectories(p);
    const typo = all.find((t) => t.id === 'typo')!;
    expect(typo).toBeDefined();
    expect(typo.targetYear).toBe(2100);
    expect(typo.series.length).toBe(2100 - 2024 + 1); // 77 points, bounded
    expect(typo.series[typo.series.length - 1].year).toBe(2100);
  });
});

describe('R4 #8 — SBTi check depends on scope and term', () => {
  it('near-term Scope 3 is judged at 2.5%/yr (not the 4.2% Scope 1+2 rate)', () => {
    const p = emptyProfile();
    // 16%/6yr = 2.67%/yr → aligned for Scope 3 (≥2.5), but would FAIL the old 4.2 rule
    p.extraTargets = [{ id: 's3', scope: 'scope3', baseYear: 2024, baseEmissionsTonnes: 100000, targetYear: 2030, targetReductionPct: 16 }];
    const tr = allTargetTrajectories(p).find((t) => t.id === 's3')!;
    expect(tr.sbtiKind).toBe('rate');
    expect(tr.sbtiBasisPct).toBe(2.5);
    expect(tr.sbtiAligned).toBe(true);
  });

  it('a −90% by 2050 net-zero target is aligned (depth criterion, not the 4.2%/yr near-term rate)', () => {
    const p = emptyProfile();
    p.extraTargets = [{ id: 'nz', scope: 'scope123', baseYear: 2024, baseEmissionsTonnes: 140000, targetYear: 2050, targetReductionPct: 90 }];
    const tr = allTargetTrajectories(p).find((t) => t.id === 'nz')!;
    expect(tr.sbtiTerm).toBe('long');
    expect(tr.sbtiKind).toBe('netzero');
    expect(tr.sbtiBasisPct).toBe(90);
    expect(tr.sbtiAligned).toBe(true); // 3.46%/yr would FAIL a near-term rate check, but it IS net-zero
  });

  it('a shallow long-term target (−50% by 2050) is NOT net-zero aligned', () => {
    const p = emptyProfile();
    p.extraTargets = [{ id: 'weak', scope: 'scope123', baseYear: 2024, baseEmissionsTonnes: 140000, targetYear: 2050, targetReductionPct: 50 }];
    const tr = allTargetTrajectories(p).find((t) => t.id === 'weak')!;
    expect(tr.sbtiKind).toBe('netzero');
    expect(tr.sbtiAligned).toBe(false); // 50% < 90%
  });

  it('near-term Scope 1+2 still uses 4.2%/yr', () => {
    const p = emptyProfile();
    p.extraTargets = [{ id: 's12', scope: 'scope12', baseYear: 2024, baseEmissionsTonnes: 50000, targetYear: 2030, targetReductionPct: 30 }];
    const tr = allTargetTrajectories(p).find((t) => t.id === 's12')!;
    expect(tr.sbtiBasisPct).toBe(4.2);
    expect(tr.sbtiAligned).toBe(true); // 30/6 = 5%/yr ≥ 4.2
  });
});
