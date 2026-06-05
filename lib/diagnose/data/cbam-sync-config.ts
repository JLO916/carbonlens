// CBAM sync configuration (§7). Two decoupled pipelines: (1) low-frequency default-value
// parse from EUR-Lex / taxation-customs; (2) high-frequency ETS price feed. Anomaly-check
// thresholds are conservative and configurable (§7.2 — 寧可多攔，由人確認).

import type { AnomalyThresholds, BilingualText } from '@/lib/diagnose/types';

export const CBAM_ANOMALY_THRESHOLDS: AnomalyThresholds = {
  singleValuePct: 0.15, // 單一預設值較上版變動 > ±15% → 示警
  batchPct: 0.1, // 單次同步中變動的值 > 10%（佔總筆數）→ 示警
  structurePct: 0.05, // 列數（CN 碼×國別）較上版變動 > ±5% → 示警
};

export const CBAM_SYNC_SOURCES = {
  // Pipeline 1 — defaults (low frequency)
  defaultsHtml: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AL_202502621',
  defaultsPdf: 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202502621',
  legislationHub:
    'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism/cbam-legislation-and-guidance_en',
  // Pipeline 2 — ETS price (high frequency). Not connected — no source provided yet.
  etsPriceSource: null as string | null,
};

export const CBAM_SYNC_CADENCE_NOTE: BilingualText = {
  zhTW: '預設值低頻同步（建議每月，或偵測 EUR-Lex／taxation-customs 有新版時觸發）；ETS 價高頻同步（每日／每週），為獨立管線。',
  en: 'Defaults sync at low frequency (monthly, or triggered when EUR-Lex / taxation-customs publishes a new version); ETS price syncs at high frequency (daily/weekly) on a separate pipeline.',
};
