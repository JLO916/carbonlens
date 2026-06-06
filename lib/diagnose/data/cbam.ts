// ⚠️ DATA RED LINE (Brief §0/§6B/§7). Values here are the SOURCED, stable parts of CBAM
// (timeline, penalty, de minimis, mark-up schedule, product list) transcribed from Brief
// §6B. The per-country × product emission DEFAULTS and grid factors are NOT here — they
// live in the synced cache (cbam-cache.ts) and stay LOCKED until a verified sync (§7.3).
// Do NOT hardcode or estimate any emission default value.

import type { BilingualText, Citation, CbamProductKey } from '@/lib/diagnose/types';

// ---- Citations (§6B) ----

export const CITATION_CBAM_LEGAL: Citation = {
  source: {
    zhTW: 'complianceandrisks（2025/11）、oneclicklca（2026/2）、ICAP、coolset（2026/1）',
    en: 'complianceandrisks (Nov 2025); oneclicklca (Feb 2026); ICAP; coolset (Jan 2026)',
  },
  officialDocVersion: {
    zhTW: 'Reg (EU) 2023/956 經 Omnibus Reg (EU) 2025/2083 修正（2025/10/20 生效）',
    en: 'Reg (EU) 2023/956 as amended by Omnibus Reg (EU) 2025/2083 (in force 2025-10-20)',
  },
  asOfDate: '2026-06',
  url: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-legislation-and-guidance_en',
};

export const CITATION_CBAM_DEFAULTS: Citation = {
  source: {
    zhTW: 'EUR-Lex OJ L_202502621（IR 2025/2621 本文）、co2-iq、ICAP、carboneer（2026/2）',
    en: 'EUR-Lex OJ L_202502621 (IR 2025/2621); co2-iq; ICAP; carboneer (Feb 2026)',
  },
  officialDocVersion: {
    zhTW: 'IR (EU) 2025/2621（2025/12/16）Annex（國別×產品預設值、電力因子）',
    en: 'IR (EU) 2025/2621 (16 Dec 2025) Annexes (country×product defaults, grid factors)',
  },
  asOfDate: '2026-06',
  url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202502621',
};

// ---- 時程（§6B；多來源一致） ----

export const CBAM_TIMELINE: { label: BilingualText; value: BilingualText }[] = [
  {
    label: { zhTW: '過渡期末季報', en: 'Final transitional report' },
    value: { zhTW: '2026/1/31 前交（過渡期 2023/10/1–2025/12/31）', en: 'Due by 31 Jan 2026 (transitional 2023/10/1–2025/12/31)' },
  },
  {
    label: { zhTW: '定義期起算', en: 'Definitive period starts' },
    value: { zhTW: '2026/1/1（僅授權申報人可進口）', en: '1 Jan 2026 (only authorised declarants may import)' },
  },
  {
    label: { zhTW: '憑證銷售起', en: 'Certificate sales start' },
    value: { zhTW: '2027/2/1', en: '1 Feb 2027' },
  },
  {
    label: { zhTW: '首次年度申報與繳交', en: 'First annual declaration & surrender' },
    value: { zhTW: '2027/9/30（涵蓋 2026 進口）', en: '30 Sep 2027 (covers 2026 imports)' },
  },
];

export const CBAM_PENALTY_NOTE: BilingualText = {
  zhTW: '逾量未繳每噸 €100；2026、2027 合格產業免費 EUA 配額每年遞減 2.5%。',
  en: 'Excess unsurrendered: €100 per tonne; eligible sectors’ free EUA allocation falls 2.5%/yr in 2026 and 2027.',
};

// ---- 50 噸 de minimis（§6B；ICAP 2025/10/20） ----

export const CBAM_DE_MINIMIS_TONNES = 50;

export const CBAM_DE_MINIMIS_NOTE: BilingualText = {
  zhTW: '年進口 ≤50 噸（累計淨重）大致豁免；氫與電力不適用此豁免。',
  en: 'Annual imports ≤50 t (cumulative net weight) are broadly exempt; hydrogen and electricity are NOT eligible.',
};

// ---- 受規範產業（6 大）＋擴大（§6B） ----

export const CBAM_PRODUCTS: {
  key: CbamProductKey;
  label: BilingualText;
  /** Hydrogen & electricity cannot use the de minimis exemption (§6B). */
  deMinimisEligible: boolean;
}[] = [
  { key: 'cement', label: { zhTW: '水泥', en: 'Cement' }, deMinimisEligible: true },
  { key: 'steel', label: { zhTW: '鋼鐵（含扣件等下游）', en: 'Steel (incl. fasteners/downstream)' }, deMinimisEligible: true },
  { key: 'aluminum', label: { zhTW: '鋁', en: 'Aluminium' }, deMinimisEligible: true },
  { key: 'fertilizer', label: { zhTW: '肥料', en: 'Fertilizer' }, deMinimisEligible: true },
  { key: 'electricity', label: { zhTW: '電力', en: 'Electricity' }, deMinimisEligible: false },
  { key: 'hydrogen', label: { zhTW: '氫', en: 'Hydrogen' }, deMinimisEligible: false },
];

