import { emptyProfile, taiwanPeriodForYear } from '@/lib/workbench/profile';
import { toListedInput, toSupplyChainInput, toCbamInputs, toDomesticInput } from '@/lib/workbench/derive';
import { diagnoseListed } from '@/lib/diagnose/logic/listed';
import { diagnoseSupplyChain } from '@/lib/diagnose/logic/supply-chain';
import { diagnoseCbam } from '@/lib/diagnose/logic/cbam';
import { getCalculator } from '@/lib/calculators/domestic';

describe('workbench derive — one profile → the existing *Input shapes', () => {
  const p = emptyProfile();

  it('toListedInput carries the four ListedInput fields and runs through diagnoseListed', () => {
    const li = toListedInput(p);
    expect(li).toEqual({
      listingType: p.listingType,
      capitalTier: p.capitalTier,
      hasSustainabilityReport: p.hasSustainabilityReport,
      industry: p.industry,
    });
    expect(diagnoseListed(li).ifrs.phase).toBeGreaterThanOrEqual(1); // engine accepts it
  });

  it('toSupplyChainInput maps customerFrameworks → frameworks and runs through diagnoseSupplyChain', () => {
    const si = toSupplyChainInput(p);
    expect(si.frameworks).toBe(p.customerFrameworks);
    expect(si.businessModel).toBe(p.businessModel);
    expect(['low', 'medium', 'high']).toContain(diagnoseSupplyChain(si).pressureLevel);
  });

  it('toCbamInputs returns one CbamInput per product line, injecting shared year/ETS/pass-through', () => {
    const withTwo = { ...p, cbamProducts: [...p.cbamProducts, { ...p.cbamProducts[0], id: 'cbam-2', product: 'aluminum' as const }], etsPrice: 80, passThroughPct: 50 };
    const inputs = toCbamInputs(withTwo);
    expect(inputs).toHaveLength(2);
    expect(inputs.every((i) => i.year === withTwo.year && i.etsPrice === 80 && i.passThroughPct === 50 && i.exportsToEU === true)).toBe(true);
    expect(inputs[1].product).toBe('aluminum');
    // engine accepts each (locked official-default path, no lookup → defaultsLocked)
    expect(diagnoseCbam(inputs[0]).exposure.defaultsLocked).toBe(true);
  });

  it('toDomesticInput builds the taiwanCalculator countrySpecific (period derived from year)', () => {
    const di = toDomesticInput(p.facilities[0], { ...p, year: 2027 });
    expect(di.annualEmissions).toBe(p.facilities[0].annualEmissionsTonnes);
    expect(di.year).toBe(2027);
    expect(di.countrySpecific.period).toBe('period2_2027_2028');
    expect(di.countrySpecific.rateType).toBe('general');
  });

  it('taiwanPeriodForYear bands correctly', () => {
    expect(taiwanPeriodForYear(2026)).toBe('period1_2025_2026');
    expect(taiwanPeriodForYear(2028)).toBe('period2_2027_2028');
    expect(taiwanPeriodForYear(2030)).toBe('period3_2029_2030');
  });

  it('A1 gating: 優惠費率/leakage are withheld without an approved plan, kept with one', () => {
    const fac = { ...p.facilities[0], rateType: 'preferB' as const, highCarbonLeakage: true };
    const gated = toDomesticInput({ ...fac, hasApprovedReductionPlan: false }, p);
    expect(gated.countrySpecific.rateType).toBe('general'); // forced general
    expect(gated.countrySpecific.highCarbonLeakage).toBe(false); // CL withheld
    const ok = toDomesticInput({ ...fac, hasApprovedReductionPlan: true }, p);
    expect(ok.countrySpecific.rateType).toBe('preferB'); // honoured with plan
    expect(ok.countrySpecific.highCarbonLeakage).toBe(true);
  });

  it('P2c: a non-Taiwan facility runs its own country engine with that engine\'s default params', () => {
    const sg = { ...p.facilities[0], countryCode: 'sg' as const, annualEmissionsTonnes: 500_000, rateType: 'preferB' as const, highCarbonLeakage: true };
    const di = toDomesticInput(sg, p);
    expect(di.annualEmissions).toBe(500_000);
    // Taiwan-only knobs do NOT leak into a Singapore facility's countrySpecific
    expect(di.countrySpecific.rateType).toBeUndefined();
    expect(di.countrySpecific.period).toBeUndefined();
    // the Singapore engine produces a real (non-zero) carbon-tax cost from this input
    const sgResult = getCalculator('sg').calculate(di);
    expect(sgResult.totalCarbonCost).toBeGreaterThan(0);
    expect(sgResult.currency).toBe('SGD');
  });
});
