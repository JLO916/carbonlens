import { buildQuestionnaire, questionnaireText } from '@/lib/workbench/questionnaire';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

function ready(): CompanyProfile {
  const p = emptyProfile();
  p.company = '範例公司';
  p.facilities = [{
    id: 'f', label: 'fab', countryCode: 'tw', annualEmissionsTonnes: 0, useInventory: true, renewablePct: 30,
    activities: [
      { id: 'e', factorKey: 'electricity', amount: 10_000_000 },
      { id: 'd', factorKey: 'diesel', amount: 50_000 },
    ],
    highCarbonLeakage: false, rateType: 'general', carbonCreditOffset: 0, hasApprovedReductionPlan: false,
  }];
  p.cbamProducts = [];
  p.scope3 = [
    { id: 's1', category: 1, label: 'mat', method: 'manual', tonnesDirect: 100000 },
    { id: 's11', category: 11, label: 'use', method: 'manual', tonnesDirect: 50000 },
  ];
  p.baseYear = 2024; p.baseYearEmissionsTonnes = 8000; p.targetYear = 2030; p.targetReductionPct = 42; p.targetScope = 'scope12';
  p.annualUnitsSold = 2000; p.unitLabel = '台';
  p.cycleStage = 'assured';
  return p;
}

describe('S2 — customer questionnaire answer pack', () => {
  it('maps the computed result into CDP / brand / SBTi sections', () => {
    const pack = buildQuestionnaire(ready());
    expect(pack.sections.map((s) => s.key)).toEqual(['cdp', 'brand', 'sbti']);
    const cdp = pack.sections[0];
    // Scope 1/2/3, target, verification, methodology are all answerable for a complete profile
    expect(cdp.items.every((i) => i.status === 'ready')).toBe(true);
    // Scope 2 answer carries BOTH location and market-based figures
    expect(cdp.items.find((i) => /Scope 2/.test(i.question.en))!.value).toMatch(/loc.*mkt/);
  });

  it('flags missing data as gaps instead of inventing numbers', () => {
    const blank = emptyProfile();
    blank.facilities = []; blank.cbamProducts = []; blank.scope3 = [];
    blank.baseYear = undefined; blank.targetYear = undefined; blank.targetReductionPct = undefined;
    const pack = buildQuestionnaire(blank);
    expect(pack.readyCount).toBeLessThan(pack.totalCount);
    // Scope 1 with no inventory → missing, value is the em-dash, NOT a fabricated 0
    const s1 = pack.sections[0].items.find((i) => /Scope 1/.test(i.question.en))!;
    expect(s1.status).toBe('missing');
    expect(s1.value).toBe('—');
    expect(pack.gaps.length).toBeGreaterThan(0);
  });

  it('a non-SBTi-aligned target reads as partial (not ready)', () => {
    const p = ready();
    p.targetReductionPct = 12; // 12%/6yr = 2%/yr < 4.2 → not SBTi-aligned
    const pack = buildQuestionnaire(p);
    const target = pack.sections[0].items.find((i) => /target/i.test(i.question.en))!;
    expect(target.status).toBe('partial');
    expect(pack.gaps.some((g) => /SBTi/.test(g.gap.en))).toBe(true);
  });

  it('text export is paste-ready and de-dups gaps; never fabricates missing values', () => {
    const txt = questionnaireText(ready(), 'zhTW');
    expect(txt).toContain('客戶問卷回覆包');
    expect(txt).toContain('範例公司');
    expect(txt).toMatch(/✅/);
    // gaps section only appears when there are gaps; the complete profile has none → no "還差這些"
    expect(txt).not.toContain('還差這些');
  });
});
