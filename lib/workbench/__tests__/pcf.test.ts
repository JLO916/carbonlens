import { productFootprints, pcfDeclarationText } from '@/lib/workbench/pcf';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';

// Footprint we can predict: one typed facility = 50,000 t Scope 1+2 (emptyProfile default), no Scope 3.
function withProducts(): CompanyProfile {
  const p = emptyProfile();
  p.scope3 = []; // total = scope12 = 50,000
  p.pcfBoundary = 'scope12';
  p.products = [
    { id: 'a', name: 'A', annualUnits: 1000 },
    { id: 'b', name: 'B', annualUnits: 3000 },
  ];
  return p;
}

describe('S3 — per-SKU product carbon footprint (screening allocation)', () => {
  it('returns null when there are no products', () => {
    expect(productFootprints(emptyProfile())).toBeNull();
  });

  it('allocates the org footprint by units (equal basis): per-unit kgCO₂e is uniform', () => {
    const res = productFootprints(withProducts())!;
    expect(res.footprintTonnes).toBe(50000);
    // A is 1000/4000 = 25% → 12,500 t; B is 75% → 37,500 t
    expect(res.products[0].sharePct).toBe(25);
    expect(res.products[0].allocatedTonnes).toBe(12500);
    expect(res.products[1].allocatedTonnes).toBe(37500);
    // equal basis → same kg/unit for both: 12,500,000 kg / 1000 = 12,500
    expect(res.products[0].pcfPerUnit).toBeCloseTo(12500, 0);
    expect(res.products[1].pcfPerUnit).toBeCloseTo(12500, 0);
  });

  it('mass basis differentiates per-unit PCF by weight', () => {
    const p = withProducts();
    p.pcfBasis = 'mass';
    p.products = [
      { id: 'a', name: 'A', annualUnits: 1000, weightPerUnit: 10 }, // weight 10,000
      { id: 'b', name: 'B', annualUnits: 1000, weightPerUnit: 30 }, // weight 30,000
    ];
    const res = productFootprints(p)!;
    // shares 25% / 75% → 12,500 / 37,500 t; per-unit differs (heavier product carries more)
    expect(res.products[0].allocatedTonnes).toBe(12500);
    expect(res.products[1].allocatedTonnes).toBe(37500);
    expect(res.products[1].pcfPerUnit! / res.products[0].pcfPerUnit!).toBeCloseTo(3, 1);
  });

  it('boundary toggle includes/excludes Scope 3', () => {
    const p = withProducts();
    p.scope3 = [{ id: 's', category: 1, label: 'mat', method: 'manual', tonnesDirect: 150000 }]; // total 200,000
    expect(productFootprints({ ...p, pcfBoundary: 'scope12' })!.footprintTonnes).toBe(50000);
    expect(productFootprints({ ...p, pcfBoundary: 'total' })!.footprintTonnes).toBe(200000);
  });

  it('declaration text states the boundary, basis and the screening (non-LCA) disclaimer', () => {
    const txt = pcfDeclarationText(withProducts(), 'zhTW');
    expect(txt).toContain('產品碳足跡');
    expect(txt).toMatch(/篩選級|ISO 14067/);
    expect(txt).toContain('非經第三方查證');
    expect(txt).toContain('kgCO₂e');
  });
});
