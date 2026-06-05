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

export const IFRS_ADOPTION_BASIS_NOTE: BilingualText = {
  zhTW: '判定基準：2026 年底實收資本額是否達 100 億；2029 年全體約 1,938 家接軌。最大難點為 Scope 3 揭露。',
  en: 'Basis: whether paid-in capital reaches NT$10bn by end-2026; ~1,938 firms aligned by 2029. The hardest part is Scope 3 disclosure.',
};

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
