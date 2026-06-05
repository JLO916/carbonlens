// STAGING cache for CBAM default values (Brief §7.1/§7.2/§7.3).
//
// UPDATE (2026-06): the official IR 2025/2621 PDF is >10MB (not one-shot fetchable), but
// the Commission also publishes a "for information purposes only" Excel of the same default
// values. `scripts/parse-cbam-defaults.py` downloads + parses it into
// `cbam-staging-values.json` (1,953 rows across the tool's 8 origin countries).
//
// Per the data red line, these are NOT promoted to the live cache and NOT shown as numbers
// in the calculator until they pass the §7.2 anomaly checks AND a human confirms the first
// baseline (the Excel is "for information"; legally binding values are in IR 2025/2621).
// The full values live in the JSON (not imported into client UI — only the summary below is).

import type { CbamCache, BilingualText } from '@/lib/diagnose/types';
import { CITATION_CBAM_DEFAULTS } from './cbam';

/** Summary of what the parser staged (safe for client UI — no per-row data). */
export const STAGED_COUNT = 1953;
export const STAGED_COUNTRIES = ['tw', 'cn', 'in', 'kr', 'jp', 'vn', 'th', 'tr'] as const;
export const STAGED_AS_OF = '2026-02-04';
export const STAGED_SOURCE: BilingualText = {
  zhTW: '歐盟官方「僅供參考」Excel（定義期預設值，DVs v20260204，2026/2/13）',
  en: 'EU official “for information” Excel (definitive-period default values, DVs v20260204, 13 Feb 2026)',
};

export const CBAM_STAGING_CACHE: CbamCache = {
  status: 'pending_human_baseline',
  defaultValues: [], // full rows in cbam-staging-values.json; not loaded into client
  gridFactors: [],
  meta: {
    officialDocVersion: CITATION_CBAM_DEFAULTS.officialDocVersion,
    asOfDate: STAGED_AS_OF,
    syncedAt: null,
    note: {
      zhTW: `已自官方「僅供參考」Excel 解析 ${STAGED_COUNT} 筆官方預設值（${STAGED_COUNTRIES.length} 國）至暫存;通過異常檢查與人工基線確認前不 promote 為 live、不顯示數字（法律約束力以 IR 2025/2621 為準）。`,
      en: `Parsed ${STAGED_COUNT} official default values (${STAGED_COUNTRIES.length} countries) from the official “for information” Excel into staging; not promoted to live / not shown until anomaly checks pass and a human confirms the baseline (legally binding values are in IR 2025/2621).`,
    },
  },
};
