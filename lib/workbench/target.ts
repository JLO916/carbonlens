// C1 — target management: turn base year + target % into a managed trajectory (the heart of an ESG
// cycle the tool was missing). Linear absolute pathway base→target; this-year allowance vs actual →
// gap / on-track; implied annual % vs the SBTi 1.5°C near-term minimum. RED LINE: the SBTi 4.2%/yr
// figure is sourced (SBTi Corporate Near-Term Criteria); no fabricated abatement.

import { footprintSummary } from './scope3';
import type { CompanyProfile } from './profile';
import type { BilingualText, Citation } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 100) / 100;

/** SBTi near-term 1.5°C minimum linear reduction ≈ 4.2%/yr of the base year (absolute contraction). */
export const SBTI_NEARTERM_ANNUAL_PCT = 4.2;

export interface TargetTrajectory {
  baseYear: number;
  baseEmissions: number;
  baseAssumed: boolean; // true when base-year emissions weren't entered (current used as proxy)
  targetYear: number;
  targetReductionPct: number;
  targetEmissions: number;
  series: { year: number; target: number }[]; // linear allowance path
  thisYear: number;
  thisYearTarget?: number; // on-trajectory allowance for the analysis year
  actual: number; // current whole footprint (Scope 1+2+3)
  gap?: number; // actual − thisYearTarget (positive = behind target)
  onTrack?: boolean;
  impliedAnnualPct: number; // linear %/yr of base implied by the target
  sbtiAligned: boolean; // impliedAnnualPct ≥ 4.2
}

/** Build the trajectory, or null if base year / target year / target % aren't set coherently. */
export function targetTrajectory(profile: CompanyProfile): TargetTrajectory | null {
  const baseYear = profile.baseYear;
  const targetYear = profile.targetYear;
  const pct = profile.targetReductionPct;
  if (!baseYear || !targetYear || pct == null || pct <= 0 || targetYear <= baseYear) return null;

  const fp = footprintSummary(profile);
  const actual = fp.total;
  const baseAssumed = profile.baseYearEmissionsTonnes == null;
  const baseEmissions = round(profile.baseYearEmissionsTonnes ?? actual);
  const targetEmissions = round(baseEmissions * (1 - pct / 100));
  const years = targetYear - baseYear;

  const series: { year: number; target: number }[] = [];
  for (let y = baseYear; y <= targetYear; y++) {
    series.push({ year: y, target: round(baseEmissions - (baseEmissions - targetEmissions) * ((y - baseYear) / years)) });
  }

  const thisYear = profile.year;
  const thisYearTarget = thisYear >= baseYear && thisYear <= targetYear ? round(baseEmissions - (baseEmissions - targetEmissions) * ((thisYear - baseYear) / years)) : undefined;
  const gap = thisYearTarget != null ? round(actual - thisYearTarget) : undefined;
  const impliedAnnualPct = round(pct / years); // linear % of base per year

  return {
    baseYear, baseEmissions, baseAssumed, targetYear, targetReductionPct: pct, targetEmissions,
    series, thisYear, thisYearTarget, actual,
    gap, onTrack: gap != null ? gap <= 0 : undefined,
    impliedAnnualPct, sbtiAligned: impliedAnnualPct >= SBTI_NEARTERM_ANNUAL_PCT,
  };
}

export const SBTI_NOTE: BilingualText = {
  zhTW: `SBTi 近期目標(1.5°C)最低要求約每年線性減 ${SBTI_NEARTERM_ANNUAL_PCT}%(以基準年絕對量計),目標年通常為提交後 5–10 年。本軌跡為線性絕對路徑,僅供管理對照,非 SBTi 正式驗證。`,
  en: `SBTi near-term (1.5°C) requires ≈${SBTI_NEARTERM_ANNUAL_PCT}%/yr linear absolute reduction from the base year, with a target year 5–10 years out. This is a linear pathway for management tracking — not official SBTi validation.`,
};

export const CITATION_SBTI: Citation = {
  source: { zhTW: 'SBTi 企業近期目標準則(1.5°C 線性絕對路徑最低 4.2%/年)', en: 'SBTi Corporate Near-Term Criteria (1.5°C linear absolute, min 4.2%/yr)' },
  officialDocVersion: { zhTW: '門檻為一般指引;實際目標須經 SBTi 方法與驗證', en: 'Threshold is general guidance; actual targets require SBTi methods + validation' },
  asOfDate: '2026-06',
  url: 'https://sciencebasedtargets.org/',
};
