// ⚠️ DATA RED LINE (Brief §0/§6). Every figure below is transcribed verbatim from
// Brief §6A, which cites official Taiwan FSC (金管會) sources. Do NOT add unsourced
// numbers, estimates, or "plausible-looking" values here. Listed-disclosure data is
// stable / low-frequency (§6A note) — maintained by human / low-frequency review
// against the latest FSC announcement; no sync pipeline (that is CBAM-only, §7).

import type {
  Citation,
  CapitalTier,
  IfrsPhaseInfo,
  GriObligationInfo,
  DisclosureScopeInfo,
  BilingualText,
} from '@/lib/diagnose/types';

// ---- Citations (§6A) ----

export const CITATION_GRI: Citation = {
  source: {
    zhTW: '力銘永續（2026/3）、compet.com.tw（彙整金管會、櫃買中心）',
    en: 'Liming Sustainability (Mar 2026); compet.com.tw (compiling FSC & TPEx)',
  },
  officialDocVersion: {
    zhTW: '金管會／櫃買中心 永續報告書編製申報規範',
    en: 'FSC / TPEx sustainability report preparation & filing rules',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
};

export const CITATION_IFRS: Citation = {
  source: {
    zhTW: 'UDN（金管會證期局）、鉅亨網（2025）、digiknow（2023 藍圖）',
    en: 'UDN (FSC Securities & Futures Bureau); cnYES (2025); digiknow (2023 roadmap)',
  },
  officialDocVersion: {
    zhTW: '金管會證期局 IFRS 永續揭露接軌時程，2026/1/20',
    en: 'FSC SFB ISSB-alignment timeline, 2026-01-20',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
};

// ---- §6A-1　永續報告書（GRI）— 普遍義務 ----

export const GRI_UNIVERSAL_OBLIGATION: GriObligationInfo = {
  applies: true,
  effectiveFrom: 2025,
  scopeNote: {
    zhTW: '自 2025 年起全體上市櫃公司（含實收資本額 20 億以下）均須編製並申報',
    en: 'From 2025, all listed/OTC companies (incl. paid-in capital under NT$2bn) must prepare and file',
  },
  annualDeadlineLabel: {
    zhTW: '每年 8/31 前完成前一年度報告書',
    en: 'File the prior-year report by 31 August each year',
  },
  basis: {
    zhTW: '以 GRI 準則為主，並納入 SASB',
    en: 'GRI-based, incorporating SASB',
  },
  citation: CITATION_GRI,
};

// ---- §6A-2　IFRS S1/S2（ISSB 接軌）— 依資本額分三階段 ----
// Input bins follow §3A (≥100億 / 50–100億 / <50億); the 100億 boundary uses §3A's ≥.

export const IFRS_PHASES: Record<CapitalTier, IfrsPhaseInfo> = {
  over100: {
    phase: 1,
    capitalLabel: { zhTW: '實收資本額逾 100 億', en: 'Paid-in capital over NT$10bn' },
    firmCount: { zhTW: '約 125–126 家', en: '~125–126 firms' },
    compileFY: { zhTW: '2026 會計年度起編製', en: 'Prepare from FY2026' },
    fileYear: 2027,
    fileDeadlineISO: '2027-03-16',
    fileLabel: { zhTW: '2027/3/16 前與年報同步申報', en: 'File with annual report by 16 Mar 2027' },
    citation: CITATION_IFRS,
  },
  from50to100: {
    phase: 2,
    capitalLabel: { zhTW: '實收資本額 50–100 億', en: 'Paid-in capital NT$5bn–10bn' },
    firmCount: { zhTW: '約 118 家', en: '~118 firms' },
    compileFY: { zhTW: '2027 會計年度編製', en: 'Prepare for FY2027' },
    fileYear: 2028,
    fileLabel: { zhTW: '2028 年申報', en: 'File in 2028' },
    citation: CITATION_IFRS,
  },
  under50: {
    phase: 3,
    capitalLabel: { zhTW: '實收資本額未滿 50 億', en: 'Paid-in capital under NT$5bn' },
    firmCount: { zhTW: '約 1,694 家', en: '~1,694 firms' },
    compileFY: { zhTW: '2028 會計年度編製', en: 'Prepare for FY2028' },
    fileYear: 2029,
    fileLabel: { zhTW: '2029 年（全面）申報', en: 'File in 2029 (full coverage)' },
    citation: CITATION_IFRS,
  },
};

// ---- 在地細節(§6A 之外的接軌細節,已查證 2026/6)。金控/KY 股等不做硬性宣稱,只提醒查證 ----

export const CITATION_IFRS_ROADMAP: Citation = {
  source: {
    zhTW: '金管會證期局「推動我國接軌 IFRS 永續揭露準則藍圖」;勤業眾信／KPMG／天下 CSR 解析（2025–2026）',
    en: 'FSC SFB “Roadmap for Adopting IFRS Sustainability Disclosure Standards”; Deloitte/KPMG/CW-CSR analyses (2025–2026)',
  },
  officialDocVersion: {
    zhTW: '金管會證期局 IFRS 永續揭露藍圖（2023/11/6）及後續更新',
    en: 'FSC SFB IFRS Sustainability Disclosure roadmap (6 Nov 2023) and updates',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
  url: 'https://www.fsc.gov.tw/ch/home.jsp?id=96&parentpath=0,2&mcustomize=news_view.jsp&dataserno=202308170002&dtable=News',
};

export const IFRS_LOCAL_NUANCES: { title: BilingualText; detail: BilingualText }[] = [
  {
    title: { zhTW: '接軌方式', en: 'Adoption approach' },
    detail: {
      zhTW: '採「直接採用」，經金管會認可後適用；首次適用須同時包含 IFRS S1 與 S2。',
      en: 'Direct adoption, applicable after FSC endorsement; first-time application must include both IFRS S1 and S2.',
    },
  },
  {
    title: { zhTW: '過渡規定（可先質性／合理估算）', en: 'Transition relief (qualitative / reasonable estimates first)' },
    detail: {
      zhTW: '量化難度高者（氣候風險預期財務影響、情境分析、韌性評估）首年可先揭露質性資訊；估計事項（影響金額／比重、Scope 3）可依現行合理可佐證資料估算。',
      en: 'Hard-to-quantify items (anticipated financial effects, scenario analysis, resilience) may start qualitative; estimates (impact amounts/shares, Scope 3) may use reasonable supportable data.',
    },
  },
  {
    title: { zhTW: '查證／確信', en: 'Assurance' },
    detail: {
      zhTW: '永續報告書須註明各揭露項目是否取得第三方確認／確信／保證；確信等級與時程依金管會規劃逐步提高。',
      en: 'The report must state whether each item obtained third-party assurance; assurance level and timing increase per FSC plans.',
    },
  },
  {
    title: { zhTW: '你的情況可能不同', en: 'Your case may differ' },
    detail: {
      zhTW: '金融業（金控／保險等）、第一上市櫃（KY 股）、是否連結財報揭露等另有適用考量——三階段為一般原則，請依金管會最新個案公告確認。',
      en: 'Financials (FHC/insurers), foreign primary-listed (KY) shares, consolidated-report linkage, etc. carry additional considerations — the three phases are a general rule; confirm your case against the latest FSC announcements.',
    },
  },
];

export const IFRS_ADOPTION_BASIS_NOTE: BilingualText = {
  zhTW: '判定基準：2026 年底實收資本額是否達 100 億；2029 年全體約 1,938 家接軌。最大難點為 Scope 3 揭露。',
  en: 'Basis: whether paid-in capital reaches NT$10bn by end-2026; ~1,938 firms aligned by 2029. The hardest part is Scope 3 disclosure.',
};

// ---- 實務下一步(critique #9):點出最重的工。成本保持定性、不編具體金額(紅線) ----

export const CITATION_IMPLEMENTATION: Citation = {
  source: {
    zhTW: 'ISO 14064-1／-3、溫室氣體盤查議定書（GHG Protocol）;金管會永續報告書查證要求',
    en: 'ISO 14064-1/-3, GHG Protocol; FSC sustainability-report assurance requirements',
  },
  officialDocVersion: {
    zhTW: 'ISO 14064 系列;金管會永續報告書編製與確信規範',
    en: 'ISO 14064 series; FSC sustainability-report preparation & assurance rules',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
};

export const IMPLEMENTATION_STEPS: { title: BilingualText; detail: BilingualText }[] = [
  {
    title: { zhTW: '溫室氣體盤查（最重的工）', en: 'GHG inventory (the heavy lifting)' },
    detail: {
      zhTW: '依 ISO 14064-1／GHG Protocol 建立組織邊界、蒐集活動數據、套用排放係數;Scope 3 通常最耗時、最依賴供應鏈配合。',
      en: 'Per ISO 14064-1 / GHG Protocol: set organizational boundaries, collect activity data, apply emission factors; Scope 3 is usually the most time-consuming and supplier-dependent.',
    },
  },
  {
    title: { zhTW: '盤查工具／系統選型', en: 'Inventory tooling' },
    detail: {
      zhTW: '從試算表到商用碳盤查平台;依據點數、資料量與是否需查證來選。',
      en: 'From spreadsheets to commercial carbon-accounting platforms; choose by number of sites, data volume, and whether assurance is needed.',
    },
  },
  {
    title: { zhTW: '第三方查證／確信', en: 'Third-party assurance' },
    detail: {
      zhTW: '由認證機構（如 BSI、SGS、TÜV、DNV 等）依 ISO 14064-3 查證;金管會逐步要求確信等級提高,需預留預算與時程。成本依範疇、據點與規模而異。',
      en: 'Verified by certification bodies (e.g. BSI, SGS, TÜV, DNV) per ISO 14064-3; FSC raises assurance levels over time — budget and lead time required. Cost varies by scope, sites and size.',
    },
  },
];

// ---- 重點揭露範圍（Scope 1/2/3，標 Scope 3 難點）。Scope 定義為 GHG Protocol 通用定義；
// 揭露「義務」依 IFRS S2 接軌（CITATION_IFRS）。 ----

export const DISCLOSURE_SCOPE: DisclosureScopeInfo = {
  items: [
    {
      key: 'scope1',
      label: { zhTW: 'Scope 1　直接排放', en: 'Scope 1 — direct emissions' },
      description: {
        zhTW: '公司自有或可控制來源的直接溫室氣體排放（如自有鍋爐、車隊）。',
        en: 'Direct GHG emissions from owned or controlled sources (e.g. on-site boilers, fleet).',
      },
    },
    {
      key: 'scope2',
      label: { zhTW: 'Scope 2　外購能源間接排放', en: 'Scope 2 — purchased energy' },
      description: {
        zhTW: '外購電力、蒸氣、冷熱能所對應的間接排放。',
        en: 'Indirect emissions from purchased electricity, steam, heating and cooling.',
      },
    },
    {
      key: 'scope3',
      label: { zhTW: 'Scope 3　價值鏈間接排放', en: 'Scope 3 — value-chain emissions' },
      description: {
        zhTW: '上下游價值鏈的間接排放（採購、運輸、產品使用等），資料最難取得。',
        en: 'Indirect value-chain emissions (procurement, logistics, product use, etc.) — the hardest to collect.',
      },
      isHardest: true,
    },
  ],
  hardestNote: {
    zhTW: 'Scope 3 涵蓋上下游價值鏈，資料最難取得，為接軌的最大難點。',
    en: 'Scope 3 spans the up/downstream value chain and is the hardest to collect — the biggest adoption challenge.',
  },
  citation: CITATION_IFRS,
};
