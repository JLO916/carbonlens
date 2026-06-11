// Sourced, workbench-specific regulatory notes (V5 domain validation). DATA RED LINE: every
// claim here is from public official sources, cited. Researched 2026-06.

import type { BilingualText, Citation } from '@/lib/diagnose/types';

// ---- Taiwan carbon fee gating (A1) ----
// MOENV three sub-laws (29 Aug 2024): preferential rates AND the carbon-leakage coefficient both
// require an APPROVED voluntary reduction plan; high-leakage firms forgo the 25,000 t threshold.

export const CITATION_TW_CARBON_FEE: Citation = {
  source: {
    zhTW: '氣候變遷因應法 第29條（優惠費率＋自主減量計畫之法源）;碳費收費辦法、自主減量計畫管理辦法、碳費徵收對象溫室氣體減量指定目標（環境部令，113/8/29）',
    en: 'Climate Change Response Act Art. 29 (legal basis for preferential rate + reduction plan); Carbon Fee Collection Regulations; Voluntary Reduction Plan Management Regulations; designated reduction targets (MOENV, 29 Aug 2024)',
  },
  officialDocVersion: {
    zhTW: '全國法規資料庫「碳費收費辦法」O0020139（一手法條）;優惠費率須依指定目標附表一/二減量並經核定自主減量計畫',
    en: 'Laws & Regulations Database — Carbon Fee Collection Regulations, code O0020139 (primary law); preferential rates require an approved voluntary reduction plan per the designated-target schedules',
  },
  asOfDate: '2026-06',
  url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=O0020139',
};

export const TW_FEE_GATING_NOTE: BilingualText = {
  zhTW: '依氣候變遷因應法第 29 條,優惠費率（NT$50／100）與碳洩漏風險係數（0.2／0.4／0.6）須先提出並經環境部核定「自主減量計畫」（達 2030 指定削減率，如鋼鐵 25.2%、水泥 22.3%、一般行業 42%）方可適用；未核定者以一般費率 NT$300、扣除 2.5 萬噸起徵額計算（高碳洩漏風險者不享起徵額）。',
  en: 'Under the Climate Change Response Act Art. 29, preferential rates (NT$50/100) and the carbon-leakage coefficient (0.2/0.4/0.6) apply only with an MOENV-approved voluntary reduction plan meeting the 2030 targets (e.g. steel 25.2%, cement 22.3%, general 42%). Without approval the general NT$300 rate applies on emissions minus the 25,000 t threshold (high-leakage firms forgo that threshold).',
};

// R4 #1 — Thailand's carbon tax is embedded in the OIL excise: only petroleum-product combustion
// is in the tax base. The two variants tell the user exactly what was (not) counted.
export const TH_TAX_BASE_NOTE: BilingualText = {
  zhTW: '泰國碳稅（THB 200/tCO₂e）內含於油品消費稅,僅及石油產品（柴油/汽油/LPG/燃料油）;外購電力、天然氣與製程排放不在課稅範圍。本估算稅基＝此廠盤查中的油品燃燒排放。',
  en: 'Thailand’s carbon tax (THB 200/tCO₂e) is embedded in the oil excise and reaches only petroleum products (diesel/gasoline/LPG/fuel oil); purchased electricity, natural gas and process emissions are outside the tax base. This estimate taxes the facility’s petroleum-combustion emissions from its inventory.',
};

export const TH_TAX_BASE_UNSPLIT_NOTE: BilingualText = {
  zhTW: '泰國碳稅僅及油品,但此廠以「直接填總數」輸入,無法拆分油品占比——故未列計（顯示 THB 0）。改用「從活動數據建模」填入油品用量後即可估算。',
  en: 'Thailand’s carbon tax reaches only oil products, but this facility uses a typed lump-sum total that cannot be split into its oil share — so no tax is counted (THB 0). Switch to activity-data modelling and enter fuel volumes to estimate it.',
};

// ---- CBAM scope by product (A2) ----
// Definitive period: iron/steel, aluminium, hydrogen, electricity = DIRECT emissions only;
// cement & fertilizers = direct + indirect. So green power (Scope 2) does NOT lower steel/
// aluminium CBAM — only direct (process/fuel) reductions do.

export const CITATION_CBAM_SCOPE: Citation = {
  source: {
    zhTW: 'Regulation (EU) 2023/956（CBAM 規則）附件二、附件四;EUR-Lex 一手',
    en: 'Regulation (EU) 2023/956 (CBAM) Annex II & Annex IV; EUR-Lex (primary)',
  },
  officialDocVersion: {
    zhTW: '附件二列舉「僅計直接排放」之貨品（鋼鐵、鋁、氫）;未列者（水泥、肥料）計直接＋間接。方法學見附件四',
    en: 'Annex II lists goods counting DIRECT emissions only (iron/steel, aluminium, hydrogen); goods not listed (cement, fertilizers) count direct + indirect. Methodology in Annex IV',
  },
  asOfDate: '2026-06',
  url: 'https://eur-lex.europa.eu/eli/reg/2023/956/oj/eng',
};

export const CBAM_SCOPE_NOTE: BilingualText = {
  zhTW: '依 CBAM 規則 (EU) 2023/956 附件二,鋼／鋁／氫的內含排放只計「直接排放」——換綠電（降 Scope 2）不會降低這些品項的 CBAM；只有製程／燃料等直接減排才會。未列於附件二者（水泥、肥料）則含間接排放。',
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
