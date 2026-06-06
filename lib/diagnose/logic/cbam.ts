// CBAM 暴露診斷 (Brief §3B/§6B). Actual-data + user ETS price → indicative conditional
// exposure. The official-default path reads the synced cache and is LOCKED until a verified
// sync (§7.3) — it NEVER returns an estimated number.
//
// V2: the official-default path returns the EXACT value for the user's CN code ('cn' mode),
// or — if they don't know their CN code — an honest category min–max range with NO point
// estimate ('range' mode). It never invents a single representative number.

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

/** The promoted official default the client fetched (from /api/cbam-default). Two shapes:
 *  - cn: the exact marked-up value for the user's CN code.
 *  - range: the category min–max (CN unknown) — honest spread, no point estimate.
 *  Absent → the official-default path stays locked (§7.3). */
export type CbamDefaultLookup =
  | { mode: 'cn'; cnCode: string; description: string; value: number; base: number; markupPct: number; asOf: string }
  | { mode: 'range'; min: number; max: number; n: number; asOf: string };

export function diagnoseCbam(input: CbamInput, defaultLookup?: CbamDefaultLookup): CbamResult {
  const product = CBAM_PRODUCTS.find((p) => p.key === input.product);
  const deMinimisEligible = product?.deMinimisEligible ?? false;
  const deMinimisExempt =
    deMinimisEligible && input.annualVolumeTonnes > 0 && input.annualVolumeTonnes <= CBAM_DE_MINIMIS_TONNES;

  const usingDefault = input.emissionsSource === 'official_default';
  const defaultsLocked = usingDefault && !defaultLookup;
  const etsPrice = input.etsPrice && input.etsPrice > 0 ? input.etsPrice : undefined;
  const vol = input.annualVolumeTonnes;

  let exposure: CbamExposure = { deMinimisExempt, defaultsLocked };

  if (!deMinimisExempt) {
    if (input.emissionsSource === 'actual') {
      const spec = input.actualSpecificEmissions;
      if (spec && spec > 0) {
        // Actual-data path: emissions = volume × specific. No mark-up.
        const totalEmissions = vol * spec;
        exposure = {
          deMinimisExempt: false,
          defaultsLocked: false,
          totalEmissions,
          markupApplied: 0,
          etsPrice,
          indicativeExposureEUR: etsPrice ? totalEmissions * etsPrice : undefined,
        };
      }
    } else if (usingDefault && defaultLookup?.mode === 'cn') {
      // Exact official default for the user's CN code (incl. mark-up). One number, sourced.
      const totalEmissions = vol * defaultLookup.value;
      const indicative = etsPrice ? totalEmissions * etsPrice : undefined;
      exposure = {
        deMinimisExempt: false,
        defaultsLocked: false,
        totalEmissions,
        etsPrice,
        indicativeExposureEUR: indicative,
        exposureMinEUR: indicative,
        exposureMaxEUR: indicative,
        fromOfficialDefault: true,
        defaultMode: 'cn',
        defaultCnCode: defaultLookup.cnCode,
        defaultDescription: defaultLookup.description,
        defaultPerTonne: defaultLookup.value,
        defaultBase: defaultLookup.base,
        defaultMarkupPct: defaultLookup.markupPct,
        defaultAsOf: defaultLookup.asOf,
      };
    } else if (usingDefault && defaultLookup?.mode === 'range') {
      // CN unknown → honest category range, NO point estimate.
      exposure = {
        deMinimisExempt: false,
        defaultsLocked: false,
        etsPrice,
        indicativeExposureEUR: undefined,
        exposureMinEUR: etsPrice ? vol * defaultLookup.min * etsPrice : undefined,
        exposureMaxEUR: etsPrice ? vol * defaultLookup.max * etsPrice : undefined,
        fromOfficialDefault: true,
        defaultMode: 'range',
        defaultN: defaultLookup.n,
        defaultAsOf: defaultLookup.asOf,
      };
    }
  }

  // §2 — exporter's commercial share: apply the pass-through % to whatever exposure exists.
  const ptRaw = input.passThroughPct;
  const pt = typeof ptRaw === 'number' && ptRaw > 0 && ptRaw <= 100 ? ptRaw : undefined;
  if (pt && !exposure.deMinimisExempt && !exposure.defaultsLocked) {
    const share = (x?: number) => (x !== undefined ? Math.round(x * (pt / 100)) : undefined);
    exposure.passThroughPct = pt;
    exposure.exporterShareEUR = share(exposure.indicativeExposureEUR);
    exposure.exporterShareMinEUR = share(exposure.exposureMinEUR);
    exposure.exporterShareMaxEUR = share(exposure.exposureMaxEUR);
  }

  const etsLabel = etsPrice ? String(etsPrice) : '—';
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
      zhTW: '官方預設值路徑回傳「您 CN 碼的那一筆官方值（含加成）」；不確定 CN 碼時改顯示該類別官方值範圍，不給單一估值。',
      en: 'The official-default path returns the exact official value for your CN code (incl. mark-up); when the CN code is unknown it shows the category’s official-value range — never a single estimate.',
    },
    {
      zhTW: 'CBAM 繳費義務由歐盟進口商承擔，對出口商的影響取決於雙方商業條件（可被轉嫁、壓價或換供應商）。',
      en: 'The CBAM payment obligation is borne by the EU importer; impact on exporters depends on commercial terms (pass-through, price pressure, or supplier switching).',
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
