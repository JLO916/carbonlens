import { diagnoseSupplyChain } from '@/lib/diagnose/logic/supply-chain';
import { classifyLead } from '@/lib/diagnose/logic/lead-routing';
import { materialScope3 } from '@/lib/diagnose/data/scope3-categories';
import type { SupplyChainInput } from '@/lib/diagnose/types';

const base = (over: Partial<SupplyChainInput>): SupplyChainInput => ({
  frameworks: ['sbti'],
  industry: 'electronics',
  businessModel: 'odm_oem',
  exportSupplyChain: false,
  employeeBand: 'from250to999',
  ...over,
});

describe('diagnoseSupplyChain — pressure level (qualitative, adjustable rubric)', () => {
  it('two frameworks → high', () => {
    expect(diagnoseSupplyChain(base({ frameworks: ['sbti', 'cdp'] })).pressureLevel).toBe('high');
  });
  it('one framework, no export → medium', () => {
    expect(diagnoseSupplyChain(base({ frameworks: ['sbti'], exportSupplyChain: false })).pressureLevel).toBe('medium');
  });
  it('one framework + export supply chain → high (bumped)', () => {
    expect(diagnoseSupplyChain(base({ frameworks: ['sbti'], exportSupplyChain: true })).pressureLevel).toBe('high');
  });
  it('only "unsure", no export → low, with guidance and no expectations', () => {
    const r = diagnoseSupplyChain(base({ frameworks: ['unsure'], exportSupplyChain: false }));
    expect(r.pressureLevel).toBe('low');
    expect(r.expectations).toHaveLength(0);
    expect(r.unsureNote).toBeDefined();
  });
  it('"unsure" + export → medium', () => {
    expect(diagnoseSupplyChain(base({ frameworks: ['unsure'], exportSupplyChain: true })).pressureLevel).toBe('medium');
  });
});

describe('diagnoseSupplyChain — expectations map to selected frameworks (§6C)', () => {
  it('includes an expectation for each concrete framework, ignoring "unsure"', () => {
    const r = diagnoseSupplyChain(base({ frameworks: ['re100', 'cdp', 'unsure'] }));
    const keys = r.expectations.map((e) => e.key).sort();
    expect(keys).toEqual(['cdp', 're100']);
  });
});

describe('diagnoseSupplyChain — sourced Scope 3 industry note', () => {
  it('finance gets the 98%+ note', () => {
    const r = diagnoseSupplyChain(base({ industry: 'finance' }));
    expect(r.scope3.industryNote?.zhTW).toContain('98%');
  });
  it('manufacturing/retail gets the Category-1 50%+ note', () => {
    const r = diagnoseSupplyChain(base({ industry: 'metals' }));
    expect(r.scope3.industryNote?.zhTW).toContain('50%');
  });
  it('general services has no specific industry note', () => {
    expect(diagnoseSupplyChain(base({ industry: 'services' })).scope3.industryNote).toBeUndefined();
  });
});

describe('diagnoseSupplyChain — CSRD value-chain cap (§6C)', () => {
  it('<1,000 employees are protected', () => {
    expect(diagnoseSupplyChain(base({ employeeBand: 'under250' })).csrdProtection.protected).toBe(true);
    expect(diagnoseSupplyChain(base({ employeeBand: 'from250to999' })).csrdProtection.protected).toBe(true);
  });
  it('≥1,000 employees are not protected', () => {
    expect(diagnoseSupplyChain(base({ employeeBand: 'over1000' })).csrdProtection.protected).toBe(false);
  });
});

describe('materialScope3 — business-model boundary (V2-⑥, GHG Protocol)', () => {
  it('brand keeps "use of sold products" (Cat 11)', () => {
    const nums = materialScope3('electronics', 'brand').map((c) => c.num);
    expect(nums).toContain(11);
  });
  it('ODM/OEM drops Cat 11 (it belongs to the brand) and keeps purchased+transport', () => {
    const nums = materialScope3('electronics', 'odm_oem').map((c) => c.num);
    expect(nums).not.toContain(11);
    expect(nums).toContain(1);
    expect(nums).toContain(4);
  });
  it('component supplier drops Cat 11 too', () => {
    expect(materialScope3('machinery', 'component').map((c) => c.num)).not.toContain(11);
  });
  it('no business model → industry default (Cat 11 retained for electronics)', () => {
    expect(materialScope3('electronics').map((c) => c.num)).toContain(11);
  });
});

describe('lead routing — supply-chain signals (§4)', () => {
  it('≥1,000 employees + export + corporate domain → enterprise', () => {
    expect(
      classifyLead({ employeeBand: 'over1000', exportSupplyChain: true, email: 'esg@acme-mfg.com' }).recommendedPool,
    ).toBe('enterprise');
  });
  it('consultant role + free email still routes to individual', () => {
    expect(classifyLead({ employeeBand: 'under250', role: 'consultant', email: 'me@gmail.com' }).recommendedPool).toBe('individual');
  });
});