export const CBAM_EXPANSION_NOTE: BilingualText = {
  zhTW: '擬自 2028 擴及鋼／鋁密集下游品項。',
  en: 'Expansion to steel/aluminium-intensive downstream goods planned from 2028.',
};

// ---- 加成（mark-up）— §6B 公式參數，僅適用「官方預設值」路徑（含加成）。 ----
// 實際數據路徑不套加成。以下為 SOURCED 參考排程，待預設值快取解鎖後使用。

export const CBAM_MARKUP_BY_PRODUCT_YEAR: Record<string, Record<number, number>> = {
  // 鋁／水泥／鋼鐵：2026 +10% → 2027 +20% → 2028 +30%
  aluminum: { 2026: 0.1, 2027: 0.2, 2028: 0.3 },
  cement: { 2026: 0.1, 2027: 0.2, 2028: 0.3 },
  steel: { 2026: 0.1, 2027: 0.2, 2028: 0.3 },
  // 肥料 +1%
  fertilizer: { 2026: 0.01, 2027: 0.01, 2028: 0.01 },
  // 電力／氫：§6B 未明確列示加成 → 不套用（保留 0，避免估算）
  electricity: { 2026: 0, 2027: 0, 2028: 0 },
  hydrogen: { 2026: 0, 2027: 0, 2028: 0 },
};

export const CBAM_MARKUP_NOTE: BilingualText = {
  zhTW: '加成僅適用「官方預設值」路徑；本工具直接採官方 Excel 已含加成之值（各品項不同：鋼鐵／鋁／水泥約 2026 +10%→2028 +30%、肥料約 +1%，以官方值為準，本工具標示由該筆官方值反推的加成%）。使用實際排放數據則不套加成。',
  en: 'Mark-up applies only to the “official default” path; the tool uses the official Excel’s already-marked-up values (per product: steel/aluminium/cement ≈ +10% in 2026 → +30% in 2028, fertilizer ≈ +1% — official values govern; the tool shows the mark-up % implied by that official value). Using actual emissions data, no mark-up applies.',
};

// ---- CBAM 因子（免費配額遞減）— 定義期義務逐年相位導入（V3-1）。 ----
// CBAM 進口商每年只需為「內含排放 × CBAM 因子」繳交憑證；因子＝EU ETS 免費配額被削減的比例，
// 自 2026 年 2.5% 升至 2034 年 100%（鏡像歐盟產業免費配額退場）。忽略此因子會把近年暴露高估數十倍。
// 來源：Directive 2003/87/EC 第 10a(1a) 條（經修正）；ICAP、carboneer、CBAM Guide（2025/12 定義期）一致。
export const CBAM_FACTOR_BY_YEAR: Record<number, number> = {
  2026: 0.025,
  2027: 0.05,
  2028: 0.1,
  2029: 0.225,
  2030: 0.485,
  2031: 0.61,
  2032: 0.735,
  2033: 0.86,
  2034: 1.0,
};

/** CBAM factor for a year (share of embedded emissions actually subject to CBAM). Clamps to the
 *  2026–2034 phase-in; ≥2034 → full (1.0), <2026 → 2026 level. */
export function cbamFactorForYear(year: number): number {
  if (year < 2026) return 0; // transitional period — no certificates surrendered before 2026
  if (year >= 2034) return 1;
  return CBAM_FACTOR_BY_YEAR[year] ?? CBAM_FACTOR_BY_YEAR[2026];
}

export const CITATION_CBAM_FACTOR: Citation = {
  source: {
    zhTW: 'Regulation (EU) 2023/956 第 31 條（CBAM 因子＝1−免費配額比例）、Directive 2003/87/EC 第 10a 條;EUR-Lex 一手',
    en: 'Regulation (EU) 2023/956 Art. 31 (CBAM factor = 1 − free-allocation share); Directive 2003/87/EC Art. 10a; EUR-Lex (primary)',
  },
  officialDocVersion: {
    zhTW: '免費配額退場排程 = CBAM 因子(2026 約 2.5% → 2034 100%);ICAP／carboneer 數值交叉核對',
    en: 'Free-allocation phase-out schedule = CBAM factor (≈2.5% in 2026 → 100% in 2034); cross-checked vs ICAP/carboneer',
  },
  asOfDate: '2026-06',
  url: 'https://eur-lex.europa.eu/eli/reg/2023/956/oj/eng',
};

export const CBAM_FACTOR_NOTE: BilingualText = {
  zhTW: 'CBAM 因子（免費配額遞減）：定義期義務逐年相位導入——2026 僅約 2.5% 內含排放需繳費、2027 約 5%、2028 約 10%，至 2034 年 100%。本工具暴露已套當年因子，故為「當年義務」、非全額。',
  en: 'CBAM factor (free-allocation phase-out): the obligation phases in — ~2.5% of embedded emissions in 2026, ~5% in 2027, ~10% in 2028, reaching 100% by 2034. The tool applies the year’s factor, so figures are the year’s obligation, not the full amount.',
};

