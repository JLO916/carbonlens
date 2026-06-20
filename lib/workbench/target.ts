// C1 — target management: turn base year + target % into a managed trajectory (the heart of an ESG
// cycle the tool was missing). Linear absolute pathway base→target; this-year allowance vs actual →
// gap / on-track; implied annual % vs the SBTi 1.5°C near-term minimum. RED LINE: the SBTi 4.2%/yr
// figure is sourced (SBTi Corporate Near-Term Criteria); no fabricated abatement.

import { footprintSummary } from './scope3';
import type { CompanyProfile } from './profile';
import type { BilingualText, Citation } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 100) / 100;

// R4 #8 — the SBTi check must depend on the target's scope AND term, not one 4.2% for everything:
//   near-term Scope 1+2 (and combined)  → 1.5°C ≈ 4.2%/yr absolute
//   near-term Scope 3                   → well-below-2°C floor ≈ 2.5%/yr absolute (SBTi Scope 3 min)
//   long-term (net-zero, ~2050)         → ≥90% absolute reduction (SBTi Net-Zero Standard), a DEPTH
//                                          criterion, not an annual rate — so a −90%/2050 target is
//                                          aligned and must NOT be failed by the 4.2%/yr near-term rule.
export const SBTI_NEARTERM_15C_PCT = 4.2;
export const SBTI_NEARTERM_SCOPE3_PCT = 2.5;
export const SBTI_NETZERO_REDUCTION_PCT = 90;
export const SBTI_LONGTERM_FROM_YEAR = 2045; // targetYear ≥ this is treated as a long-term/net-zero target
/** Back-compat alias (the near-term 1.5°C rate); prefer the scope/term-aware fields on a trajectory. */
export const SBTI_NEARTERM_ANNUAL_PCT = SBTI_NEARTERM_15C_PCT;

export type SbtiTerm = 'near' | 'long';
export interface SbtiCheck { aligned: boolean; term: SbtiTerm; basisPct: number; kind: 'rate' | 'netzero' }

/** Which SBTi criterion a target is judged against, given its scope, term and depth. */
export function sbtiCheckFor(scope: TargetScope, targetYear: number, baseYear: number, reductionPct: number, impliedAnnualPct: number): SbtiCheck {
  const term: SbtiTerm = targetYear - baseYear >= 10 && targetYear >= SBTI_LONGTERM_FROM_YEAR ? 'long' : 'near';
  if (term === 'long') return { aligned: reductionPct >= SBTI_NETZERO_REDUCTION_PCT, term, basisPct: SBTI_NETZERO_REDUCTION_PCT, kind: 'netzero' };
  const basisPct = scope === 'scope3' ? SBTI_NEARTERM_SCOPE3_PCT : SBTI_NEARTERM_15C_PCT;
  return { aligned: impliedAnnualPct >= basisPct, term, basisPct, kind: 'rate' };
}

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
  sbtiAligned: boolean; // aligned to the SBTi criterion for THIS target's scope + term
  sbtiTerm: SbtiTerm; // 'near' (rate-based) | 'long' (net-zero depth)
  sbtiBasisPct: number; // the threshold used: 4.2 / 2.5 (%/yr) or 90 (% reduction) for net-zero
  sbtiKind: 'rate' | 'netzero'; // whether the check is an annual rate or a net-zero depth
}

/** Current emissions on a given target boundary, so base vs actual are always comparable (D1). */
function actualForScope(fp: ReturnType<typeof footprintSummary>, scope: TargetScope): number {
  if (scope === 'scope3') return fp.scope3;
  if (scope === 'scope123') return fp.total;
  return fp.scope12;
}

/** Hard bounds for trajectory years. Clamping here (not only in the form) means a bad persisted
 *  value — e.g. the pre-fix "2000050" typo artefact still sitting in localStorage — can never
 *  explode the series into millions of points and freeze the page (R4 #2). */
const YEAR_MIN = 1990;
const YEAR_MAX = 2100;
const clampYear = (y: number) => Math.min(YEAR_MAX, Math.max(YEAR_MIN, y));

/** Build a trajectory for one target definition, or null if it isn't set coherently. */
export function trajectoryFor(def: TargetDef, fp: ReturnType<typeof footprintSummary>, thisYear: number): TargetTrajectory | null {
  const pct = def.targetReductionPct;
  if (!def.baseYear || !def.targetYear || pct == null || pct <= 0 || def.targetYear <= def.baseYear) return null;
  const baseYear = clampYear(def.baseYear);
  const targetYear = clampYear(def.targetYear);
  if (targetYear <= baseYear) return null;

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
    impliedAnnualPct,
    ...(() => { const c = sbtiCheckFor(scope, targetYear, baseYear, pct, impliedAnnualPct); return { sbtiAligned: c.aligned, sbtiTerm: c.term, sbtiBasisPct: c.basisPct, sbtiKind: c.kind }; })(),
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
