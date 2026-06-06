import { computeInventory, facilityEmissionsTonnes, type ActivityLine } from '@/lib/workbench/inventory';
import { emptyProfile } from '@/lib/workbench/profile';

const ELEC: ActivityLine = { id: 'e', factorKey: 'electricity', amount: 1_200_000 }; // kWh
const DIESEL: ActivityLine = { id: 'd', factorKey: 'diesel', amount: 5_000 }; // L

describe('computeInventory — activity data → emissions with lineage', () => {
  it('electricity 1.2M kWh × 0.474 = 568.8 t (Scope 2); diesel 5,000 L × 2.6063 ≈ 13.03 t (Scope 1)', () => {
    const r = computeInventory([ELEC, DIESEL]);
    expect(r.scope2Tonnes).toBeCloseTo(568.8, 2);
    expect(r.scope1Tonnes).toBeCloseTo(13.032, 2);
    expect(r.totalTonnes).toBeCloseTo(581.83, 1);
  });

  it('each line carries traceable lineage (factor + source + effective factor)', () => {
    const r = computeInventory([ELEC]);
    const l = r.lines[0];
    expect(l.factor?.key).toBe('electricity');
    expect(l.effectiveFactor).toBe(0.474);
    expect(l.scope).toBe(2);
    expect(l.isOverride).toBe(false);
    expect(l.factor?.source.zhTW).toContain('能源署');
  });

  it('a custom factor overrides the default and is flagged', () => {
    const r = computeInventory([{ id: 'x', factorKey: 'electricity', amount: 1000, customFactor: 0.5 }]);
    expect(r.lines[0].isOverride).toBe(true);
    expect(r.lines[0].effectiveFactor).toBe(0.5);
    expect(r.lines[0].tonnes).toBeCloseTo(0.5, 3); // 1000 × 0.5 / 1000
  });

  it('facilityEmissionsTonnes uses the built inventory when present, else the typed total', () => {
    const f = emptyProfile().facilities[0];
    expect(facilityEmissionsTonnes(f)).toBe(50000); // typed default
    const withInv = { ...f, useInventory: true, activities: [ELEC, DIESEL] };
    expect(facilityEmissionsTonnes(withInv)).toBeCloseTo(581.83, 1); // from activity data
    // a useInventory facility with no lines falls back to the typed total
    expect(facilityEmissionsTonnes({ ...f, useInventory: true, activities: [] })).toBe(50000);
  });
});
