// LIVE CBAM default-value cache. EMPTY + LOCKED until a sync passes the §7.2 anomaly
// checks AND a human confirms the first baseline (§7.3). The UI reads ONLY this cache and
// shows placeholders while locked. Never hand-edit emission values in here — they must
// arrive via the sync pipeline (cbam-sync.ts) from the official document (§7.1).

import type { CbamCache } from '@/lib/diagnose/types';
import { CITATION_CBAM_DEFAULTS } from './cbam';

export const CBAM_LIVE_CACHE: CbamCache = {
  status: 'locked',
  defaultValues: [],
  gridFactors: [],
  meta: {
    officialDocVersion: CITATION_CBAM_DEFAULTS.officialDocVersion,
    asOfDate: null,
    syncedAt: null,
    note: {
      zhTW: '官方預設值尚未經驗證同步寫入；暫以占位呈現，不估算。',
      en: 'Official defaults not yet populated by a verified sync; shown as placeholders, not estimated.',
    },
  },
};

export function isCbamDefaultsLive(cache: CbamCache = CBAM_LIVE_CACHE): boolean {
  return cache.status === 'live' && cache.defaultValues.length > 0;
}
