import { EMISSION_FACTORS, FACTOR_BY_KEY, FACTOR_CATEGORY_LABEL, GRID_FACTORS, gridFactorFor } from '@/lib/workbench/emission-factors';
import { computeInventory } from '@/lib/workbench/inventory';

describe('emission-factor library (P1a depth) — sourced & overridable', () => {
  it('covers electricity + steam + fuels + fugitive + process (≥17 sources)', () => {
    expect(EMISSION_FACTORS.length).toBeGreaterThanOrEqual(17);
    const cats = new Set(EMISSION_FACTORS.map((f) => f.category));
    expect(cats).toEqual(new Set(['electricity', 'steam', 'fuel', 'fugitive', 'fgas', 'process']));
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

describe('G1 — country grid factors (Scope 2 electricity)', () => {
  it('covers all 6 priced countries; each value cites its national source', () => {
    for (const cc of ['tw', 'vn', 'th', 'sg', 'kr', 'jp'] as const) {
      expect(GRID_FACTORS[cc].kgco2ePerUnit).toBeGreaterThan(0);
      expect(GRID_FACTORS[cc].source.zhTW).toBeTruthy();
    }
  });
  it('Vietnam (0.6592) is materially higher than Taiwan (0.474) — the understatement we fixed', () => {
    expect(GRID_FACTORS.vn.kgco2ePerUnit).toBe(0.6592);
    expect(GRID_FACTORS.tw.kgco2ePerUnit).toBe(0.474);
    expect(GRID_FACTORS.vn.kgco2ePerUnit / GRID_FACTORS.tw.kgco2ePerUnit).toBeGreaterThan(1.35); // ~39% higher
  });
  it('gridFactorFor falls back to Taiwan for unknown/undefined', () => {
    expect(gridFactorFor('vn').kgco2ePerUnit).toBe(0.6592);
    expect(gridFactorFor(undefined).kgco2ePerUnit).toBe(0.474);
  });
});

describe('E3 — process calcination factors (sourced IPCC Tier-1 / stoichiometric)', () => {
  it('cement clinker / lime / limestone carry sourced Scope-1 process defaults (overridable, not user-supplied)', () => {
    expect(FACTOR_BY_KEY.process_cement_clinker.kgco2ePerUnit).toBe(520); // 0.52 tCO₂/t clinker
    expect(FACTOR_BY_KEY.process_lime.kgco2ePerUnit).toBe(750); // 0.75 tCO₂/t lime
    expect(FACTOR_BY_KEY.process_limestone.kgco2ePerUnit).toBe(440); // 0.440 tCO₂/t CaCO₃
    for (const k of ['process_cement_clinker', 'process_lime', 'process_limestone']) {
      expect(FACTOR_BY_KEY[k].scope).toBe(1);
      expect(FACTOR_BY_KEY[k].category).toBe('process');
      expect(FACTOR_BY_KEY[k].userSupplied).toBeFalsy(); // has a real sourced default
      expect(FACTOR_BY_KEY[k].source.zhTW).toMatch(/IPCC|化學計量/);
    }
  });

  it('computeInventory: 10,000 t clinker × 0.52 = 5,200 t process CO₂ (Scope 1, not combustion)', () => {
    const r = computeInventory([{ id: 'cl', factorKey: 'process_cement_clinker', amount: 10000 }]);
    expect(r.lines[0].scope).toBe(1);
    expect(r.lines[0].tonnes).toBeCloseTo(5200, 0);
    expect(r.scope1Tonnes).toBeCloseTo(5200, 0);
  });

  it('process_other stays a user-supplied placeholder (no fabricated default)', () => {
    expect(FACTOR_BY_KEY.process_other.userSupplied).toBe(true);
    expect(FACTOR_BY_KEY.process_other.kgco2ePerUnit).toBe(0);
  });
});

describe('F1 — fluorinated process gases (semiconductor/TFT/PV), IPCC AR5 GWP', () => {
  it('NF₃/CF₄/C₂F₆/C₃F₈/CHF₃/c-C₄F₈ carry their AR5 GWP as the factor (Scope 1, fgas)', () => {
    const gwp: Record<string, number> = { nf3: 16100, cf4: 6630, c2f6: 11100, c3f8: 8900, chf3: 12400, c4f8: 9540 };
    for (const [k, v] of Object.entries(gwp)) {
      expect(FACTOR_BY_KEY[k].kgco2ePerUnit).toBe(v);
      expect(FACTOR_BY_KEY[k].scope).toBe(1);
      expect(FACTOR_BY_KEY[k].category).toBe('fgas');
      expect(FACTOR_BY_KEY[k].source.zhTW).toMatch(/AR5/);
    }
  });

  it('SF₆ is grouped under the F-gas category alongside the PFCs/NF₃', () => {
    expect(FACTOR_BY_KEY.sf6.category).toBe('fgas');
    expect(FACTOR_BY_KEY.sf6.kgco2ePerUnit).toBe(23500);
  });

  it('computeInventory: 2,000 kg NF₃ × 16,100 = 32,200 t (Scope 1) — a fab’s real F-gas load', () => {
    const r = computeInventory([{ id: 'g', factorKey: 'nf3', amount: 2000 }]);
    expect(r.lines[0].scope).toBe(1);
    expect(r.lines[0].tonnes).toBeCloseTo(32200, 0);
    expect(r.scope1Tonnes).toBeCloseTo(32200, 0);
  });
});
