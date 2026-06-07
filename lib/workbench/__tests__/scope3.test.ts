import { computeScope3, scope3LineTonnes, footprintSummary, type Scope3Line } from '@/lib/workbench/scope3';
import { emptyProfile } from '@/lib/workbench/profile';

describe('Scope 3 engine (G3) — methods', () => {
  it('spend-based: spend × EEIO factor / 1000', () => {
    const l: Scope3Line = { id: 's', category: 1, label: 'GPU', method: 'spend', spend: 1_000_000, spendFactor: 0.5 };
    expect(scope3LineTonnes(l)).toBeCloseTo(500, 0); // 1,000,000 × 0.5 / 1000
  });

  it('use-phase (Cat 11): units × W × h/yr × yr × grid / 1e6 — the dominant category for servers', () => {
    const l: Scope3Line = { id: 'u', category: 11, label: 'server use', method: 'use_phase', units: 2000, watts: 800, hoursPerYear: 8760, lifetimeYears: 4, gridFactor: 0.4 };
    // 2000 × 800 × 8760 × 4 × 0.4 / 1e6 = 22,425.6 t (≈11.2 t per server over life)
    expect(scope3LineTonnes(l)).toBeCloseTo(22_425.6, 0);
  });

  it('supplier / manual: tonnes entered directly', () => {
    expect(scope3LineTonnes({ id: 'm', category: 1, label: '', method: 'supplier', tonnesDirect: 1234 })).toBe(1234);
    expect(scope3LineTonnes({ id: 'm', category: 1, label: '', method: 'manual', tonnesDirect: 7 })).toBe(7);
  });

  it('computeScope3 sums lines and carries lineage', () => {
    const r = computeScope3([
      { id: 'a', category: 1, label: 'parts', method: 'manual', tonnesDirect: 100 },
      { id: 'b', category: 11, label: 'use', method: 'manual', tonnesDirect: 900 },
    ]);
    expect(r.totalTonnes).toBe(1000);
    expect(r.lines[0].lineage.zhTW).toContain('100');
  });
});

describe('footprintSummary (G3) — surfaces Scope 3 dominance + per-unit PCF', () => {
  it('Scope 3 can dominate the whole footprint; PCF = total ÷ units', () => {
    const p = emptyProfile(); // one typed facility = 50,000 t (Scope 1+2)
    p.scope3 = [{ id: 's', category: 11, label: 'use of sold servers', method: 'manual', tonnesDirect: 950_000 }];
    p.annualUnitsSold = 2000;
    p.unitLabel = '台';
    const fp = footprintSummary(p);
    expect(fp.scope12).toBe(50_000);
    expect(fp.scope3).toBe(950_000);
    expect(fp.total).toBe(1_000_000);
    expect(fp.scope3Pct).toBe(95); // the 95% the carbon fee was blind to
    expect(fp.pcfPerUnit).toBeCloseTo(500_000, 0); // 1,000,000 t × 1000 / 2000 units = 500,000 kgCO₂e/台
  });

  it('no Scope 3 entered → scope3 0, no PCF without units', () => {
    const fp = footprintSummary(emptyProfile());
    expect(fp.scope3).toBe(0);
    expect(fp.pcfPerUnit).toBeUndefined();
  });
});
