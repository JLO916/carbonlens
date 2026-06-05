import { diagnoseListed } from '@/lib/diagnose/logic/listed';
import { classifyLead, emailDomain } from '@/lib/diagnose/logic/lead-routing';
import { URGENCY_WEIGHTS } from '@/lib/diagnose/data/urgency-config';
import type { ListedInput } from '@/lib/diagnose/types';

// Fixed "today" so deadline-proximity is deterministic. Matches Brief data date 2026/6.
const TODAY = new Date('2026-06-05T00:00:00Z');

const base = (over: Partial<ListedInput>): ListedInput => ({
  listingType: 'listed',
  capitalTier: 'over100',
  hasSustainabilityReport: false,
  industry: 'manufacturing',
  ...over,
});

describe('diagnoseListed — IFRS phase mapping (Brief §6A-2)', () => {
  it('over100 → phase 1, file 2027 (day-precise 2027-03-16)', () => {
    const r = diagnoseListed(base({ capitalTier: 'over100' }), TODAY);
    expect(r.ifrs.phase).toBe(1);
    expect(r.ifrs.fileYear).toBe(2027);
    expect(r.ifrs.fileDeadlineISO).toBe('2027-03-16');
  });

  it('from50to100 → phase 2, file 2028 (year-precise)', () => {
    const r = diagnoseListed(base({ capitalTier: 'from50to100' }), TODAY);
    expect(r.ifrs.phase).toBe(2);
    expect(r.ifrs.fileYear).toBe(2028);
    expect(r.ifrs.fileDeadlineISO).toBeUndefined();
  });

  it('under50 → phase 3, file 2029', () => {
    const r = diagnoseListed(base({ capitalTier: 'under50', listingType: 'otc' }), TODAY);
    expect(r.ifrs.phase).toBe(3);
    expect(r.ifrs.fileYear).toBe(2029);
  });
});

describe('GRI universal obligation (Brief §6A-1) — applies to every tier', () => {
  it('applies even for the smallest tier', () => {
    const r = diagnoseListed(base({ capitalTier: 'under50' }), TODAY);
    expect(r.gri.applies).toBe(true);
    expect(r.gri.effectiveFrom).toBe(2025);
  });
});

describe('urgency score (Brief §4)', () => {
  it('weights are the fixed 40/35/25 and sum to 1', () => {
    expect(URGENCY_WEIGHTS.deadline).toBe(0.4);
    expect(URGENCY_WEIGHTS.exposure).toBe(0.35);
    expect(URGENCY_WEIGHTS.scale).toBe(0.25);
    const r = diagnoseListed(base({}), TODAY);
    const w = r.urgency.components.reduce((s, c) => s + c.weight, 0);
    expect(w).toBeCloseTo(1, 6);
  });

  it('total stays within 0–100', () => {
    for (const tier of ['over100', 'from50to100', 'under50'] as const) {
      const r = diagnoseListed(base({ capitalTier: tier }), TODAY);
      expect(r.urgency.total).toBeGreaterThanOrEqual(0);
      expect(r.urgency.total).toBeLessThanOrEqual(100);
    }
  });

  it('phase-1 no-report scores higher than phase-3 with report (same day)', () => {
    const hi = diagnoseListed(base({ capitalTier: 'over100', hasSustainabilityReport: false }), TODAY);
    const lo = diagnoseListed(base({ capitalTier: 'under50', hasSustainabilityReport: true }), TODAY);
    expect(hi.urgency.total).toBeGreaterThan(lo.urgency.total);
  });
});

describe('lead routing (Brief §4)', () => {
  it('extracts the email domain', () => {
    expect(emailDomain('Cfo@Acme-Steel.com')).toBe('acme-steel.com');
    expect(emailDomain('not-an-email')).toBeNull();
  });

  it('free domain + individual role → individual pool', () => {
    expect(classifyLead({ email: 'me@gmail.com', role: 'consultant' }).recommendedPool).toBe('individual');
  });

  it('corporate domain + executive role + large tier → enterprise pool', () => {
    expect(
      classifyLead({ email: 'cfo@acme-steel.com', role: 'executive', capitalTier: 'over100' }).recommendedPool,
    ).toBe('enterprise');
  });
});
