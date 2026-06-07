import { cbamCrossDeduction, CBAM_DEDUCTION_CONFIDENCE } from '@/lib/workbench/cbam-deduction';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

function maker(): CompanyProfile {
  const p = emptyProfile();
  p.etsPrice = 80;
  p.facilities = [{ ...p.facilities[0], countryCode: 'tw', useInventory: false, annualEmissionsTonnes: 100000, highCarbonLeakage: false, rateType: 'general', hasApprovedReductionPlan: false }];
  p.cbamProducts = [
    { id: 's', label: '鋼件', product: 'steel', originCountry: 'tw', annualVolumeTonnes: 5000, emissionsSource: 'actual', actualSpecificEmissions: 2.0 },
    { id: 'v', label: '鋁件', product: 'aluminum', originCountry: 'vn', annualVolumeTonnes: 2000, emissionsSource: 'actual', actualSpecificEmissions: 3.0 },
  ];
  return p;
}

describe('D2 — carbon fee × CBAM cross-deduction (Reg 2023/956 §9)', () => {
  it('returns null without an ETS price (embedded tonnes can’t be derived)', () => {
    const p = maker(); p.etsPrice = undefined;
    expect(cbamCrossDeduction(p, computeWorkbench(p))).toBeNull();
  });

  it('nets the origin carbon price paid against each priced line, capped at the obligation', () => {
    const p = maker();
    const d = cbamCrossDeduction(p, computeWorkbench(p))!;
    const tw = d.lines.find((l) => l.originCountry === 'tw')!;
    const vn = d.lines.find((l) => l.originCountry === 'vn')!;

    // embedded emissions backed out from the gross exposure (5,000 t × 2.0 SEE = 10,000)
    expect(tw.embeddedTonnes).toBeCloseTo(10000, 0);
    // Taiwan pays a carbon price → a positive deductible, never exceeding the obligation, net ≥ 0
    expect(tw.originPriceEUR).toBeGreaterThan(0);
    expect(tw.deductibleEUR).toBeGreaterThan(0);
    expect(tw.deductibleEUR).toBeLessThanOrEqual(tw.obligationEUR);
    expect(tw.netEUR).toBe(Math.round((tw.obligationEUR - tw.deductibleEUR) * 100) / 100);
    expect(tw.netEUR).toBeGreaterThanOrEqual(0);
    expect(tw.confidence).toBe('medium'); // CLAUDE.md: Taiwan = medium

    // Vietnam has no formal carbon price → no deduction, net = gross, confidence none
    expect(vn.originPriceEUR).toBe(0);
    expect(vn.deductibleEUR).toBe(0);
    expect(vn.netEUR).toBe(vn.obligationEUR);
    expect(vn.confidence).toBe('none');
  });

  it('confidence table matches the recognition levels (SG/KR high, TW/JP medium, TH low, VN none)', () => {
    expect(CBAM_DEDUCTION_CONFIDENCE).toMatchObject({ sg: 'high', kr: 'high', tw: 'medium', jp: 'medium', th: 'low', vn: 'none' });
  });
});
