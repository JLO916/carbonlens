// CBAM live default lookup + human-baseline promotion (Brief §7 last mile). SERVER-ONLY
// (imports the 691KB staged JSON + uses KV) — never import from a client component.
//
// V2 (CN-code level): instead of a per-category MEDIAN (statistical noise), we return the
// EXACT official default value for the user's CN code. Promotion writes only a small "unlock
// flag" to KV; the per-CN values are read from the repo JSON (server-side) gated by that flag.
// Until a human confirms the baseline (promoteCbamBaseline), every lookup returns null → the
// official-default path stays locked and shows no number (Brief §7.2/§7.3).

import { kvCommand, leadStoreConfigured } from './lead-store';
import staging from './data/cbam-staging-values.json';

const LIVE_KEY = 'recc:cbam:live';

interface StagedRow {
  country: string;
  product: string | null;
  cnCode: string;
  description: string;
  // A few rows give a `direct` value only (no marked-up total) → these fields can be null.
  direct: number | null;
  indirect: number | null;
  total: number | null;
  m2026: number | null;
  m2027: number | null;
  m2028: number | null;
}
const ROWS = staging.values as StagedRow[];

/** Marked-up emission factor field for the CBAM definitive-period year. */
function yearField(year: number): 'm2026' | 'm2027' | 'm2028' {
  if (year >= 2028) return 'm2028';
  if (year === 2027) return 'm2027';
  return 'm2026';
}
const num = (x: number | null | undefined): number | null => (typeof x === 'number' ? x : null);
/** A row is priceable only if it has at least one marked-up value (some give `direct` only). */
const isPriceable = (r: StagedRow) => num(r.m2026) !== null || num(r.m2027) !== null || num(r.m2028) !== null;
const round = (x: number) => Math.round(x * 1000) / 1000;
/** Implied mark-up % from the official data itself (value/base − 1), so the label always
 *  matches the number regardless of any hardcoded schedule. */
const impliedMarkupPct = (value: number, base: number) => (base > 0 ? Math.round((value / base - 1) * 100) : 0);

// ---- Promotion flag (KV) ----

export interface CbamLivePayload {
  status: 'live';
  asOf: string;
  syncedAt: string;
  source: string;
  cnCount: number;
  categoryCount: number;
}

/** Distinct (country|product) categories and total CN rows in the staged official data. */
export function stagingSummary(): { rows: number; categories: number; countries: number; asOf: string; source: string } {
  const cats = new Set<string>();
  const countries = new Set<string>();
  for (const r of ROWS) {
    if (r.product) cats.add(`${r.country}|${r.product}`);
    countries.add(r.country);
  }
  return {
    rows: ROWS.length,
    categories: cats.size,
    countries: countries.size,
    asOf: String(staging.asOfDate),
    source: String(staging.source),
  };
}

/** Promote: write the unlock flag. The per-CN values live in the repo JSON (read on lookup);
 *  KV only records that a human confirmed the baseline + when. `syncedAt` injected for determinism. */
export async function promoteCbamBaseline(syncedAt: string): Promise<number> {
  const sum = stagingSummary();
  const payload: CbamLivePayload = {
    status: 'live',
    asOf: sum.asOf,
    syncedAt,
    source: sum.source,
    cnCount: sum.rows,
    categoryCount: sum.categories,
  };
  await kvCommand(['SET', LIVE_KEY, JSON.stringify(payload)]);
  return sum.rows;
}

/** Re-lock: remove the unlock flag (returns to placeholder). */
export async function revertCbamLive(): Promise<void> {
  await kvCommand(['DEL', LIVE_KEY]);
}

/** Read the unlock flag. Tolerates the legacy payload shape (which also had status:'live'). */
export async function getCbamLive(): Promise<{ status: 'live'; asOf: string; syncedAt?: string } | null> {
  if (!leadStoreConfigured()) return null;
  try {
    const raw = (await kvCommand(['GET', LIVE_KEY])) as string | null;
    if (!raw) return null;
    const p = JSON.parse(raw) as { status?: string; asOf?: string; syncedAt?: string };
    if (p.status !== 'live') return null;
    return { status: 'live', asOf: String(p.asOf ?? staging.asOfDate), syncedAt: p.syncedAt };
  } catch {
    return null;
  }
}

export async function getCbamLiveStatus(): Promise<{ status: 'live' | 'locked'; asOf?: string; syncedAt?: string }> {
  const live = await getCbamLive();
  if (!live) return { status: 'locked' };
  return { status: 'live', asOf: live.asOf, syncedAt: live.syncedAt };
}

// ---- Public lookups (gated by the unlock flag) ----

/** CN-code options for a (country, product) category — public nomenclature, no emission value.
 *  Returned regardless of unlock state so the form can offer choices (values stay gated). */
export function getCnOptions(country: string, product: string): { cnCode: string; description: string }[] {
  const seen = new Set<string>();
  const out: { cnCode: string; description: string }[] = [];
  for (const r of ROWS) {
    if (r.country !== country || r.product !== product) continue;
    if (!isPriceable(r)) continue; // hide CN codes with no official marked-up value (can't price them)
    if (seen.has(r.cnCode)) continue;
    seen.add(r.cnCode);
    out.push({ cnCode: r.cnCode, description: r.description });
  }
  return out.sort((a, b) => a.cnCode.localeCompare(b.cnCode));
}

export interface CbamCnLookup {
  mode: 'cn';
  cnCode: string;
  description: string;
  value: number; // marked-up official default (tCO₂e/t) for the year
  base: number; // official embedded total before mark-up
  markupPct: number;
  asOf: string;
}

/** Exact official default for (country, CN code, year). null = locked / not found. */
export async function getCbamDefaultByCn(country: string, cnCode: string, year: number): Promise<CbamCnLookup | null> {
  const live = await getCbamLive();
  if (!live) return null;
  const f = yearField(year);
  const row = ROWS.find((r) => r.country === country && r.cnCode === cnCode);
  if (!row) return null;
  const raw = num(row[f]);
  if (raw === null) return null; // no official marked-up value for this CN/year → stay locked
  const base = num(row.total);
  return {
    mode: 'cn',
    cnCode: row.cnCode,
    description: row.description,
    value: round(raw),
    base: base !== null ? round(base) : round(raw),
    markupPct: base !== null ? impliedMarkupPct(raw, base) : 0,
    asOf: live.asOf,
  };
}

export interface CbamRangeLookup {
  mode: 'range';
  min: number;
  max: number;
  n: number; // CN codes in the category
  asOf: string;
}

/** Honest category range (min–max of the marked-up official values) for when the user does
 *  NOT know their CN code — no point estimate. null = locked / empty. */
export async function getCbamCategoryRange(country: string, product: string, year: number): Promise<CbamRangeLookup | null> {
  const live = await getCbamLive();
  if (!live) return null;
  const f = yearField(year);
  const xs: number[] = [];
  for (const r of ROWS) {
    if (r.country !== country || r.product !== product) continue;
    const v = num(r[f]);
    if (v !== null) xs.push(v); // skip rows with no marked-up value (else null→0 poisons the min)
  }
  if (xs.length === 0) return null;
  return { mode: 'range', min: round(Math.min(...xs)), max: round(Math.max(...xs)), n: xs.length, asOf: live.asOf };
}
