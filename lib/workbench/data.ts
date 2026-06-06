// Sourced, workbench-specific regulatory notes (V5 domain validation). DATA RED LINE: every
// claim here is from public official sources, cited. Researched 2026-06.

import type { BilingualText, Citation } from '@/lib/diagnose/types';

// ---- Taiwan carbon fee gating (A1) ----
// MOENV three sub-laws (29 Aug 2024): preferential rates AND the carbon-leakage coefficient both
// require an APPROVED voluntary reduction plan; high-leakage firms forgo the 25,000 t threshold.

export const CITATION_TW_CARBON_FEE: Citation = {
  source: {
    zhTW: '環境部氣候變遷署 碳費三子法(2024/8/29);中央社、CSRone 彙整',
    en: 'MOENV Climate Change Administration — carbon-fee three sub-laws (29 Aug 2024); CNA, CSRone',
  },
  officialDocVersion: {
    zhTW: '碳費收費辦法、自主減量計畫管理辦法、碳費徵收對象溫室氣體減量指定目標',
    en: 'Carbon Fee Collection Regulations; Voluntary Reduction Plan Management Regulations; designated reduction targets',
  },
  asOfDate: '2026-06',
  url: 'https://www.cca.gov.tw/affairs/carbon-fee-fund/2301.html',
};

export const TW_FEE_GATING_NOTE: BilingualText = {
  zhTW: '優惠費率（NT$50／100）與碳洩漏風險係數（0.2／0.4／0.6）須先提出並經環境部核定「自主減量計畫」（達 2030 指定削減率，如鋼鐵 25.2%、水泥 22.3%、一般行業 42%）方可適用；未核定者以一般費率 NT$300、扣除 2.5 萬噸起徵額計算（高碳洩漏風險者不享起徵額）。',
  en: 'Preferential rates (NT$50/100) and the carbon-leakage coefficient (0.2/0.4/0.6) apply only with an MOENV-approved voluntary reduction plan meeting the 2030 targets (e.g. steel 25.2%, cement 22.3%, general 42%). Without approval the general NT$300 rate applies on emissions minus the 25,000 t threshold (high-leakage firms forgo that threshold).',
};

// ---- CBAM scope by product (A2) ----
// Definitive period: iron/steel, aluminium, hydrogen, electricity = DIRECT emissions only;
// cement & fertilizers = direct + indirect. So green power (Scope 2) does NOT lower steel/
// aluminium CBAM — only direct (process/fuel) reductions do.

export const CITATION_CBAM_SCOPE: Citation = {
  source: {
    zhTW: '歐盟執委會 taxation-customs;CBAM Guide、oneclicklca（2026 定義期）',
    en: 'European Commission taxation-customs; CBAM Guide, oneclicklca (2026 definitive period)',
  },
  officialDocVersion: {
    zhTW: 'CBAM 內含排放範圍:鋼/鋁/氫/電力僅直接;水泥/肥料含間接',
    en: 'CBAM embedded-emissions scope: steel/aluminium/hydrogen/electricity direct-only; cement/fertilizer incl. indirect',
  },
  asOfDate: '2026-06',
  url: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en',
};

export const CBAM_SCOPE_NOTE: BilingualText = {
  zhTW: '依 CBAM 規則,鋼／鋁／氫／電力的內含排放只計「直接排放」——換綠電（降 Scope 2）不會降低這些品項的 CBAM；只有製程／燃料等直接減排才會。水泥與肥料則含間接排放。',
  en: 'Under CBAM, embedded emissions for steel/aluminium/hydrogen/electricity count DIRECT only — switching to green power (Scope 2) does not lower their CBAM; only direct (process/fuel) cuts do. Cement & fertilizers include indirect.',
};

// ---- Verification / assurance pathway (B2) ----

export const CITATION_ASSURANCE: Citation = {
  source: {
    zhTW: '金管會 IFRS 永續揭露藍圖;歐盟 CBAM 查證要求;勤業眾信／KPMG／資誠 解析（2025–2026）',
    en: 'FSC IFRS sustainability roadmap; EU CBAM verification rules; Deloitte/KPMG/PwC analyses (2025–2026)',
  },
  officialDocVersion: {
    zhTW: 'IFRS S1/S2 確信時程、CBAM 經認證查證機構查證、TAF 認證查驗機構',
    en: 'IFRS S1/S2 assurance timeline; CBAM accredited-verifier requirement; TAF-accredited verification bodies',
  },
  asOfDate: '2026-06',
  url: 'https://www.fsc.gov.tw/ch/home.jsp?id=96&parentpath=0,2',
};

export interface AssuranceStep {
  title: BilingualText;
  detail: BilingualText;
}

export const ASSURANCE_STEPS: AssuranceStep[] = [
  {
    title: { zhTW: '永續報告書 / IFRS S2:第三方確信', en: 'Sustainability report / IFRS S2: third-party assurance' },
    detail: {
      zhTW: '溫室氣體資訊已逐步要求外部確信;IFRS S1/S2 接軌後揭露範圍擴大,宜及早與會計師／確信機構排程(確信需在數據完成後,留前置時間)。',
      en: 'GHG information increasingly requires external assurance; as IFRS S1/S2 widens scope, schedule your auditor/assurance provider early — assurance follows data completion, so reserve lead time.',
    },
  },
  {
    title: { zhTW: 'CBAM:經認證查證機構查證排放', en: 'CBAM: verified emissions by an accredited verifier' },
    detail: {
      zhTW: '要用「實際內含排放」取代官方預設值,數據須經歐盟認可的查證機構查證;非歐盟設施的合格查證機構生態仍在發展,務必預留查證時間。',
      en: 'To replace official defaults with actual embedded emissions, the data must be verified by an EU-accredited verifier; the pool for non-EU facilities is still developing — reserve verification lead time.',
    },
  },
  {
    title: { zhTW: '盤查端:ISO 14064-1 + TAF 認證查驗', en: 'Inventory side: ISO 14064-1 + TAF-accredited verification' },
    detail: {
      zhTW: '國內溫室氣體盤查多依 ISO 14064-1,由 TAF 認證的查驗機構查驗;先把盤查邊界與品質做扎實,才接得上 IFRS 確信與 CBAM 查證。',
      en: 'Domestic GHG inventory typically follows ISO 14064-1, verified by TAF-accredited bodies; solidify inventory boundary & quality first — it feeds both IFRS assurance and CBAM verification.',
    },
  },
];

export const ASSURANCE_INTRO: BilingualText = {
  zhTW: '工具把數字算清楚了,但要讓它「官方認可、可簽名背書」,還得過查證這關——這是最常被低估的前置時間。以下是銜接路徑(指引,非代辦):',
  en: 'The tool gets the numbers straight, but making them official & sign-off-ready means clearing assurance — the most underestimated lead time. Here is the pathway (guidance, not a service):',
};
