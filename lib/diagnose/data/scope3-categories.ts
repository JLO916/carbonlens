// Scope 3 的 GHG Protocol 15 大類 + 「依產業常見重點類別」。
// 來源:GHG Protocol 企業價值鏈(Scope 3)標準(類別定義);CDP「各產業 Scope 3 類別
// 相關性」技術註記(產業重點)。類別定義為通用標準;產業重點為「起點」,實際重大性
// 因公司而異——不可當成完整重大性評估(誠實揭露)。

import type { BilingualText, Citation } from '@/lib/diagnose/types';

export const CITATION_SCOPE3_CATEGORIES: Citation = {
  source: {
    zhTW: 'GHG Protocol Scope 3 標準;CDP「各產業 Scope 3 類別相關性」技術註記',
    en: 'GHG Protocol Scope 3 Standard; CDP “Relevance of Scope 3 Categories by Sector” technical note',
  },
  officialDocVersion: {
    zhTW: 'GHG Protocol 企業價值鏈(Scope 3)會計與報告標準',
    en: 'GHG Protocol Corporate Value Chain (Scope 3) Accounting & Reporting Standard',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
  url: 'https://ghgprotocol.org/corporate-value-chain-scope-3-standard',
};

export interface Scope3Category {
  num: number;
  name: BilingualText;
}

export const SCOPE3_CATEGORIES: Scope3Category[] = [
  { num: 1, name: { zhTW: '採購商品與服務', en: 'Purchased goods & services' } },
  { num: 2, name: { zhTW: '資本財', en: 'Capital goods' } },
  { num: 3, name: { zhTW: '燃料與能源相關活動', en: 'Fuel- & energy-related activities' } },
  { num: 4, name: { zhTW: '上游運輸與配送', en: 'Upstream transportation & distribution' } },
  { num: 5, name: { zhTW: '營運產生的廢棄物', en: 'Waste generated in operations' } },
  { num: 6, name: { zhTW: '商務差旅', en: 'Business travel' } },
  { num: 7, name: { zhTW: '員工通勤', en: 'Employee commuting' } },
  { num: 8, name: { zhTW: '上游租賃資產', en: 'Upstream leased assets' } },
  { num: 9, name: { zhTW: '下游運輸與配送', en: 'Downstream transportation & distribution' } },
  { num: 10, name: { zhTW: '售出產品的加工', en: 'Processing of sold products' } },
  { num: 11, name: { zhTW: '售出產品的使用', en: 'Use of sold products' } },
  { num: 12, name: { zhTW: '售出產品的最終處置', en: 'End-of-life treatment of sold products' } },
  { num: 13, name: { zhTW: '下游租賃資產', en: 'Downstream leased assets' } },
  { num: 14, name: { zhTW: '加盟', en: 'Franchises' } },
  { num: 15, name: { zhTW: '投資', en: 'Investments' } },
];

// 產業 → 常見重點類別(起點)。僅放來源明確或業界公認者:
// 製造/零售→類別1(採購,常占 40–70%);耗能產品(電子/機械)→類別11(產品使用);
// 金融→類別15(投資/融資排放);服務→差旅/通勤。
export const MATERIAL_SCOPE3_BY_INDUSTRY: Record<string, number[]> = {
  electronics: [1, 11, 12],
  metals: [1, 3, 4],
  chemicals: [1, 3, 12],
  cement: [1, 3, 4],
  textiles: [1, 4, 12],
  machinery: [1, 11, 4],
  food: [1, 4, 12],
  retail: [1, 11, 12],
  finance: [15],
  services: [6, 7],
};

export function materialScope3(industry: string): Scope3Category[] {
  const nums = MATERIAL_SCOPE3_BY_INDUSTRY[industry] ?? [1, 4];
  return nums
    .map((n) => SCOPE3_CATEGORIES.find((c) => c.num === n))
    .filter((c): c is Scope3Category => Boolean(c));
}
