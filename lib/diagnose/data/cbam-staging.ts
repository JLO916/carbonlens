// STAGING cache for the best-effort EUR-Lex parse (the "try to parse" path). Per the
// brief, the official IR 2025/2621 text is a >10MB legal PDF/HTML — too large for a
// one-shot fetch — and the FIRST baseline must be human-confirmed before going live
// (§7.2 anomaly checks compare to a previous version, which does not exist for the
// baseline). So values stay EMPTY here (NO fabricated numbers); status is
// 'pending_human_baseline'. A dedicated scheduled parser (PDF/Excel) populates this, then
// a human promotes it into the live cache (cbam-cache.ts).

import type { CbamCache } from '@/lib/diagnose/types';
import { CITATION_CBAM_DEFAULTS } from './cbam';

export const CBAM_STAGING_CACHE: CbamCache = {
  status: 'pending_human_baseline',
  defaultValues: [],
  gridFactors: [],
  meta: {
    officialDocVersion: CITATION_CBAM_DEFAULTS.officialDocVersion,
    asOfDate: null,
    syncedAt: null,
    note: {
      zhTW: '已確認官方文件身分（IR 2025/2621，2025/12/16，OJ L_202502621）；文件 >10MB 無法一次性抓取解析，且官方 annex 編號（直接／間接／電力）需於基線比對確認。數值待專屬解析器（PDF／官方 Excel）填入並經人工基線確認後，才 promote 為 live。',
      en: 'Official document identified (IR 2025/2621, 16 Dec 2025, OJ L_202502621); the >10MB document can’t be fetched/parsed in one shot, and the exact annex numbering (direct/indirect/electricity) must be confirmed at baseline. Values await a dedicated parser (PDF/official Excel) and human baseline confirmation before promotion to live.',
    },
  },
};
