// CBAM live default cache + human-baseline promotion (Brief §7 last mile). SERVER-ONLY
// (imports the 691KB staged JSON + uses KV) — never import from a client component.
//
// Computes a per-(country, product-category) representative marked-up default emission factor
// = MEDIAN of that category's official CN-code values (derived from the official Excel),
// plus the min–max spread. These are NOT live until a human explicitly confirms the baseline
// (promoteCbamBaseline); until then getCbamDefault() returns null → the official-default path
// stays locked and shows no number (Brief §7.2/§7.3). Method is transparent + labelled in UI.

import { kvCommand, leadStoreConfigured } from './lead-store';
import staging from './data/cbam-staging-values.json';

const LIVE_KEY = 'recc:cbam:live';

export interface CbamLiveDefault {
  m2026: number; m2027: number; m2028: number; // marked-up emission factor median (tCO₂e/t)
  min2026: number; max2026: number;
  min2027: number; max2027: number;
  min2028: number; max2028: number;
  n: number; // sample size (CN codes in the category)
}
export type CbamBaseline = Record<string, CbamLiveDefault>; // key `${country}|${product}`

export interface CbamLivePayload {
  status: 'live';
  asOf: string;
  syncedAt: string;
  source: string;
  baseline: CbamBaseline;
}

function stats(xs: number[]): { med: number; min: number; max: number } {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  const med = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  return { med: round(med), min: round(s[0]), max: round(s[s.length - 1]) };
}
const round = (x: number) => Math.round(x * 1000) / 1000;

/** Compute per-(country,product) representative defaults from the staged official values. */
export function computeBaselineFromStaging(): { baseline: CbamBaseline; count: number } {
  const groups: Record<string, { y26: number[]; y27: number[]; y28: number[] }> = {};
  for (const v of staging.values as Array<Record<string, unknown>>) {
    const product = v.product as string | null;
    const country = v.country as string;
    if (!product) continue;
    const g = (groups[`${country}|${product}`] ??= { y26: [], y27: [], y28: [] });
    if (typeof v.m2026 === 'number') g.y26.push(v.m2026);
    if (typeof v.m2027 === 'number') g.y27.push(v.m2027);
    if (typeof v.m2028 === 'number') g.y28.push(v.m2028);
  }
  const baseline: CbamBaseline = {};
  for (const [key, g] of Object.entries(groups)) {
    if (g.y26.length === 0) continue;
    const a = stats(g.y26);
    const b = g.y27.length ? stats(g.y27) : a;
    const c = g.y28.length ? stats(g.y28) : a;
    baseline[key] = {
      m2026: a.med, m2027: b.med, m2028: c.med,
      min2026: a.min, max2026: a.max,
      min2027: b.min, max2027: b.max,
      min2028: c.min, max2028: c.max,
      n: g.y26.length,
    };
  }
  return { baseline, count: Object.keys(baseline).length };
}

/** Promote the computed baseline to the live KV cache. `syncedAt` injected for determinism. */
export async function promoteCbamBaseline(syncedAt: string): Promise<number> {
  const { baseline, count } = computeBaselineFromStaging();
  const payload: CbamLivePayload = {
    status: 'live',
    asOf: String(staging.asOfDate),
    syncedAt,
    source: String(staging.source),
    baseline,
  };
  await kvCommand(['SET', LIVE_KEY, JSON.stringify(payload)]);
  return count;
}

/** Re-lock: remove the live cache (returns to placeholder). */
export async function revertCbamLive(): Promise<void> {
  await kvCommand(['DEL', LIVE_KEY]);
}

export async function getCbamLive(): Promise<CbamLivePayload | null> {
  if (!leadStoreConfigured()) return null;
  try {
    const raw = (await kvCommand(['GET', LIVE_KEY])) as string | null;
    return raw ? (JSON.parse(raw) as CbamLivePayload) : null;
  } catch {
    return null;
  }
}

export interface CbamDefaultLookup {
  value: number; // marked-up emission factor (tCO₂e/t) for the year
  min: number;
  max: number;
  n: number;
  asOf: string;
}

/** Look up the live default for (country, product, year). null = locked / not found. */
export async function getCbamDefault(country: string, product: string, year: number): Promise<CbamDefaultLookup | null> {
  const live = await getCbamLive();
  if (!live) return null;
  const d = live.baseline[`${country}|${product}`];
  if (!d) return null;
  if (year >= 2028) return { value: d.m2028, min: d.min2028, max: d.max2028, n: d.n, asOf: live.asOf };
  if (year === 2027) return { value: d.m2027, min: d.min2027, max: d.max2027, n: d.n, asOf: live.asOf };
  return { value: d.m2026, min: d.min2026, max: d.max2026, n: d.n, asOf: live.asOf };
}

export async function getCbamLiveStatus(): Promise<{ status: 'live' | 'locked'; asOf?: string; syncedAt?: string; count?: number }> {
  const live = await getCbamLive();
  if (!live) return { status: 'locked' };
  return { status: 'live', asOf: live.asOf, syncedAt: live.syncedAt, count: Object.keys(live.baseline).length };
}