// ---- 實際數據銜接（V3-7）：怎麼把「官方預設值」換成「實際內含排放」 ----

export const CBAM_ACTUAL_DATA_HELP: BilingualText = {
  zhTW: '想要比官方預設值更低的數字？用「實際內含排放」。歐盟執委會提供官方「設施溝通範本（Communication template for installations）」，讓你的生產設施計算單位內含排放（SEE）並交給歐盟進口商——這是把預設值換成實際值、降低買家 CBAM 成本與你被換供應商風險的關鍵一步。需要時宜預留查證時間。',
  en: 'Want a number lower than the official default? Use actual embedded emissions. The European Commission publishes an official “Communication template for installations” so your facility can compute specific embedded emissions (SEE) and hand them to your EU importer — the key step to replace defaults with actual data, cut your buyer’s CBAM cost, and reduce supplier-switching risk. Reserve lead time for verification.',
};

export const CITATION_CBAM_TEMPLATE: Citation = {
  source: {
    zhTW: '歐盟執委會 CBAM「設施溝通範本」與營運者指引',
    en: 'European Commission CBAM “Communication template for installations” & operator guidance',
  },
  officialDocVersion: {
    zhTW: 'CBAM 營運者實際內含排放（SEE）計算與溝通範本',
    en: 'CBAM operator SEE calculation & communication template',
  },
  asOfDate: '2026-06',
  url: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-legislation-and-guidance_en',
};

// ---- 常見實務坑(critique #12)。出口商角度,已查證來源 ----

export const CITATION_CBAM_PRACTICE: Citation = {
  source: {
    zhTW: 'Crowell & Moring、Squire Patton Boggs、O’Melveny CBAM 實務指引;ICAP;taxation-customs',
    en: 'Crowell & Moring, Squire Patton Boggs, O’Melveny CBAM practice notes; ICAP; taxation-customs',
  },
  officialDocVersion: {
    zhTW: 'CBAM 過渡期／定義期報告實務(法律事務所與 ICAP 指引,2024–2026)',
    en: 'CBAM transitional/definitive reporting practice (law-firm & ICAP guidance, 2024–2026)',
  },
  asOfDate: '2026-06',
};

export const CBAM_PITFALLS: BilingualText[] = [
  {
    zhTW: '拿不到準確、可查證的排放數據 → 你買家被套「國別×產品預設值＋加成」,成本通常更高,且可能轉嫁給你。',
    en: 'Without accurate, verifiable emissions data, your buyer is assigned country×product default values plus a mark-up — usually higher, and often passed back to you.',
  },
  {
    zhTW: '供應鏈數據不配合是最常見痛點;非關聯進口商對你提供資料的查證能力有限,更倚賴你先把數據做扎實。',
    en: 'Supplier data gaps are the most common pain point; unrelated importers have limited ability to verify what you provide — so solid data from you matters more.',
  },
  {
    zhTW: '查證瓶頸:非歐盟生產設施的合格查證機構生態仍在發展,要預留查證時間。',
    en: 'Verification bottleneck: the pool of accredited verifiers for non-EU facilities is still developing — reserve lead time.',
  },
  {
    zhTW: '估算逐步收緊:過渡期後段複雜商品估算上限 20%;定義期更嚴——實際排放數據才是長解。',
    en: 'Estimates are tightening: late transitional period caps estimates at 20% for complex goods; the definitive period is stricter — actual data is the durable answer.',
  },
  {
    zhTW: '逾 50 噸進口者,你買家須為「授權 CBAM 申報人」;過渡期未盡申報義務每噸罰 €10–50。',
    en: 'Above 50 t, your buyer must be an authorised CBAM declarant; transitional non-compliance is penalised at €10–50 per tonne.',
  },
];

// ---- 來源國（§3B 輸入；國別僅影響「官方預設值」查表與顯示，預設值目前鎖定） ----

export const CBAM_ORIGIN_COUNTRIES: { value: string; label: BilingualText }[] = [
  { value: 'tw', label: { zhTW: '台灣', en: 'Taiwan' } },
  { value: 'cn', label: { zhTW: '中國', en: 'China' } },
  { value: 'in', label: { zhTW: '印度', en: 'India' } },
  { value: 'kr', label: { zhTW: '韓國', en: 'South Korea' } },
  { value: 'jp', label: { zhTW: '日本', en: 'Japan' } },
  { value: 'vn', label: { zhTW: '越南', en: 'Vietnam' } },
  { value: 'th', label: { zhTW: '泰國', en: 'Thailand' } },
  { value: 'tr', label: { zhTW: '土耳其', en: 'Türkiye' } },
  { value: 'other', label: { zhTW: '其他', en: 'Other' } },
];
