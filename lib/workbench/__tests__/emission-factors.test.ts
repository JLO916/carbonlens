import { EMISSION_FACTORS, FACTOR_BY_KEY, FACTOR_CATEGORY_LABEL } from '@/lib/workbench/emission-factors';
import { computeInventory } from '@/lib/workbench/inventory';

describe('emission-factor library (P1a depth) — sourced & overridable', () => {
  it('covers electricity + steam + fuels + fugitive + process (≥17 sources)', () => {
    expect(EMISSION_FACTORS.length).toBeGreaterThanOrEqual(17);
    const cats = new Set(EMISSION_FACTORS.map((f) => f.category));
    expect(cats).toEqual(new Set(['electricity', 'steam', 'fuel', 'fugitive', 'process']));
    // every category has a bilingual label
    for (const c of cats) expect(FACTOR_CATEGORY_LABEL[c].zhTW).toBeTruthy();
  });

  it('primary values are locked: electricity 0.474 (S2); LPG 3.1815; coal 2440 (S1)', () => {
    expect(FACTOR_BY_KEY.electricity.kgco2ePerUnit).toBe(0.474);
    expect(FACTOR_BY_KEY.electricity.scope).toBe(2);
    expect(FACTOR_BY_KEY.lpg.kgco2ePerUnit).toBe(3.1815);
    expect(FACTOR_BY_KEY.coal_bituminous.kgco2ePerUnit).toBe(2440);
  });

  it('refrigerant/SF₆ factors equal the IPCC AR5 GWP (Scope 1 fugitive)', () => {
    expect(FACTOR_BY_KEY.refrigerant_r134a.kgco2ePerUnit).toBe(1300);
    expect(FACTOR_BY_KEY.refrigerant_r410a.kgco2ePerUnit).toBe(1924); // 50/50 R-32(677)/R-125(3170)
    expect(FACTOR_BY_KEY.refrigerant_r404a.kgco2ePerUnit).toBe(3943);
    expect(FACTOR_BY_KEY.refrigerant_r32.kgco2ePerUnit).toBe(677);
    expect(FACTOR_BY_KEY.sf6.kgco2ePerUnit).toBe(23500);
    expect(FACTOR_BY_KEY.refrigerant_r410a.scope).toBe(1);
    expect(FACTOR_BY_KEY.refrigerant_r410a.category).toBe('fugitive');
  });

  it('steam/process/other-fuel are user-supplied placeholders (default 0, NOT fabricated)', () => {
    for (const k of ['steam_purchased', 'process_other', 'fuel_other']) {
      expect(FACTOR_BY_KEY[k].userSupplied).toBe(true);
      expect(FACTOR_BY_KEY[k].kgco2ePerUnit).toBe(0);
    }
    expect(FACTOR_BY_KEY.steam_purchased.scope).toBe(2); // purchased steam is Scope 2
  });

  it('computeInventory handles a fugitive refrigerant line: 100 kg R-410A × 1924 = 192.4 t (Scope 1)', () => {
    const r = computeInventory([{ id: 'rf', factorKey: 'refrigerant_r410a', amount: 100 }]);
    expect(r.lines[0].scope).toBe(1);
    expect(r.lines[0].tonnes).toBeCloseTo(192.4, 1);
    expect(r.scope1Tonnes).toBeCloseTo(192.4, 1);
  });
});
