// Emission-factor library for the GHG-inventory builder (V8 + P1a depth). DATA RED LINE: every
// factor cites an official source + version; values are USER-OVERRIDABLE (real inventory practice —
// the official table is re-versioned annually and many sites have facility-specific factors). Where
// no single official per-unit value exists (purchased steam, process emissions, other fuels), the
// factor is marked `userSupplied` (default 0) and the user MUST enter their verified value — we do
// NOT fabricate a number.
//
// Sources:
// - Electricity (Scope 2): 經濟部能源署 113 年度(2024)電力排碳係數 0.474 kgCO₂e/度(114/4/14 公告;
//   前一年 112 年度為 0.494)。https://www.moeaea.gov.tw
// - Fuels (Scope 1): 環境部「溫室氣體排放係數管理表 6.0.4」(CO₂ 為主項;LPG 3.1815 kgCO₂/kg 已確認;
//   汽油/柴油 CO₂ 基準 IPCC 2006 69,300 / 74,100 kgCO₂/TJ)。煙煤為 IPCC 2006 推估(見下)。
//   https://ghgregistry.moenv.gov.tw
// - Refrigerants / SF₆ (Scope 1 fugitive): 係數即 GWP(kgCO₂e/kg 洩漏量),採 IPCC AR5 100-yr GWP
//   (環境部 113/2/5 公告採用);冷媒混合物為成分加權(R-410A=R-32/R-125 各 50%…)。
// - GWP: 環境部 113/2/5 公告採 IPCC AR5(CH₄=28、N₂O=265)。燃料係數以 CO₂ 為主項,CH₄/N₂O 為次要。

import type { BilingualText, Citation } from '@/lib/diagnose/types';

export type Scope = 1 | 2;
export type FactorCategory = 'electricity' | 'fuel' | 'steam' | 'fugitive' | 'process';

export interface EmissionFactor {
  key: string;
  label: BilingualText;
  unit: BilingualText; // activity unit (kWh, L, kg, m³, t…)
  scope: Scope;
  category: FactorCategory;
  kgco2ePerUnit: number; // default factor — overridable per line
  source: BilingualText; // short provenance shown in lineage
  /** When true, the default is a placeholder (0) — no single official per-unit value exists, so the
   *  user MUST enter their verified factor (purchased steam, process emissions, other fuels). */
  userSupplied?: boolean;
}

