// G3 — Scope 3 quantification starter. For an AI-server ODM the footprint is ~90–99% Scope 3:
// Cat 1 (purchased components: CPU/GPU/DRAM/PCB embodied carbon) + Cat 11 (servers' multi-year
// datacenter electricity). The Scope 1+2 inventory can't touch it. DATA RED LINE: spend-based EEIO
// factors and use-phase grid factors have no single official value → user-supplied/overridable
// (defaults are clearly-labelled placeholders, not fabricated truth).

import { facilityEmissionsTonnes, computeInventory } from './inventory';
import type { CompanyProfile } from './profile';
import type { BilingualText } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 1000) / 1000;

export type Scope3Method = 'spend' | 'supplier' | 'use_phase' | 'manual';

/** One Scope 3 line. The active fields depend on `method`. */
export interface Scope3Line {
  id: string;
  category: number; // GHG Protocol Scope 3 category 1–15
  label: string;
  method: Scope3Method;
  // spend-based (Cat 1/2…): spend × EEIO factor (kgCO₂e per spend unit — user-supplied)
  spend?: number;
  spendFactor?: number;
  // supplier-specific / manual: tonnes entered directly
  tonnesDirect?: number;
  // use-phase (Cat 11): units × W × hours/yr × lifetime(yr) × grid factor (kgCO₂e/kWh at use site)
  units?: number;
  watts?: number;
  hoursPerYear?: number;
  lifetimeYears?: number;
  gridFactor?: number;
}

export interface Scope3LineResult {
  line: Scope3Line;
  tonnes: number;
  /** plain-language calculation trail for assurance/export */
  lineage: BilingualText;
}

export interface Scope3Result {
  lines: Scope3LineResult[];
  totalTonnes: number;
}

const n = (x: number | undefined) => Math.max(0, x ?? 0);

export function scope3LineTonnes(l: Scope3Line): number {
  switch (l.method) {
    case 'spend':
      return round((n(l.spend) * n(l.spendFactor)) / 1000);
    case 'use_phase':
      // units × W × h/yr × yr = Wh over life; /1000 → kWh; × gridFactor → kg; × ... ; /1000 → t
      return round((n(l.units) * n(l.watts) * n(l.hoursPerYear) * n(l.lifetimeYears) * n(l.gridFactor)) / 1_000_000);
    case 'supplier':
    case 'manual':
    default:
      return round(n(l.tonnesDirect));
  }
}

function lineageOf(l: Scope3Line, tonnes: number): BilingualText {
  switch (l.method) {
    case 'spend':
      return {
        zhTW: `支出 ${n(l.spend).toLocaleString('en-US')} × ${n(l.spendFactor)} kgCO₂e/單位 = ${tonnes.toLocaleString('en-US')} t（支出基礎,係數自填)`,
        en: `spend ${n(l.spend).toLocaleString('en-US')} × ${n(l.spendFactor)} kgCO₂e/unit = ${tonnes.toLocaleString('en-US')} t (spend-based, factor user-supplied)`,
      };
    case 'use_phase':
      return {
        zhTW: `${n(l.units).toLocaleString('en-US')} 台 × ${n(l.watts)} W × ${n(l.hoursPerYear).toLocaleString('en-US')} h/年 × ${n(l.lifetimeYears)} 年 × ${n(l.gridFactor)} kgCO₂e/kWh = ${tonnes.toLocaleString('en-US')} t（使用階段)`,
        en: `${n(l.units).toLocaleString('en-US')} units × ${n(l.watts)} W × ${n(l.hoursPerYear).toLocaleString('en-US')} h/yr × ${n(l.lifetimeYears)} yr × ${n(l.gridFactor)} kgCO₂e/kWh = ${tonnes.toLocaleString('en-US')} t (use-phase)`,
      };
    default:
      return {
        zhTW: `${tonnes.toLocaleString('en-US')} t（${l.method === 'supplier' ? '供應商實際' : '手動輸入'})`,
        en: `${tonnes.toLocaleString('en-US')} t (${l.method === 'supplier' ? 'supplier-specific' : 'manual'})`,
      };
  }
}

export function computeScope3(lines: Scope3Line[]): Scope3Result {
  const results = lines.map((line) => {
    const tonnes = scope3LineTonnes(line);
    return { line, tonnes, lineage: lineageOf(line, tonnes) };
  });
  return { lines: results, totalTonnes: round(results.reduce((a, r) => a + r.tonnes, 0)) };
}

