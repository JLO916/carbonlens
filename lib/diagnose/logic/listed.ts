// 上市櫃揭露判定 (Brief §3A/§6A). Pure: data in → ListedResult out.

import type { ListedInput, ListedResult } from '@/lib/diagnose/types';
import {
  GRI_UNIVERSAL_OBLIGATION,
  IFRS_PHASES,
  IFRS_ADOPTION_BASIS_NOTE,
  DISCLOSURE_SCOPE,
} from '@/lib/diagnose/data/listed-disclosure';
import { computeUrgency } from './urgency';

export function diagnoseListed(input: ListedInput, today: Date = new Date()): ListedResult {
  const ifrs = IFRS_PHASES[input.capitalTier];
  const urgency = computeUrgency(input, ifrs, today);
  return {
    input,
    gri: GRI_UNIVERSAL_OBLIGATION, // GRI 普遍義務:不分階段一律適用 (§6A-1)
    ifrs,
    adoptionBasisNote: IFRS_ADOPTION_BASIS_NOTE,
    disclosureScope: DISCLOSURE_SCOPE,
    urgency,
  };
}