export const EMISSION_FACTORS: EmissionFactor[] = [
  // ── Purchased energy (Scope 2) ─────────────────────────────────────────────
  {
    key: 'electricity',
    label: { zhTW: '外購電力', en: 'Purchased electricity' },
    unit: { zhTW: '度（kWh）', en: 'kWh' },
    scope: 2,
    category: 'electricity',
    kgco2ePerUnit: 0.474,
    source: { zhTW: '能源署 113 年度電力排碳係數', en: 'Energy Admin. 2024 grid factor' },
  },
  {
    key: 'steam_purchased',
    label: { zhTW: '外購蒸汽／熱', en: 'Purchased steam/heat' },
    unit: { zhTW: '公噸蒸汽（t）', en: 't steam' },
    scope: 2,
    category: 'steam',
    kgco2ePerUnit: 0,
    userSupplied: true,
    source: { zhTW: '依供應商鍋爐效率/燃料而異——請填供應商提供之蒸汽排放係數', en: 'Supplier-specific — enter the steam factor your supplier provides' },
  },
  // ── Stationary / mobile combustion (Scope 1) ───────────────────────────────
  {
    key: 'diesel',
    label: { zhTW: '柴油', en: 'Diesel' },
    unit: { zhTW: '公升（L）', en: 'L' },
    scope: 1,
    category: 'fuel',
    kgco2ePerUnit: 2.6063,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
  {
    key: 'gasoline',
    label: { zhTW: '車用汽油', en: 'Motor gasoline' },
    unit: { zhTW: '公升（L）', en: 'L' },
    scope: 1,
    category: 'fuel',
    kgco2ePerUnit: 2.2631,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
  {
    key: 'natural_gas',
    label: { zhTW: '天然氣', en: 'Natural gas' },
    unit: { zhTW: '立方公尺（m³）', en: 'm³' },
    scope: 1,
    category: 'fuel',
    kgco2ePerUnit: 2.1622,
    source: { zhTW: '環境部排放係數管理表 6.0.4（組成而異,宜覆寫）', en: 'MOENV 6.0.4 (composition-varying — override)' },
  },
  {
    key: 'lpg',
    label: { zhTW: '液化石油氣 LPG', en: 'LPG' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fuel',
    kgco2ePerUnit: 3.1815,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
  {
    key: 'fuel_oil',
    label: { zhTW: '燃料油（重油）', en: 'Fuel oil' },
    unit: { zhTW: '公升（L）', en: 'L' },
    scope: 1,
    category: 'fuel',
    kgco2ePerUnit: 3.117,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
  {
    key: 'coal_bituminous',
    label: { zhTW: '煙煤', en: 'Bituminous coal' },
    unit: { zhTW: '公噸（t）', en: 't' },
    scope: 1,
    category: 'fuel',
    kgco2ePerUnit: 2440,
    source: { zhTW: 'IPCC 2006 煙煤 94,600 kgCO₂/TJ × NCV 25.8 GJ/t;依煤種熱值而異,宜覆寫', en: 'IPCC 2006 bituminous 94,600 kgCO₂/TJ × NCV 25.8 GJ/t; varies by coal — override' },
  },
  {
    key: 'fuel_other',
    label: { zhTW: '其他燃料（自填係數）', en: 'Other fuel (enter factor)' },
    unit: { zhTW: '單位（自訂）', en: 'unit (custom)' },
    scope: 1,
    category: 'fuel',
    kgco2ePerUnit: 0,
    userSupplied: true,
    source: { zhTW: '乙炔/丙烷/焦炭等——請參環境部 6.0.4 或 IPCC 填入係數', en: 'Acetylene/propane/coke etc. — enter factor per MOENV 6.0.4 or IPCC' },
  },
  // ── Fugitive: refrigerants & SF₆ (Scope 1; factor = IPCC AR5 100-yr GWP) ────
  {
    key: 'refrigerant_r134a',
    label: { zhTW: '冷媒 R-134a（HFC-134a）', en: 'Refrigerant R-134a' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fugitive',
    kgco2ePerUnit: 1300,
    source: { zhTW: 'IPCC AR5 GWP（環境部採用）', en: 'IPCC AR5 GWP (MOENV-adopted)' },
  },
  {
    key: 'refrigerant_r410a',
    label: { zhTW: '冷媒 R-410A', en: 'Refrigerant R-410A' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fugitive',
    kgco2ePerUnit: 1924,
    source: { zhTW: 'IPCC AR5 GWP 成分加權（R-32/R-125 各 50%）', en: 'IPCC AR5 GWP, blend (50/50 R-32/R-125)' },
  },
  {
    key: 'refrigerant_r404a',
    label: { zhTW: '冷媒 R-404A', en: 'Refrigerant R-404A' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fugitive',
    kgco2ePerUnit: 3943,
    source: { zhTW: 'IPCC AR5 GWP 成分加權', en: 'IPCC AR5 GWP, blend-weighted' },
  },
  {
    key: 'refrigerant_r32',
    label: { zhTW: '冷媒 R-32（HFC-32）', en: 'Refrigerant R-32' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fugitive',
    kgco2ePerUnit: 677,
    source: { zhTW: 'IPCC AR5 GWP（環境部採用）', en: 'IPCC AR5 GWP (MOENV-adopted)' },
  },
  {
    key: 'refrigerant_r407c',
    label: { zhTW: '冷媒 R-407C', en: 'Refrigerant R-407C' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fugitive',
    kgco2ePerUnit: 1624,
    source: { zhTW: 'IPCC AR5 GWP 成分加權', en: 'IPCC AR5 GWP, blend-weighted' },
  },
  {
    key: 'refrigerant_r22',
    label: { zhTW: '冷媒 R-22（HCFC-22）', en: 'Refrigerant R-22' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fugitive',
    kgco2ePerUnit: 1760,
    source: { zhTW: 'IPCC AR5 GWP（環境部採用）', en: 'IPCC AR5 GWP (MOENV-adopted)' },
  },
  {
    key: 'sf6',
    label: { zhTW: '六氟化硫 SF₆', en: 'Sulphur hexafluoride SF₆' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    category: 'fugitive',
    kgco2ePerUnit: 23500,
    source: { zhTW: 'IPCC AR5 GWP（環境部採用）', en: 'IPCC AR5 GWP (MOENV-adopted)' },
  },
  // ── Process emissions (Scope 1; process-specific — user-supplied) ──────────
  {
    key: 'process_other',
    label: { zhTW: '製程排放（自填係數）', en: 'Process emissions (enter factor)' },
    unit: { zhTW: '單位（自訂）', en: 'unit (custom)' },
    scope: 1,
    category: 'process',
    kgco2ePerUnit: 0,
    userSupplied: true,
    source: { zhTW: '石灰煅燒/酸洗/熱處理等因製程而異——請填查證之製程排放係數', en: 'Calcination/pickling/heat-treat etc. — enter your verified process factor' },
  },
];

export const FACTOR_BY_KEY: Record<string, EmissionFactor> = Object.fromEntries(EMISSION_FACTORS.map((f) => [f.key, f]));

/** Factors grouped by category, for a structured picker. */
export const FACTOR_CATEGORY_LABEL: Record<FactorCategory, BilingualText> = {
  electricity: { zhTW: '外購電力', en: 'Purchased electricity' },
  steam: { zhTW: '外購蒸汽／熱', en: 'Purchased steam/heat' },
  fuel: { zhTW: '燃料燃燒', en: 'Fuel combustion' },
  fugitive: { zhTW: '逸散（冷媒／SF₆）', en: 'Fugitive (refrigerants/SF₆)' },
  process: { zhTW: '製程排放', en: 'Process emissions' },
};

export const CITATION_EMISSION_FACTORS: Citation = {
  source: {
    zhTW: '經濟部能源署 113 年度電力排碳係數;環境部「溫室氣體排放係數管理表 6.0.4」;逸散冷媒/SF₆ 採 IPCC AR5 GWP(環境部 113/2/5 公告採用);煙煤為 IPCC 2006 推估',
    en: 'Energy Admin. 2024 grid factor; MOENV GHG emission factor table 6.0.4; fugitive refrigerants/SF₆ use IPCC AR5 GWP (MOENV-adopted, 5 Feb 2024); coal is IPCC-2006-derived',
  },
  officialDocVersion: {
    zhTW: '電力 0.474 kgCO₂e/度(一手);燃料係數以 CO₂ 為主項、版本會更新;冷媒係數=IPCC AR5 GWP;外購蒸汽/製程/其他燃料無單一官方值,請填查證值。一律可覆寫。',
    en: 'Electricity 0.474 (primary); fuel factors CO₂-dominant & re-versioned; refrigerant factor = IPCC AR5 GWP; steam/process/other-fuel have no single official value — enter your verified value. All overridable.',
  },
  asOfDate: '2026-06',
  url: 'https://ghgregistry.moenv.gov.tw/',
};

export const GWP_NOTE: BilingualText = {
  zhTW: '燃料係數以 CO₂ 為主項(燃燒 CO₂ 約占 99%);CH₄／N₂O 為次要,環境部採 IPCC AR5(CH₄ 28、N₂O 265)。逸散冷媒/SF₆ 之係數即 AR5 GWP(已為 CO₂e)。外購蒸汽/製程/其他燃料無單一官方值,請填你查證的係數(預設 0,需自填)。',
  en: 'Fuel factors are CO₂-dominant (≈99%); CH₄/N₂O are minor — MOENV uses IPCC AR5 (CH₄ 28, N₂O 265). Refrigerant/SF₆ factors ARE the AR5 GWP (already CO₂e). Purchased steam/process/other-fuel have no single official value — enter your verified factor (default 0, user-supplied).',
};
