// Snapshot-age helper, shared by CitationTag (data freshness) and the workbench snapshot history.
// Pure + dependency-free so it can be unit-tested without a DOM.

export const STALE_MONTHS = 9;

/** Whole months between a snapshot date (YYYY-MM or YYYY-MM-DD) and `now`. null if unparseable. */
export function monthsSince(asOf: string, now: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})/.exec(asOf);
  if (!m) return null;
  return (now.getFullYear() - Number(m[1])) * 12 + (now.getMonth() + 1 - Number(m[2]));
}
