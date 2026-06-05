// CBAM 暴露診斷 (Brief §3B/§6B). Actual-data + user ETS price → indicative conditional
// exposure. The official-default path reads the synced cache and is LOCKED until a
// verified sync (§7.3) — it NEVER returns an estimated number.

import type { CbamInput, CbamResult, CbamExposure, BilingualText } from '@/lib/diagnose/types';
import {
  CBAM_TIMELINE,
  CBAM_PENALTY_NOTE,
  CBAM_DE_MINIMIS_TONNES,
  CBAM_DE_MINIMIS_NOTE,
  CBAM_PRODUCTS,
  CBAM_MARKUP_NOTE,
  CITATION_CBAM_LEGAL,
  CITATION_CBAM_DEFAULTS,
} from '@/lib/diagnose/data/cbam';
import { CBAM_LIVE_CACHE } from '@/lib/diagnose/data/cbam-cache';

/** The promoted official default for (country, product, year) — passed in by the client after
 *  fetching /api/cbam-default. Absent → the official-default path stays locked (§7.3). */
export interface CbamDefaultLookup {
  value: number;
  min: number;
  max: number;
  n: number;
  asOf: string;
}

export function diagnoseCbam(input: CbamInput, defaultLookup?: CbamDefaultLookup): CbamResult {
  const product = CBAM_PRODUCTS.find((p) => p.key === input.product);
  const deMinimisEligible = product?.deMinimisEligible ?? false;
  const deMinimisExempt =
    deMinimisEligible && input.annualVolumeTonnes > 0 && input.annualVolumeTonnes <= CBAM_DE_MINIMIS_TONNES;

  const usingDefault = input.emissionsSource === 'official_default';
  const defaultsLocked = usingDefault && !defaultLookup;
  const etsPrice = input.etsPrice && input.etsPrice > 0 ? input.etsPrice : undefined;

  let exposure: CbamExposure = { deMinimisExempt, defaultsLocked };

  if (!deMinimisExempt) {
    if (input.emissionsSource === 'actual') {
      const spec = input.actualSpecificEmissions;
      if (spec && spec > 0) {
        // Actual-data path: emissions = volume × specific. No mark-up.
        const totalEmissions = input.annualVolumeTonnes * spec;
        exposure = {
          deMinimisExempt: false,
          defaultsLocked: false,
          totalEmissions,
          markupApplied: 0,
          etsPrice,
          indicativeExposureEUR: etsPrice ? totalEmissions * etsPrice : undefined,
        };
      }
    } else if (usingDefault && defaultLookup) {
      // Official-default path (human-baseline confirmed): volume × median default(incl. mark-up) × ETS.
      const totalEmissions = input.annualVolumeTonnes * defaultLookup.value;
      exposure = {
        deMinimisExempt: false,
        defaultsLocked: false,
        totalEmissions,
        etsPrice,
        indicativeExposureEUR: etsPrice ? totalEmissions * etsPrice : undefined,
        fromOfficialDefault: true,
        defaultPerTonne: defaultLookup.value,
        defaultN: defaultLookup.n,
        defaultAsOf: defaultLookup.asOf,
        exposureMinEUR: etsPrice ? input.annualVolumeTonnes * defaultLookup.min * etsPrice : undefined,
        exposureMaxEUR: etsPrice ? input.annualVolumeTonnes * defaultLookup.max * etsPrice : undefined,
      };
    }
  }

  const etsLabel = input.etsPrice && input.etsPrice > 0 ? String(input.etsPrice) : '—';
  const disclosures: BilingualText[] = [
    {
      zhTW: '本工具簡化為「排放量 × ETS 價＝指示性暴露區間」，實際因廠而異，並標此免責。',
      en: 'Simplified as “emissions × ETS price = indicative exposure range”; actual varies by facility (disclaimer noted).',
    },
    {
      zhTW: `在您輸入的 ETS 價（€${etsLabel}／噸）下計算；ETS 價每日變動。`,
      en: `Computed at your entered ETS price (€${etsLabel}/t); the ETS price changes daily.`,
    },
    {
      zhTW: '官方預設值（含加成）最遲 2027/12 修訂；本工具預設值路徑目前鎖定占位，數值同步狀態見上。',
      en: 'Official defaults (incl. mark-up) to be revised by Dec 2027 at the latest; this tool’s default-value path is currently locked/placeholder — sync status shown above.',
    },
    {
      zhTW: 'CBAM 繳費義務由歐盟進口商承擔，對出口商的影響取決於雙方商業條件。',
      en: 'The CBAM payment obligation is borne by the EU importer; impact on exporters depends on commercial terms.',
    },
  ];

  return {
    input,
    exposure,
    timeline: CBAM_TIMELINE,
    penaltyNote: CBAM_PENALTY_NOTE,
    deMinimisNote: CBAM_DE_MINIMIS_NOTE,
    markupNote: CBAM_MARKUP_NOTE,
    disclosures,
    citations: [CITATION_CBAM_LEGAL, CITATION_CBAM_DEFAULTS],
    cacheStatus: defaultLookup ? 'live' : CBAM_LIVE_CACHE.status,
  };
}
