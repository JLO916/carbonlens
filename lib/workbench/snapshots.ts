// Dated workbench snapshots (localStorage) — so a returning user sees change over time. Stores
// totals only (no per-line detail, no PII), capped, newest-first. Aging reuses lib/diagnose/aging.

import type { WorkbenchResult } from './aggregate';
import type { PressureLevel } from '@/lib/diagnose/types';

const KEY = 'recc:workbench:snapshots';
const MAX = 60;

export interface Snapshot {
  at: string; // ISO timestamp (stamped client-side, injected for determinism in tests)
  year: number;
  feeTWD: number;
  feeUSD: number;
  cbamObligationEUR?: number;
  cbamGrossEUR?: number;
  pressure: PressureLevel;
  ifrsPhase: number;
}

type Storageish = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
function defaultStore(): Storageish | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** Slim a full result into a storable snapshot. `at` injected (client stamps new Date().toISOString()). */
export function snapshotOf(result: WorkbenchResult, at: string): Snapshot {
  return {
    at,
    year: result.year,
    feeTWD: Math.round(result.domestic.totalFeeTWD),
    feeUSD: Math.round(result.domestic.totalFeeUSD),
    cbamObligationEUR: result.cbam.totalObligationEUR,
    cbamGrossEUR: result.cbam.totalGrossEUR,
    pressure: result.supplyChain.pressureLevel,
    ifrsPhase: result.listed.ifrs.phase,
  };
}

export function loadSnapshots(s: Storageish | null = defaultStore()): Snapshot[] {
  if (!s) return [];
  try {
    const raw = s.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as Snapshot[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Prepend a snapshot (newest first), cap to MAX, persist. Returns the new list. */
export function appendSnapshot(snap: Snapshot, s: Storageish | null = defaultStore()): Snapshot[] {
  const list = [snap, ...loadSnapshots(s)].slice(0, MAX);
  if (s) {
    try {
      s.setItem(KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  return list;
}

export function clearSnapshots(s: Storageish | null = defaultStore()): void {
  if (!s) return;
  try {
    s.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
