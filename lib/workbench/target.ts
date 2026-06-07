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

/** Which boundary a target is measured on. SBTi near-term targets are usually Scope 1+2 (with a
 *  SEPARATE Scope 3 target), and a company also carries a long-term net-zero target — so a real
 *  commitment is a *set* of targets, each on its own boundary. Comparing a Scope 1+2 base against
 *  the whole Scope 1+2+3 footprint is apples-to-oranges and falsely reads as wildly off-track. */
export type TargetScope = 'scope12' | 'scope123' | 'scope3';

/** One reduction target. A profile carries a *list* of these (E1): e.g. a near-term Scope 1+2 target,
 *  a near-term Scope 3 target, and a long-term net-zero target — each tracked on its own boundary. */
export interface TargetDef {
  id: string;
  label?: string; // free-text name, e.g. "近期 Scope 1+2" / "2050 淨零"
  scope: TargetScope;
  baseYear: number;
  baseEmissionsTonnes?: number; // base-year emissions on this scope (if blank, current assumed)
  targetYear: number;
  targetReductionPct: number;
}

export interface TargetTrajectory {
  id: string;
  label?: string;
  baseYear: number;
  baseEmissions: number;
  baseAssumed: boolean; // true when base-year emissions weren't entered (current used as proxy)
  targetYear: number;
  targetReductionPct: number;
  targetEmissions: number;
  series: { year: number; target: number }[]; // linear allowance path
  thisYear: number;
  thisYearTarget?: number; // on-trajectory allowance for the analysis year
  actual: number; // current emissions ON THE TARGET SCOPE (so base vs actual are comparable)
  scope: TargetScope; // which boundary the base/target/actual are all measured on
  gap?: number; // actual − thisYearTarget (positive = behind target)
  onTrack?: boolean;
  impliedAnnualPct: number; // linear %/yr of base implied by the target
  sbtiAligned: boolean; // impliedAnnualPct ≥ 4.2
}

/** Current emissions on a given target boundary, so base vs actual are always comparable (D1). */
function actualForScope(fp: ReturnType<typeof footprintSummary>, scope: TargetScope): number {
  if (scope === 'scope3') return fp.scope3;
  if (scope === 'scope123') return fp.total;
  return fp.scope12;
}

/** Build a trajectory for one target definition, or null if it isn't set coherently. */
export function trajectoryFor(def: TargetDef, fp: ReturnType<typeof footprintSummary>, thisYear: number): TargetTrajectory | null {
  const { baseYear, targetYear, targetReductionPct: pct } = def;
  if (!baseYear || !targetYear || pct == null || pct <= 0 || targetYear <= baseYear) return null;

  const scope = def.scope;
  const actual = actualForScope(fp, scope);
  const baseAssumed = def.baseEmissionsTonnes == null;
  const baseEmissions = round(def.baseEmissionsTonnes ?? actual);
  const targetEmissions = round(baseEmissions * (1 - pct / 100));
  const years = targetYear - baseYear;

  const series: { year: number; target: number }[] = [];
  for (let y = baseYear; y <= targetYear; y++) {
    series.push({ year: y, target: round(baseEmissions - (baseEmissions - targetEmissions) * ((y - baseYear) / years)) });
  }

  const thisYearTarget = thisYear >= baseYear && thisYear <= targetYear ? round(baseEmissions - (baseEmissions - targetEmissions) * ((thisYear - baseYear) / years)) : undefined;
  const gap = thisYearTarget != null ? round(actual - thisYearTarget) : undefined;
  const impliedAnnualPct = round(pct / years); // linear % of base per year

  return {
    id: def.id, label: def.label,
    baseYear, baseEmissions, baseAssumed, targetYear, targetReductionPct: pct, targetEmissions,
    series, thisYear, thisYearTarget, actual, scope,
    gap, onTrack: gap != null ? gap <= 0 : undefined,
    impliedAnnualPct, sbtiAligned: impliedAnnualPct >= SBTI_NEARTERM_ANNUAL_PCT,
  };
}

/** The legacy single-target fields synthesised into a TargetDef (the "primary" target). */
function primaryDef(profile: CompanyProfile): TargetDef | null {
  const { baseYear, targetYear, targetReductionPct: pct } = profile;
  if (!baseYear || !targetYear || pct == null || pct <= 0) return null;
  return {
    id: 'primary',
    label: undefined,
    scope: profile.targetScope ?? 'scope12',
    baseYear,
    baseEmissionsTonnes: profile.baseYearEmissionsTonnes,
    targetYear,
    targetReductionPct: pct,
  };
}

/** Build the primary trajectory (legacy single-target fields), or null. Kept for back-compat. */
export function targetTrajectory(profile: CompanyProfile): TargetTrajectory | null {
  const def = primaryDef(profile);
  if (!def) return null;
  return trajectoryFor(def, footprintSummary(profile), profile.year);
}

/** ALL target trajectories (E1): the primary (legacy fields) plus any extraTargets — each on its own
 *  boundary. This is what turns "manage one number" into "manage a set of SBTi-style commitments". */
export function allTargetTrajectories(profile: CompanyProfile): TargetTrajectory[] {
  const fp = footprintSummary(profile);
  const defs: TargetDef[] = [];
  const primary = primaryDef(profile);
  if (primary) defs.push(primary);
  for (const t of profile.extraTargets ?? []) defs.push(t);
  return defs.map((d) => trajectoryFor(d, fp, profile.year)).filter((t): t is TargetTrajectory => t != null);
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
