// ⚠️ DATA RED LINE (Brief §0/§6C). All content below is transcribed from Brief §6C,
// which cites public framework docs + research (envigilance, sievo, CDP, Normative,
// farmraise). This is a QUALITATIVE profile: only "expected-to-be-asked" based on brand
// customers' PUBLIC commitments. NEVER assert a specific brand's numeric demand on a
// company, and NEVER invent brand→framework membership lists (§6C output principle).

import type { Citation, BilingualText, FrameworkKey } from '@/lib/diagnose/types';

// ---- Citations (§6C) ----

export const CITATION_FRAMEWORKS: Citation = {
  source: {
    zhTW: 'envigilance（2026/1）、sievo（2025/11）、CDP 官方文件、Normative（2026/5）',
    en: 'envigilance (Jan 2026); sievo (Nov 2025); CDP official docs; Normative (May 2026)',
  },
  officialDocVersion: {
    zhTW: 'RE100／SBTi／CDP 公開框架文件',
    en: 'RE100 / SBTi / CDP public framework documents',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
};

export const CITATION_SCOPE3: Citation = {
  source: {
    zhTW: 'Normative（2026/5，×3）、sievo（2025/11）',
    en: 'Normative (May 2026, ×3); sievo (Nov 2025)',
  },
  officialDocVersion: {
    zhTW: 'CDP／Normative Scope 3 規模統計',
    en: 'CDP / Normative Scope 3 scale statistics',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
};

export const CITATION_TRANSMISSION: Citation = {
  source: {
    zhTW: 'Normative（2026/5）、farmraise（2026）',
    en: 'Normative (May 2026); farmraise (2026)',
  },
  officialDocVersion: {
    zhTW: '品牌淨零／SBTi 承諾之供應鏈傳導機制',
    en: 'Supply-chain transmission of brand net-zero / SBTi commitments',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
};

export const CITATION_CSRD: Citation = {
  source: { zhTW: 'Normative（2026/5）', en: 'Normative (May 2026)' },
  officialDocVersion: {
    zhTW: 'CSRD（Omnibus 修正後）價值鏈上限／VSME 自願性中小企業準則',
    en: 'CSRD (post-Omnibus) value-chain cap / VSME voluntary SME standard',
  },
  asOfDate: '2026-06',
  nextReview: '2026-12',
};

// ---- 三大公開框架（推「預期被要求」的依據，§6C） ----

export interface FrameworkData {
  key: Exclude<FrameworkKey, 'unsure'>;
  name: BilingualText;
  commitment: BilingualText; // 品牌客戶對外的承諾
  expectedAsk: BilingualText; // 因此供應商「預期」會被要求的事項
}

export const FRAMEWORKS: FrameworkData[] = [
  {
    key: 're100',
    name: { zhTW: 'RE100', en: 'RE100' },
    commitment: {
      zhTW: '品牌承諾 100% 使用再生電力；會員資格透過 CDP 追蹤。',
      en: 'Brands commit to 100% renewable electricity; membership tracked via CDP.',
    },
    expectedAsk: {
      zhTW: '預期被要求：揭露用電與再生電力使用情形、配合品牌的再生能源目標。',
      en: 'Likely asked for: electricity use and renewable-energy sourcing disclosure, alignment with the brand’s renewable targets.',
    },
  },
  {
    key: 'sbti',
    name: { zhTW: 'SBTi（科學基礎減量目標）', en: 'SBTi (Science Based Targets)' },
    commitment: {
      zhTW: '與 CDP、UNGC、WRI、WWF 合作；當 Scope 3 ≥ 總排放 40%（多數企業超過）即須設 Scope 3 目標，近期目標涵蓋 ≥67%、長期／淨零 ≥90%；供應商經「供應商議合／減量目標」納入。',
      en: 'Partnered with CDP, UNGC, WRI, WWF; when Scope 3 ≥ 40% of total (most exceed it), a Scope 3 target is required — near-term ≥67% coverage, long-term/net-zero ≥90%; suppliers brought in via supplier-engagement / reduction targets.',
    },
    expectedAsk: {
      zhTW: '預期被要求：提供 Scope 3 相關排放數據、配合供應商議合與減量目標。',
      en: 'Likely asked for: Scope 3-related emissions data and participation in supplier engagement / reduction targets.',
    },
  },
  {
    key: 'cdp',
    name: { zhTW: 'CDP', en: 'CDP' },
    commitment: {
      zhTW: '追蹤 SBTi 進度與 RE100 會員的主要揭露平台；年度氣候問卷蒐集 Scope 1/2/3、目標、治理、風險；設「供應商議合評級」；A 級需第三方查證。',
      en: 'The main disclosure platform tracking SBTi progress and RE100 membership; the annual climate questionnaire collects Scope 1/2/3, targets, governance and risk; includes a supplier-engagement rating; A-list requires third-party verification.',
    },
    expectedAsk: {
      zhTW: '預期被要求：填寫 CDP 氣候問卷、提供 Scope 1/2/3 數據，必要時第三方查證。',
      en: 'Likely asked for: completing the CDP climate questionnaire, providing Scope 1/2/3 data, and third-party verification where needed.',
    },
  },
];

export const CITATION_FRAMEWORKS_REF = CITATION_FRAMEWORKS;

// ---- Scope 3 規模（為何壓力落在供應商，§6C） ----

export const SCOPE3_SCALE_POINTS: BilingualText[] = [
  { zhTW: 'Scope 3 占各產業總排放約 70–90%（CDP）。', en: 'Scope 3 is ~70–90% of total emissions across industries (CDP).' },
  { zhTW: '平均約 75% 來自供應商／物流／客戶；平均為直接排放的 11.4 倍。', en: 'On average ~75% comes from suppliers/logistics/customers — about 11.4× direct emissions.' },
];

export const SCOPE3_INDUSTRY_NOTES = {
  finance: {
    zhTW: '金融業 Scope 3 常達 98%+，壓力尤其集中於投融資對象。',
    en: 'In finance, Scope 3 often reaches 98%+, concentrated in financed/invested entities.',
  } as BilingualText,
  manufacturing_retail: {
    zhTW: '製造／零售之「採購商品與服務（類別 1）」常占 Scope 3 的 50%+，直接落在供應商身上。',
    en: 'In manufacturing/retail, “purchased goods & services (Category 1)” is often 50%+ of Scope 3 — landing directly on suppliers.',
  } as BilingualText,
};

// ---- 傳導機制（＝失單恐懼，§6C） ----

export const TRANSMISSION_TEXT: BilingualText = {
  zhTW: '有淨零／SBTi 承諾的品牌，需要供應商層級的已查證數據來證明自身進度，因而把 Scope 3 揭露、CDP 問卷、排放數據要求往供應鏈下壓；大型客戶與投資人即使當地未法定強制，亦日益要求。',
  en: 'Brands with net-zero/SBTi commitments need verified supplier-level data to prove their own progress, so they push Scope 3 disclosure, CDP questionnaires and emissions-data requests down the chain; large customers and investors increasingly ask even where not locally mandated.',
};

// ---- 價值鏈上限（誠實標示給中小供應商，§6C） ----

export const CSRD_CAP_PROTECTED: BilingualText = {
  zhTW: 'CSRD（Omnibus 修正後）下，員工數 <1,000 人的公司不得被要求提供超出「自願性中小企業準則（VSME）」的排放資訊——對小型供應商有保護，無須過度恐慌。',
  en: 'Under CSRD (post-Omnibus), companies with <1,000 employees cannot be required to provide emissions information beyond the voluntary SME standard (VSME) — a protection for smaller suppliers; no need to over-panic.',
};

export const CSRD_CAP_ABOVE_THRESHOLD: BilingualText = {
  zhTW: '員工數 ≥1,000 人，不在 CSRD 中小企業價值鏈上限（VSME）的保護範圍內，較可能被要求提供完整排放資訊。',
  en: 'With ≥1,000 employees you fall outside the CSRD SME value-chain cap (VSME) protection, and are more likely to be asked for full emissions information.',
};
