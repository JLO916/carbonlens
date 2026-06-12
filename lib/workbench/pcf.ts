// S3 — per-SKU product carbon footprint. Brands increasingly ask suppliers for product-level carbon
// (per part / per shipment), not just an org total. This allocates the organisation footprint across
// products by a chosen key (equal / mass / revenue) and emits a one-page declaration. RED LINE: this
// is a SCREENING allocation of the org inventory (ISO 14067-style), NOT a verified cradle-to-gate LCA
// — every output says so, and nothing is fabricated (it only redistributes the user's own footprint).

import { footprintSummary } from './scope3';
import type { CompanyProfile, ProductLine } from './profile';
import type { BilingualText } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 100) / 100;

export type PcfBasis = 'equal' | 'mass' | 'revenue';
export type PcfBoundary = 'scope12' | 'total';

export interface ProductPcf {
  product: ProductLine;
  allocationWeight: number; // annualUnits × (weightPerUnit | 1)
  sharePct: number; // % of the total allocation weight
  allocatedTonnes: number; // footprint × share
  pcfPerUnit?: number; // kgCO₂e per unit (allocatedTonnes × 1000 / annualUnits)
}

export interface PcfResult {
  basis: PcfBasis;
  boundary: PcfBoundary;
  orgFootprintTonnes: number; // the full org footprint on the chosen boundary
  footprintTonnes: number; // the ALLOCATION POOL = org footprint × coverage share (R4 #3)
  coveragePct: number; // % of annual output the product list covers (100 when not entered)
  coverageAssumed: boolean; // true when the user left coverage blank (assumed full coverage)
  totalWeight: number;
  products: ProductPcf[];
}

export const PCF_BASIS_LABEL: Record<PcfBasis, BilingualText> = {
  equal: { zhTW: '依數量(每單位等重)', en: 'By units (equal per unit)' },
  mass: { zhTW: '依質量(每單位重量)', en: 'By mass (weight per unit)' },
  revenue: { zhTW: '依營收(每單位售價)', en: 'By revenue (price per unit)' },
};

export const PCF_BOUNDARY_LABEL: Record<PcfBoundary, BilingualText> = {
  scope12: { zhTW: '營運(Scope 1+2)', en: 'Operations (Scope 1+2)' },
  total: { zhTW: '含價值鏈(Scope 1+2+3)', en: 'Incl. value chain (Scope 1+2+3)' },
};

/** Allocate the org footprint across products. Returns null when there are no products. */
export function productFootprints(profile: CompanyProfile): PcfResult | null {
  const products = profile.products ?? [];
  if (products.length === 0) return null;

  const fp = footprintSummary(profile);
  const boundary: PcfBoundary = profile.pcfBoundary ?? 'total';
  const orgFootprintTonnes = boundary === 'scope12' ? fp.scope12 : fp.total;
  // R4 #3 — the pool is org footprint × the share of annual output this list covers. A 2-SKU list
  // covering 5% of output must NOT absorb 100% of the org footprint (per-unit ~20× overstated).
  const coverageAssumed = profile.pcfCoveragePct == null;
  const coveragePct = coverageAssumed ? 100 : Math.min(100, Math.max(1, profile.pcfCoveragePct as number));
  const footprintTonnes = round(orgFootprintTonnes * (coveragePct / 100));
  const basis: PcfBasis = profile.pcfBasis ?? 'equal';

  const weightOf = (p: ProductLine) => Math.max(0, p.annualUnits) * (basis === 'equal' ? 1 : Math.max(0, p.weightPerUnit ?? 0));
  const totalWeight = products.reduce((a, p) => a + weightOf(p), 0);

  const rows: ProductPcf[] = products.map((p) => {
    const w = weightOf(p);
    const share = totalWeight > 0 ? w / totalWeight : 0;
    const allocatedTonnes = round(footprintTonnes * share);
    const pcfPerUnit = p.annualUnits > 0 ? round((allocatedTonnes * 1000) / p.annualUnits) : undefined;
    return { product: p, allocationWeight: round(w), sharePct: round(share * 100), allocatedTonnes, pcfPerUnit };
  });

  return { basis, boundary, orgFootprintTonnes, footprintTonnes, coveragePct, coverageAssumed, totalWeight: round(totalWeight), products: rows };
}

