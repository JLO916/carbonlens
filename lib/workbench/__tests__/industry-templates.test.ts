import { industryTemplate, applyIndustryTemplate, INDUSTRY_TEMPLATES } from '@/lib/workbench/industry-templates';
import { FACTOR_BY_KEY } from '@/lib/workbench/emission-factors';
import type { ActivityLine } from '@/lib/workbench/inventory';

describe('S1 — industry emission-source templates', () => {
  it('every templated factorKey resolves to a real sourced factor (no fabricated keys)', () => {
    for (const entries of Object.values(INDUSTRY_TEMPLATES)) {
      for (const e of entries) expect(FACTOR_BY_KEY[e.factorKey]).toBeTruthy();
    }
  });

  it('electronics includes the semiconductor F-gases; food includes cold-chain refrigerant', () => {
    const elec = industryTemplate('electronics').map((e) => e.factorKey);
    expect(elec).toEqual(expect.arrayContaining(['electricity', 'nf3', 'cf4', 'sf6']));
    const food = industryTemplate('food').map((e) => e.factorKey);
    expect(food).toContain('refrigerant_r404a');
  });

  it('falls back to a generic starter for an unknown / blank industry', () => {
    const g = industryTemplate('unknown_industry').map((e) => e.factorKey);
    expect(g).toContain('electricity');
    expect(industryTemplate(undefined).length).toBeGreaterThan(0);
  });

  it('applyIndustryTemplate appends only the MISSING sources (amount 0), never duplicates or overwrites', () => {
    const existing: ActivityLine[] = [{ id: 'keep', factorKey: 'electricity', amount: 1_000_000 }];
    const merged = applyIndustryTemplate(existing, 'electronics');
    // electricity already present → not duplicated; the original (with its amount) is preserved
    expect(merged.filter((l) => l.factorKey === 'electricity').length).toBe(1);
    expect(merged.find((l) => l.id === 'keep')!.amount).toBe(1_000_000);
    // the new lines are seeded at amount 0 (user fills numbers)
    expect(merged.filter((l) => l.id !== 'keep').every((l) => l.amount === 0)).toBe(true);
    // includes the F-gases that weren't there before
    expect(merged.map((l) => l.factorKey)).toEqual(expect.arrayContaining(['nf3', 'cf4', 'sf6']));
  });

  it('applying twice is idempotent (no growth once the sources are present)', () => {
    const once = applyIndustryTemplate([], 'metals');
    const twice = applyIndustryTemplate(once, 'metals');
    expect(twice.length).toBe(once.length);
  });
});
