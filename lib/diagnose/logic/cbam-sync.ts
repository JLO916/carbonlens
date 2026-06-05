// CBAM default-value sync pipeline (§7.1) + anomaly checks (§7.2). The actual fetch/parse
// of the official document is a dedicated scheduled job (the doc is a >10MB PDF/HTML, not
// an API) — represented here by the ParseFn interface. This module owns the GATEKEEPING:
// compare a parsed batch to the previous verified cache, and only promote if it passes.

import type {
  CbamDefaultValue,
  CbamGridFactor,
  AnomalyThresholds,
  AnomalyResult,
  CbamCache,
} from '@/lib/diagnose/types';
import { CBAM_ANOMALY_THRESHOLDS } from '@/lib/diagnose/data/cbam-sync-config';

/** A real scheduled parser implements this (PDF/Excel extraction of Annex tables). */
export type ParseFn = () => Promise<{ defaultValues: CbamDefaultValue[]; gridFactors: CbamGridFactor[] }>;

/**
 * §7.2 anomaly checks. Compare incoming parsed values to the previous verified cache;
 * any trigger → do NOT auto-promote. For the first baseline (no previous values) there is
 * nothing to diff, so a human must confirm.
 */
export function runAnomalyChecks(
  incoming: CbamDefaultValue[],
  previous: CbamDefaultValue[],
  thresholds: AnomalyThresholds = CBAM_ANOMALY_THRESHOLDS,
): AnomalyResult {
  if (previous.length === 0) {
    return {
      passed: false,
      needsHumanBaseline: true,
      reasons: ['no_previous_baseline: first sync requires human confirmation'],
    };
  }

  const reasons: string[] = [];

  // Structural integrity — row-count change > ±structurePct.
  const rowDelta = Math.abs(incoming.length - previous.length) / previous.length;
  if (rowDelta > thresholds.structurePct) {
    reasons.push(`structure: row count moved ${(rowDelta * 100).toFixed(1)}% (> ${thresholds.structurePct * 100}%)`);
  }

  // Per-value change — single value moved > ±singleValuePct.
  const prevByKey = new Map(previous.map((v) => [`${v.cnCode}|${v.country}`, v.directDefaultTco2ePerT]));
  let changed = 0;
  let comparable = 0;
  for (const v of incoming) {
    const prev = prevByKey.get(`${v.cnCode}|${v.country}`);
    if (prev === undefined || prev === 0) continue;
    comparable += 1;
    const delta = Math.abs(v.directDefaultTco2ePerT - prev) / prev;
    if (delta > thresholds.singleValuePct) {
      changed += 1;
      reasons.push(`single: ${v.cnCode}/${v.country} moved ${(delta * 100).toFixed(1)}%`);
    }
  }

  // Batch change — share of values moved beyond the single threshold > batchPct.
  if (comparable > 0 && changed / comparable > thresholds.batchPct) {
    reasons.push(`batch: ${((changed / comparable) * 100).toFixed(1)}% of values moved beyond threshold (> ${thresholds.batchPct * 100}%)`);
  }

  return { passed: reasons.length === 0, needsHumanBaseline: false, reasons };
}

/**
 * Promote a parsed batch to the live cache ONLY if checks pass; otherwise keep serving the
 * previous verified cache and route the batch to staging for human review (§7.2).
 * `syncedAt` is injected (caller stamps the time) to keep this deterministic/testable.
 */
export function promoteIfPassed(
  incoming: CbamDefaultValue[],
  gridFactors: CbamGridFactor[],
  previous: CbamCache,
  syncedAt: string,
  check: AnomalyResult,
): { live: CbamCache; staged: CbamCache | null } {
  if (check.passed) {
    return {
      live: {
        status: 'live',
        defaultValues: incoming,
        gridFactors,
        meta: { ...previous.meta, asOfDate: syncedAt, syncedAt },
      },
      staged: null,
    };
  }
  return {
    live: previous, // keep serving the last verified cache
    staged: {
      status: 'pending_human_baseline',
      defaultValues: incoming,
      gridFactors,
      meta: { ...previous.meta, syncedAt },
    },
  };
}