/** Coverage line for cards/exports — states the share allocated, or that full coverage was ASSUMED. */
export const PCF_COVERAGE_ASSUMED_NOTE: BilingualText = {
  zhTW: '未填「產出涵蓋比例」,以下視同此清單涵蓋全年 100% 產出分攤全組織足跡——若實際僅涵蓋部分產量,每單位數字會被高估;請在 ⑨ 填入涵蓋比例。',
  en: 'No output-coverage % entered — the list is treated as covering 100% of annual output and absorbs the full organisation footprint. If it covers only part of production, per-unit figures are overstated; enter the coverage share in ⑨.',
};

export const PCF_DISCLAIMER: BilingualText = {
  zhTW: '本產品碳足跡為「組織盤查足跡分攤」之篩選級估算(方法參考 ISO 14067 精神),非經第三方查證之完整生命週期評估(LCA);邊界與分攤基礎如下所列,數值屬自行宣告。供應商與品牌客戶溝通與初步揭露用途。',
  en: 'This product carbon footprint is a SCREENING estimate allocated from the organisation inventory (ISO 14067-aligned in spirit), NOT a third-party-verified full life-cycle assessment (LCA). The boundary and allocation basis are stated below; figures are self-declared. For supplier–brand communication and preliminary disclosure.',
};

/** One-page PCF declaration covering every product — paste/print for a customer. */
export function pcfDeclarationText(profile: CompanyProfile, lang: 'zhTW' | 'en' = 'zhTW'): string {
  const res = productFootprints(profile);
  const L = (b: BilingualText) => (lang === 'en' ? b.en : b.zhTW);
  if (!res) return lang === 'en' ? 'No products defined.' : '尚未建立產品。';

  const out: string[] = [];
  out.push(`# ${lang === 'en' ? 'Product Carbon Footprint — declaration' : '產品碳足跡 — 聲明'}${profile.company ? ` (${profile.company})` : ''}`);
  out.push(`${lang === 'en' ? 'Reporting year' : '報告年度'}: ${profile.year}`);
  out.push(`${lang === 'en' ? 'System boundary' : '系統邊界'}: ${L(PCF_BOUNDARY_LABEL[res.boundary])} — ${res.orgFootprintTonnes.toLocaleString('en-US')} tCO₂e`);
  out.push(`${lang === 'en' ? 'Allocation basis' : '分攤基礎'}: ${L(PCF_BASIS_LABEL[res.basis])}`);
  out.push(
    res.coverageAssumed
      ? (lang === 'en' ? 'Output coverage: assumed 100% (not entered) — if the list covers only part of production, per-unit figures are overstated' : '產出涵蓋比例:未填,視同 100%——若清單僅涵蓋部分產量,每單位數字會被高估')
      : `${lang === 'en' ? 'Output coverage' : '產出涵蓋比例'}: ${res.coveragePct}% — ${lang === 'en' ? 'allocation pool' : '分攤池'} ${res.footprintTonnes.toLocaleString('en-US')} tCO₂e`,
  );
  out.push('');
  out.push(lang === 'en' ? 'Product | Annual units | Share | Allocated tCO₂e | kgCO₂e/unit' : '產品 | 年產量 | 占比 | 分攤 tCO₂e | kgCO₂e/單位');
  for (const r of res.products) {
    out.push(`${r.product.name || '—'} | ${r.product.annualUnits.toLocaleString('en-US')} | ${r.sharePct}% | ${r.allocatedTonnes.toLocaleString('en-US')} | ${r.pcfPerUnit != null ? r.pcfPerUnit.toLocaleString('en-US') : '—'}`);
  }
  out.push('');
  out.push(L(PCF_DISCLAIMER));
  return out.join('\n');
}
