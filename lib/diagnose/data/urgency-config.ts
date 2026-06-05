// ⚠️ TOOL-DEFINED SCORING PARAMETERS — NOT official figures (Brief §4).
// The 40/35/25 weights are RECC's confirmed strategic weighting (§4, 定案).
// Every sub-mapping below is intentionally simple, transparent, and ADJUSTABLE;
// the UI discloses this via URGENCY_METHODOLOGY_NOTE. This file is the single place
// to tune how "死線剩幾個月 / 暴露多大 / 資本額級距" map onto 0–1 (§4 requirement).

import type { CapitalTier, IfrsPhase, BilingualText } from '@/lib/diagnose/types';

/** §4 strategic weights — fixed/定案. Must sum to 1. */
export const URGENCY_WEIGHTS = {
  deadline: 0.4, // 死線逼近度
  exposure: 0.35, // 暴露強度
  scale: 0.25, // 規模
} as const;

// --- 規模 (scale): capital tier → 0–1 (proxy for deal size / 客單). Adjustable. ---
export const SCALE_BY_TIER: Record<CapitalTier, number> = {
  over100: 1.0,
  from50to100: 0.66,
  under50: 0.33,
};

// --- 死線逼近度 (deadline proximity): months-to-deadline → 0–1. Adjustable. ---
// <= nearMonths → 1.0; >= farMonths → floor; linear between.
export const DEADLINE_PROXIMITY = {
  nearMonths: 3,
  farMonths: 36,
  floor: 0.15,
};

// Year-only IFRS filing deadlines (phases 2 & 3) carry no day-precise date in the
// source. For the proximity CLOCK ONLY, reuse phase 1's known 03-16 filing month-day
// as a labeled, conservative assumption (TW annual reports sync ~mid-March). The
// RESULT still shows the sourced precision (year only). Adjustable.
export const ASSUMED_FILING_MONTH_DAY = '03-16';

// --- 暴露強度 (exposure intensity): 0–1. Adjustable. ---
export const EXPOSURE_CONFIG = {
  // Earlier IFRS adopters carry heavier near-term first-time-adoption burden.
  phaseImminence: { 1: 1.0, 2: 0.6, 3: 0.3 } as Record<IfrsPhase, number>,
  phaseWeight: 0.5,
  // Not yet having a sustainability report = larger compliance gap to close.
  noReportContribution: 0.5,
  // Per-industry exposure weighting is intentionally 0 until a SOURCED basis exists
  // (data red line — do not invent industry coefficients). Industry stays qualitative.
  industryWeight: 0,
};

export const URGENCY_METHODOLOGY_NOTE: BilingualText = {
  zhTW: '急迫度為本工具評分（非官方數值）：死線逼近度 ×40% ＋ 暴露強度 ×35% ＋ 規模 ×25%（權重為 RECC 策略定案）。各分項映射為可調參數；第二、三階段申報為年度精度，逼近度以 3/16 申報基準保守推估。',
  en: 'Urgency is a tool score (not an official figure): deadline proximity ×40% + exposure ×35% + scale ×25% (weights fixed by RECC strategy). Sub-mappings are adjustable; phase 2/3 filing is year-precise, with proximity conservatively estimated using a 16-Mar filing anchor.',
};