/** All 15 GHG Protocol Scope 3 categories (the most material for server ODM are 1 and 11). */
export const SCOPE3_CATEGORIES: { value: number; label: BilingualText }[] = [
  { value: 1, label: { zhTW: '類別1 採購商品與服務', en: 'Cat 1 Purchased goods & services' } },
  { value: 2, label: { zhTW: '類別2 資本財', en: 'Cat 2 Capital goods' } },
  { value: 3, label: { zhTW: '類別3 燃料與能源(非Scope1/2)', en: 'Cat 3 Fuel & energy (non-1/2)' } },
  { value: 4, label: { zhTW: '類別4 上游運輸配送', en: 'Cat 4 Upstream transport' } },
  { value: 5, label: { zhTW: '類別5 營運廢棄物', en: 'Cat 5 Waste in operations' } },
  { value: 6, label: { zhTW: '類別6 商務差旅', en: 'Cat 6 Business travel' } },
  { value: 7, label: { zhTW: '類別7 員工通勤', en: 'Cat 7 Employee commuting' } },
  { value: 8, label: { zhTW: '類別8 上游租賃資產', en: 'Cat 8 Upstream leased assets' } },
  { value: 9, label: { zhTW: '類別9 下游運輸配送', en: 'Cat 9 Downstream transport' } },
  { value: 10, label: { zhTW: '類別10 售出產品加工', en: 'Cat 10 Processing of sold products' } },
  { value: 11, label: { zhTW: '類別11 售出產品使用', en: 'Cat 11 Use of sold products' } },
  { value: 12, label: { zhTW: '類別12 售出產品最終處置', en: 'Cat 12 End-of-life of sold products' } },
  { value: 13, label: { zhTW: '類別13 下游租賃資產', en: 'Cat 13 Downstream leased assets' } },
  { value: 14, label: { zhTW: '類別14 加盟', en: 'Cat 14 Franchises' } },
  { value: 15, label: { zhTW: '類別15 投資', en: 'Cat 15 Investments' } },
];

export const SCOPE3_METHOD_LABEL: Record<Scope3Method, BilingualText> = {
  spend: { zhTW: '支出基礎(EEIO)', en: 'Spend-based (EEIO)' },
  supplier: { zhTW: '供應商實際數據', en: 'Supplier-specific' },
  use_phase: { zhTW: '使用階段計算', en: 'Use-phase model' },
  manual: { zhTW: '手動輸入 tCO₂e', en: 'Manual tCO₂e' },
};

export const SCOPE3_NOTE: BilingualText = {
  zhTW: 'Scope 3 起步量化:支出基礎 EEIO 係數、使用階段電網係數**無單一官方值,請填你查證的方法學/係數**(GHG Protocol Scope 3 / ISO 14064-1 / PAS 2050)。對伺服器,類別11(使用階段)常為最大宗。',
  en: 'Scope 3 starter: spend-based EEIO factors and use-phase grid factors have NO single official value — enter your verified method/factor (GHG Protocol Scope 3 / ISO 14064-1 / PAS 2050). For servers, Cat 11 (use-phase) is usually the largest.',
};

export interface FootprintSummary {
  scope1: number; // location-based, inventory facilities only
  scope2: number; // location-based, inventory facilities only
  scope12: number; // all facilities (typed + inventory), location-based
  scope3: number;
  total: number; // scope12 + scope3
  scope3Pct: number; // share of total
  units: number; // annual units sold
  pcfPerUnit?: number; // kgCO₂e per unit (org footprint ÷ units) — a simple allocation, not full LCA
}

/** Whole-company footprint + per-unit PCF — surfaces the Scope 3 dominance the carbon fee hides. */
export function footprintSummary(profile: CompanyProfile): FootprintSummary {
  let scope1 = 0, scope2 = 0;
  for (const f of profile.facilities) {
    if (f.useInventory && f.activities && f.activities.length > 0) {
      const inv = computeInventory(f.activities, f.countryCode, f.renewablePct);
      scope1 += inv.scope1Tonnes; scope2 += inv.scope2Tonnes;
    }
  }
  const scope12 = round(profile.facilities.reduce((a, f) => a + facilityEmissionsTonnes(f), 0));
  const scope3 = computeScope3(profile.scope3 ?? []).totalTonnes;
  const total = round(scope12 + scope3);
  const units = Math.max(0, profile.annualUnitsSold ?? 0);
  return {
    scope1: round(scope1),
    scope2: round(scope2),
    scope12,
    scope3,
    total,
    scope3Pct: total > 0 ? Math.round((scope3 / total) * 100) : 0,
    units,
    pcfPerUnit: units > 0 ? round((total * 1000) / units) : undefined,
  };
}
