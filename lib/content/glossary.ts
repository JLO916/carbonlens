// Dual-level glossary: every term has a PLAIN line (一句白話, for newcomers) and a PRO line (專業:
// the standard / precise definition, for experts). Powers the InfoHint component (inline ⓘ) and a
// glossary section — so the same UI teaches a beginner and satisfies a senior practitioner.

import type { BilingualText } from '@/lib/types';

export interface GlossaryTerm {
  key: string;
  term: BilingualText;
  plain: BilingualText; // 白話
  pro: BilingualText; // 專業（標準／精確定義）
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    key: 'scope1',
    term: { zhTW: 'Scope 1（直接排放）', en: 'Scope 1 (direct)' },
    plain: { zhTW: '你「自己燒」出來的——廠內鍋爐、自有車輛、製程。', en: 'What you burn yourself — boilers, owned vehicles, process.' },
    pro: { zhTW: '組織直接擁有或控制之排放源(固定／移動燃燒、製程、逸散),GHG Protocol 範疇一。', en: 'Emissions from sources owned/controlled by the company (combustion, process, fugitive) — GHG Protocol Scope 1.' },
  },
  {
    key: 'scope2',
    term: { zhTW: 'Scope 2（外購能源）', en: 'Scope 2 (purchased energy)' },
    plain: { zhTW: '你「買電、買蒸汽」間接帶來的排放。', en: 'Indirect emissions from the electricity/steam you buy.' },
    pro: { zhTW: '外購電力／蒸汽／熱／冷之間接排放;需同時報「地點基礎」與「市場基礎」。', en: 'Indirect emissions from purchased electricity/steam/heat/cooling; report both location- and market-based.' },
  },
  {
    key: 'scope3',
    term: { zhTW: 'Scope 3（價值鏈）', en: 'Scope 3 (value chain)' },
    plain: { zhTW: '上下游帶來的——買的原料、賣出產品被使用。常是最大一塊。', en: 'Up/downstream — purchased materials, use of sold products. Often the biggest.' },
    pro: { zhTW: '價值鏈其他間接排放(15 類別,如類別1 採購、類別11 售出產品使用),GHG Protocol Scope 3 標準。', en: 'Other value-chain emissions (15 categories, e.g. Cat 1 purchases, Cat 11 use) — GHG Protocol Scope 3.' },
  },
  {
    key: 'locationVsMarket',
    term: { zhTW: '地點基礎 vs 市場基礎', en: 'Location- vs market-based' },
    plain: { zhTW: '地點＝用當地電網平均;市場＝把你買的綠電憑證算進去。', en: 'Location = grid average; market = counts your green-power contracts.' },
    pro: { zhTW: 'GHG Protocol Scope 2 雙報告:地點基礎用電網係數;市場基礎反映 PPA／REC／綠電(嚴格採殘差電力係數)。', en: 'GHG Protocol Scope 2 dual reporting: location uses the grid factor; market reflects PPA/REC (strictly a residual-mix factor).' },
  },
  {
    key: 'inventory',
    term: { zhTW: '盤查（Inventory）', en: 'GHG inventory' },
    plain: { zhTW: '把一年的排放一筆一筆算清楚。', en: 'Adding up a year of emissions, line by line.' },
    pro: { zhTW: '依 ISO 14064-1／GHG Protocol 建立組織溫室氣體清冊,含邊界、活動數據、係數與不確定性。', en: 'An organizational GHG inventory per ISO 14064-1 / GHG Protocol (boundary, activity data, factors, uncertainty).' },
  },
  {
    key: 'assurance',
    term: { zhTW: '查證（Assurance）', en: 'Assurance' },
    plain: { zhTW: '請第三方檢查你的數字可信。', en: 'A third party checks your numbers are trustworthy.' },
    pro: { zhTW: '第三方依 ISO 14064-3 對盤查提供有限／合理保證等級之確信。', en: 'Third-party verification to a limited/reasonable assurance level per ISO 14064-3.' },
  },
  {
    key: 'cbam',
    term: { zhTW: 'CBAM（碳邊境）', en: 'CBAM' },
    plain: { zhTW: '出口到歐盟的高碳產品要為內含碳付費。', en: 'High-carbon goods sold to the EU pay for their embedded carbon.' },
    pro: { zhTW: '歐盟碳邊境調整機制(Reg (EU) 2023/956);僅鋼鐵／鋁／水泥／肥料／氫／電力,2026 正式期起。', en: 'EU Carbon Border Adjustment (Reg (EU) 2023/956); steel/al/cement/fertilizer/H₂/power only, definitive from 2026.' },
  },
  {
    key: 'cbamFactor',
    term: { zhTW: 'CBAM 因子', en: 'CBAM factor' },
    plain: { zhTW: '免費配額逐年退場,你要付的比例越來越高。', en: 'Free allowances phase out — your payable share rises each year.' },
    pro: { zhTW: '免費配額遞減比例:2026 2.5% → 2034 100%(Reg 2023/956 §31、Dir 2003/87 §10a)。', en: 'Free-allocation phase-out: 2026 2.5% → 2034 100% (Reg 2023/956 §31, Dir 2003/87 §10a).' },
  },
  {
    key: 'sbti',
    term: { zhTW: 'SBTi（科學減碳目標）', en: 'SBTi' },
    plain: { zhTW: '依科學定「減多少才夠」的減碳目標。', en: 'Science-based targets for how much to cut.' },
    pro: { zhTW: '科學基礎減量目標倡議;1.5°C 近期目標約需每年線性減 4.2%(絕對量)。', en: 'Science Based Targets initiative; 1.5°C near-term ≈ 4.2%/yr linear absolute reduction.' },
  },
  {
    key: 're100',
    term: { zhTW: 'RE100（百分百綠電）', en: 'RE100' },
    plain: { zhTW: '承諾用電全部來自再生能源。', en: 'A pledge to use 100% renewable electricity.' },
    pro: { zhTW: '企業承諾 100% 再生能源電力;以市場基礎工具(PPA／REC／綠電）達成,計入市場基礎 Scope 2。', en: 'Commitment to 100% renewable electricity via market instruments (PPA/REC), counted in market-based Scope 2.' },
  },
  {
    key: 'pcf',
    term: { zhTW: 'PCF（產品碳足跡）', en: 'PCF' },
    plain: { zhTW: '一個產品從頭到尾排了多少碳。', en: 'How much carbon one product is responsible for.' },
    pro: { zhTW: '產品碳足跡(ISO 14067／GHG Product);本工具以「組織足跡 ÷ 產量」估算,非完整 LCA。', en: 'Product carbon footprint (ISO 14067); here estimated as org footprint ÷ units — not a full LCA.' },
  },
  {
    key: 'spendBased',
    term: { zhTW: '支出基礎（EEIO）', en: 'Spend-based (EEIO)' },
    plain: { zhTW: '用「花了多少錢」乘係數,粗估採購的碳。', en: 'Estimate purchasing carbon from how much you spent.' },
    pro: { zhTW: '環境延伸投入產出(EEIO)係數 × 支出金額;資料不足時的 Scope 3 類別1 起步法,精度低。', en: 'Environmentally-extended input-output factor × spend; a low-precision Scope 3 Cat 1 starter.' },
  },
  {
    key: 'biogenic',
    term: { zhTW: '生物源 CO₂（biogenic）', en: 'Biogenic CO₂' },
    plain: { zhTW: '燒生質(木屑、稻殼)的 CO₂,另外列、不算進總量。', en: 'CO₂ from burning biomass — reported separately, not in the total.' },
    pro: { zhTW: '生質燃燒之 CO₂ 依 GHG Protocol 以 memo 項分列、Scope 1 計淨零(非生質部分仍計）。', en: 'Biomass-combustion CO₂ reported as a memo item, net-zero in Scope 1 per GHG Protocol.' },
  },
  {
    key: 'baseYear',
    term: { zhTW: '基準年', en: 'Base year' },
    plain: { zhTW: '拿來當「比較起點」的那一年。', en: 'The reference year you measure progress against.' },
    pro: { zhTW: '減量目標之參考年;重大變動需依重算門檻調整基準年排放。', en: 'The reference year for targets; recalculated when significant changes cross the threshold.' },
  },
];

export const GLOSSARY_BY_KEY: Record<string, GlossaryTerm> = Object.fromEntries(GLOSSARY.map((g) => [g.key, g]));
