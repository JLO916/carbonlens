// D2 — carbon fee ↔ CBAM cross-deduction. CBAM lets the EU importer deduct the carbon price already
// PAID in the country of origin (Reg (EU) 2023/956 Art 9). The workbench computes both the domestic
// carbon fee and the CBAM exposure but never connected them; this nets the origin carbon price paid
// against the CBAM obligation, per origin country, with an honest confidence level (recognition of
// the origin price by the EU is country-dependent and still being settled).

import { DEFAULT_EXCHANGE_RATES } from '@/lib/data/exchange-rates';
import type { CompanyProfile } from './profile';
import type { WorkbenchResult } from './aggregate';
import type { BilingualText, Citation } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 100) / 100;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const EUR_PER_USD = DEFAULT_EXCHANGE_RATES.EUR ?? 0.92;

export type DeductionConfidence = 'high' | 'medium' | 'low' | 'none';

/** EU recognition of the origin carbon price for CBAM deduction — country-dependent (CLAUDE.md). */
export const CBAM_DEDUCTION_CONFIDENCE: Record<string, DeductionConfidence> = {
  sg: 'high', kr: 'high', tw: 'medium', jp: 'medium', th: 'low', vn: 'none',
};

export const DEDUCTION_CONFIDENCE_LABEL: Record<DeductionConfidence, BilingualText> = {
  high: { zhTW: '高(明確碳價,直接適用)', en: 'High (clear price, direct)' },
  medium: { zhTW: '中(可抵,折算規則待協商)', en: 'Medium (deductible, rules TBD)' },
  low: { zhTW: '低(認定存疑)', en: 'Low (recognition uncertain)' },
  none: { zhTW: '無(無正式碳價)', en: 'None (no formal price)' },
};

export interface CbamDeductionLine {
  label: string;
  originCountry: string;
  obligationEUR: number; // gross CBAM obligation this year
  originPriceEUR: number; // origin carbon price paid, EUR per tCO₂e (effective)
  embeddedTonnes: number; // embedded emissions of the exported goods
  deductibleEUR: number; // min(obligation, originPrice × embedded)
  netEUR: number; // obligation − deductible
  confidence: DeductionConfidence;
}

export interface CbamDeduction {
  lines: CbamDeductionLine[];
  totalObligationEUR: number;
  totalDeductibleEUR: number;
  totalNetEUR: number;
}

/** Origin carbon price actually borne, EUR per tCO₂e — from that country's domestic engine result. */
function originPriceEUR(country: string, result: WorkbenchResult): number {
  const f = result.domestic.facilities.find((x) => x.facility.countryCode === country);
  if (!f) return 0;
  return Math.max(0, (f.result.effectiveRateUSD ?? 0) * EUR_PER_USD);
}

/** Net the origin carbon price paid against each priced CBAM line. Needs an ETS price (to back out
 *  embedded tonnes from the gross exposure). Returns null when nothing is computable. */
export function cbamCrossDeduction(profile: CompanyProfile, result: WorkbenchResult): CbamDeduction | null {
  const ets = profile.etsPrice;
  if (!ets || ets <= 0) return null;

  const lines: CbamDeductionLine[] = [];
  for (const { line, result: r } of result.cbam.lines) {
    const obligation = r.exposure.indicativeExposureEUR;
    const gross = r.exposure.grossExposureEUR;
    if (obligation == null || gross == null) continue; // locked / unpriced → skip
    const embeddedTonnes = round(gross / ets); // gross = embedded × ETS (factor 1)
    const price = round(originPriceEUR(line.originCountry, result));
    const deductibleEUR = round(Math.min(obligation, price * embeddedTonnes));
    lines.push({
      label: line.label,
      originCountry: line.originCountry,
      obligationEUR: round(obligation),
      originPriceEUR: price,
      embeddedTonnes,
      deductibleEUR,
      netEUR: round(obligation - deductibleEUR),
      confidence: CBAM_DEDUCTION_CONFIDENCE[line.originCountry] ?? 'none',
    });
  }
  if (!lines.length) return null;
  return {
    lines,
    totalObligationEUR: round(sum(lines.map((l) => l.obligationEUR))),
    totalDeductibleEUR: round(sum(lines.map((l) => l.deductibleEUR))),
    totalNetEUR: round(sum(lines.map((l) => l.netEUR))),
  };
}

export const CBAM_DEDUCTION_NOTE: BilingualText = {
  zhTW: '原產國已付碳價可自 CBAM 抵扣(Reg (EU) 2023/956 §9);抵扣受益者是歐盟進口商,你需提供已付碳價證明。歐盟對各國碳價之認定程度不同(信心分級),且折算規則仍在協商,以下為指示性估算。',
  en: 'The carbon price paid in the origin can be deducted from CBAM (Reg (EU) 2023/956 §9); the benefit accrues to the EU importer, who needs your proof of payment. EU recognition varies by country (confidence) and rules are still being settled — indicative only.',
};

export const CITATION_CBAM_DEDUCTION: Citation = {
  source: { zhTW: 'Regulation (EU) 2023/956 第 9 條(原產國已付碳價之抵扣)', en: 'Regulation (EU) 2023/956 Art. 9 (carbon price paid in origin)' },
  officialDocVersion: { zhTW: '抵扣金額與認定程度依歐盟實施細則與各國協商而定', en: 'Deduction and recognition depend on EU implementing acts and bilateral settlement' },
  asOfDate: '2026-06',
  url: 'https://eur-lex.europa.eu/eli/reg/2023/956/oj',
};
