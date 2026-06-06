// Emission-factor library for the GHG-inventory builder (V8). DATA RED LINE: every factor cites
// an official Taiwan source + version; values are USER-OVERRIDABLE (real inventory practice — the
// official table is re-versioned annually and some sites have facility-specific factors).
//
// Sources:
// - Electricity (Scope 2): 經濟部能源署 113 年度(2024)電力排碳係數 0.474 kgCO₂e/度(114/4/14 公告;
//   前一年 112 年度為 0.494)。https://www.moeaea.gov.tw
// - Fuels (Scope 1): 環境部「溫室氣體排放係數管理表 6.0.4」(CO₂ 為主項;LPG 3.1815 kgCO₂/kg 已確認;
//   汽油/柴油 CO₂ 基準 IPCC 2006 69,300 / 74,100 kgCO₂/TJ)。https://ghgregistry.moenv.gov.tw
// - GWP: 環境部 113/2/5 公告採 IPCC AR5(CH₄=28、N₂O=265);本庫係數以 CO₂ 為主項,CH₄/N₂O 為次要,
//   完整盤查請另計。

import type { BilingualText, Citation } from '@/lib/diagnose/types';

export type Scope = 1 | 2;

export interface EmissionFactor {
  key: string;
  label: BilingualText;
  unit: BilingualText; // activity unit (kWh, L, kg, m³)
  scope: Scope;
  kgco2ePerUnit: number; // default factor — overridable per line
  source: BilingualText; // short provenance shown in lineage
}

export const EMISSION_FACTORS: EmissionFactor[] = [
  {
    key: 'electricity',
    label: { zhTW: '外購電力', en: 'Purchased electricity' },
    unit: { zhTW: '度（kWh）', en: 'kWh' },
    scope: 2,
    kgco2ePerUnit: 0.474,
    source: { zhTW: '能源署 113 年度電力排碳係數', en: 'Energy Admin. 2024 grid factor' },
  },
  {
    key: 'diesel',
    label: { zhTW: '柴油', en: 'Diesel' },
    unit: { zhTW: '公升（L）', en: 'L' },
    scope: 1,
    kgco2ePerUnit: 2.6063,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
  {
    key: 'gasoline',
    label: { zhTW: '車用汽油', en: 'Motor gasoline' },
    unit: { zhTW: '公升（L）', en: 'L' },
    scope: 1,
    kgco2ePerUnit: 2.2631,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
  {
    key: 'natural_gas',
    label: { zhTW: '天然氣', en: 'Natural gas' },
    unit: { zhTW: '立方公尺（m³）', en: 'm³' },
    scope: 1,
    kgco2ePerUnit: 2.1622,
    source: { zhTW: '環境部排放係數管理表 6.0.4（組成而異,宜覆寫）', en: 'MOENV 6.0.4 (composition-varying — override)' },
  },
  {
    key: 'lpg',
    label: { zhTW: '液化石油氣 LPG', en: 'LPG' },
    unit: { zhTW: '公斤（kg）', en: 'kg' },
    scope: 1,
    kgco2ePerUnit: 3.1815,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
  {
    key: 'fuel_oil',
    label: { zhTW: '燃料油（重油）', en: 'Fuel oil' },
    unit: { zhTW: '公升（L）', en: 'L' },
    scope: 1,
    kgco2ePerUnit: 3.117,
    source: { zhTW: '環境部排放係數管理表 6.0.4', en: 'MOENV factor table 6.0.4' },
  },
];

export const FACTOR_BY_KEY: Record<string, EmissionFactor> = Object.fromEntries(EMISSION_FACTORS.map((f) => [f.key, f]));

export const CITATION_EMISSION_FACTORS: Citation = {
  source: {
    zhTW: '經濟部能源署 113 年度電力排碳係數;環境部「溫室氣體排放係數管理表 6.0.4」;環境部 113/2/5 公告採 IPCC AR5 GWP',
    en: 'Energy Admin. 2024 grid factor; MOENV GHG emission factor table 6.0.4; MOENV adopts IPCC AR5 GWP (5 Feb 2024)',
  },
  officialDocVersion: {
    zhTW: '電力 0.474 kgCO₂e/度(一手);燃料係數以 CO₂ 為主項,版本會更新——請對照環境部最新版管理表,或覆寫為你的查證值',
    en: 'Electricity 0.474 kgCO₂e/kWh (primary); fuel factors are CO₂-dominant and re-versioned — check the latest MOENV table or override with your verified value',
  },
  asOfDate: '2026-06',
  url: 'https://ghgregistry.moenv.gov.tw/',
};

export const GWP_NOTE: BilingualText = {
  zhTW: '本係數以 CO₂ 為主項(燃料燃燒 CO₂ 約占 99%);CH₄／N₂O 為次要,環境部採 IPCC AR5(CH₄ 28、N₂O 265),完整盤查請另計。電力係數已為 CO₂e。',
  en: 'Factors are CO₂-dominant (≈99% of fuel combustion); CH₄/N₂O are minor — MOENV uses IPCC AR5 (CH₄ 28, N₂O 265); add them for a full inventory. The electricity factor is already CO₂e.',
};
