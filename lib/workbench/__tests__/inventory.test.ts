import { computeInventory, facilityEmissionsTonnes, facilityEmissionsStatus, type ActivityLine } from '@/lib/workbench/inventory';
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

  it('G1: electricity follows the facility country grid factor — Vietnam 0.6592, not Taiwan 0.474', () => {
    const elec1M: ActivityLine = { id: 'e', factorKey: 'electricity', amount: 1_000_000 };
    expect(computeInventory([elec1M], 'tw').totalTonnes).toBeCloseTo(474, 0); // 1M × 0.474
    expect(computeInventory([elec1M], 'vn').totalTonnes).toBeCloseTo(659.2, 1); // 1M × 0.6592 (VN grid)
    expect(computeInventory([elec1M], 'th').totalTonnes).toBeCloseTo(475, 0); // TGO 0.475
    expect(computeInventory([elec1M]).totalTonnes).toBeCloseTo(474, 0); // no country → default TW factor
    // the VN line's lineage shows the Vietnam source (auditable)
    expect(computeInventory([elec1M], 'vn').lines[0].factor?.source.zhTW).toContain('越南');
    // an explicit override still wins regardless of country
    const overridden: ActivityLine = { id: 'e', factorKey: 'electricity', amount: 1_000_000, customFactor: 0.5 };
    expect(computeInventory([overridden], 'vn').totalTonnes).toBeCloseTo(500, 0);
  });

  it('G1: facilityEmissionsTonnes for an overseas facility uses that country grid factor', () => {
    const f = emptyProfile().facilities[0];
    const vn = { ...f, countryCode: 'vn' as const, useInventory: true, activities: [{ id: 'e', factorKey: 'electricity', amount: 1_000_000 }] };
    expect(facilityEmissionsTonnes(vn)).toBeCloseTo(659.2, 1);
  });

  it('P0 trust fix: an inventory whose lines total 0 does NOT zero the fee — it falls back to the typed total', () => {
    const f = emptyProfile().facilities[0]; // typed 50,000
    // the trap: toggled to inventory mode, one seeded zero-amount line → total 0
    const trap = { ...f, useInventory: true, activities: [{ id: 'z', factorKey: 'electricity', amount: 0 }] };
    expect(computeInventory(trap.activities).totalTonnes).toBe(0);
    expect(facilityEmissionsTonnes(trap)).toBe(50000); // fee basis preserved, NOT 0
  });

  it('facilityEmissionsStatus flags inventory-incomplete and exposes the fallback basis', () => {
    const f = emptyProfile().facilities[0];
    // typed mode → not using inventory, not incomplete
    const typed = facilityEmissionsStatus(f);
    expect(typed.usingInventory).toBe(false);
    expect(typed.inventoryIncomplete).toBe(false);
    expect(typed.feeBasisTonnes).toBe(50000);
    // inventory mode, zero data → incomplete, fee falls back to typed 50,000, inventory total 0
    const incomplete = facilityEmissionsStatus({ ...f, useInventory: true, activities: [{ id: 'z', factorKey: 'electricity', amount: 0 }] });
    expect(incomplete.inventoryIncomplete).toBe(true);
    expect(incomplete.inventoryTotalTonnes).toBe(0);
    expect(incomplete.feeBasisTonnes).toBe(50000);
    expect(incomplete.typedTotalTonnes).toBe(50000);
    // inventory mode, real data → complete, fee uses the computed inventory
    const complete = facilityEmissionsStatus({ ...f, useInventory: true, activities: [ELEC, DIESEL] });
    expect(complete.inventoryIncomplete).toBe(false);
    expect(complete.inventoryTotalTonnes).toBeCloseTo(581.83, 1);
    expect(complete.feeBasisTonnes).toBeCloseTo(581.83, 1);
  });
});
