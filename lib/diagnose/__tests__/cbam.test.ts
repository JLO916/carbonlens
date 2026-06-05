import { diagnoseCbam } from '@/lib/diagnose/logic/cbam';
import { computeBaselineFromStaging } from '@/lib/diagnose/cbam-live-store';
import { runAnomalyChecks, promoteIfPassed } from '@/lib/diagnose/logic/cbam-sync';
import { CBAM_LIVE_CACHE } from '@/lib/diagnose/data/cbam-cache';
import { classifyLead } from '@/lib/diagnose/logic/lead-routing';
import type { CbamInput, CbamDefaultValue } from '@/lib/diagnose/types';

const base = (over: Partial<CbamInput>): CbamInput => ({
  exportsToEU: true,
  product: 'steel',
  originCountry: 'tw',
  annualVolumeTonnes: 5000,
  year: 2026,
  emissionsSource: 'actual',
  actualSpecificEmissions: 2.1,
  etsPrice: 80,
  ...over,
});

describe('diagnoseCbam — actual-data conditional exposure (Brief §3B)', () => {
  it('exposure = volume × specific × ETS, no mark-up on the actual path', () => {
    const r = diagnoseCbam(base({}));
    expect(r.exposure.totalEmissions).toBe(5000 * 2.1);
    expect(r.exposure.markupApplied).toBe(0);
    expect(r.exposure.indicativeExposureEUR).toBe(5000 * 2.1 * 80);
  });

  it('no ETS price → no exposure number (still no estimate)', () => {
    const r = diagnoseCbam(base({ etsPrice: undefined }));
    expect(r.exposure.indicativeExposureEUR).toBeUndefined();
  });
});

describe('diagnoseCbam — de minimis (Brief §6B)', () => {
  it('steel ≤50 t is exempt', () => {
    expect(diagnoseCbam(base({ annualVolumeTonnes: 50 })).exposure.deMinimisExempt).toBe(true);
  });
  it('steel >50 t is not exempt', () => {
    expect(diagnoseCbam(base({ annualVolumeTonnes: 51 })).exposure.deMinimisExempt).toBe(false);
  });
  it('hydrogen is never de-minimis exempt', () => {
    expect(diagnoseCbam(base({ product: 'hydrogen', annualVolumeTonnes: 10 })).exposure.deMinimisExempt).toBe(false);
  });
});

describe('diagnoseCbam — official-default path stays LOCKED (Brief §7.3)', () => {
  it('official_default → defaultsLocked, no number', () => {
    const r = diagnoseCbam(base({ emissionsSource: 'official_default' }));
    expect(r.exposure.defaultsLocked).toBe(true);
    expect(r.exposure.indicativeExposureEUR).toBeUndefined();
    expect(r.cacheStatus).toBe('locked');
  });
  it('the live cache ships empty/locked', () => {
    expect(CBAM_LIVE_CACHE.status).toBe('locked');
    expect(CBAM_LIVE_CACHE.defaultValues).toHaveLength(0);
  });
});

const dv = (cnCode: string, country: string, v: number): CbamDefaultValue => ({
  cnCode,
  country,
  product: 'steel',
  directDefaultTco2ePerT: v,
  source: 'IR 2025/2621',
  officialDocVersion: 'IR 2025/2621',
  asOfDate: '2026-06',
});

describe('runAnomalyChecks (Brief §7.2)', () => {
  const prev = [dv('7208', 'tw', 2.0), dv('7208', 'cn', 2.2), dv('7601', 'in', 8.0)];

  it('first baseline (no previous) needs human confirmation', () => {
    const res = runAnomalyChecks(prev, []);
    expect(res.passed).toBe(false);
    expect(res.needsHumanBaseline).toBe(true);
  });

  it('identical values pass', () => {
    expect(runAnomalyChecks(prev, prev).passed).toBe(true);
  });

  it('a single value moving >15% fails', () => {
    const incoming = [dv('7208', 'tw', 2.0), dv('7208', 'cn', 3.0), dv('7601', 'in', 8.0)]; // cn +36%
    const res = runAnomalyChecks(incoming, prev);
    expect(res.passed).toBe(false);
    expect(res.reasons.some((r) => r.startsWith('single'))).toBe(true);
  });

  it('row-count change >5% fails the structure check', () => {
    const incoming = [...prev, dv('7610', 'tr', 9.0)]; // +33% rows
    const res = runAnomalyChecks(incoming, prev);
    expect(res.passed).toBe(false);
    expect(res.reasons.some((r) => r.startsWith('structure'))).toBe(true);
  });
});

describe('promoteIfPassed (Brief §7.2)', () => {
  const prev = CBAM_LIVE_CACHE;
  const incoming = [dv('7208', 'tw', 2.0)];

  it('promotes to live when checks pass', () => {
    const { live, staged } = promoteIfPassed(incoming, [], prev, '2026-07-01', { passed: true, needsHumanBaseline: false, reasons: [] });
    expect(live.status).toBe('live');
    expect(live.defaultValues).toHaveLength(1);
    expect(live.meta.asOfDate).toBe('2026-07-01');
    expect(staged).toBeNull();
  });

  it('keeps previous + stages when checks fail', () => {
    const { live, staged } = promoteIfPassed(incoming, [], prev, '2026-07-01', { passed: false, needsHumanBaseline: true, reasons: ['x'] });
    expect(live).toBe(prev); // still serving the locked baseline
    expect(staged?.status).toBe('pending_human_baseline');
    expect(staged?.defaultValues).toHaveLength(1);
  });
});

describe('CBAM baseline + unlock (P2-11)', () => {
  it('computeBaselineFromStaging yields per-(country,product) medians with a valid spread', () => {
    const { baseline, count } = computeBaselineFromStaging();
    expect(count).toBeGreaterThan(20);
    const tw = baseline['tw|steel'];
    expect(tw).toBeDefined();
    expect(tw.m2026).toBeGreaterThan(0);
    expect(tw.min2026).toBeLessThanOrEqual(tw.m2026);
    expect(tw.max2026).toBeGreaterThanOrEqual(tw.m2026);
    expect(tw.m2028).toBeGreaterThanOrEqual(tw.m2026); // mark-up rises 2026→2028
  });

  it('diagnoseCbam unlocks exposure (+range) when a default lookup is supplied', () => {
    const r = diagnoseCbam(
      base({ emissionsSource: 'official_default', annualVolumeTonnes: 5000, etsPrice: 80, actualSpecificEmissions: undefined }),
      { value: 2.0, min: 1.5, max: 2.5, n: 10, asOf: '2026-02-04' },
    );
    expect(r.exposure.defaultsLocked).toBe(false);
    expect(r.exposure.fromOfficialDefault).toBe(true);
    expect(r.exposure.totalEmissions).toBe(10000);
    expect(r.exposure.indicativeExposureEUR).toBe(800000);
    expect(r.exposure.exposureMinEUR).toBe(600000);
    expect(r.exposure.exposureMaxEUR).toBe(1000000);
    expect(r.cacheStatus).toBe('live');
  });
});

describe('lead routing — CBAM EU-exporter signal (§4)', () => {
  it('EU exporter + corporate domain → enterprise', () => {
    expect(classifyLead({ euExporter: true, email: 'export@acme-steel.com' }).recommendedPool).toBe('enterprise');
  });
});
