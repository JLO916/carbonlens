// Classification helpers — ease the inputs that are genuinely hard to self-classify
// (critique: "the hardest part is classification, but the tool assumes you know"). These are
// soft, labelled hints / derivations, NOT authoritative claims.

import { IFRS_PHASES } from '@/lib/diagnose/data/listed-disclosure';
import type { CapitalTier, IfrsPhaseInfo, BusinessModel, BilingualText } from '@/lib/diagnose/types';

/** Derive the IFRS S1/S2 phase + deadlines straight from capital tier (FSC-sourced mapping). */
export function ifrsPhaseFromCapital(tier: CapitalTier): IfrsPhaseInfo {
  return IFRS_PHASES[tier];
}

const MODEL_BY_INDUSTRY: Record<string, BusinessModel> = {
  electronics: 'odm_oem',
  machinery: 'odm_oem',
  metals: 'component',
  chemicals: 'component',
  cement: 'component',
  textiles: 'odm_oem',
  food: 'brand',
  retail: 'brand',
};

/** A soft starting suggestion for business model by industry (Taiwan manufacturing tendencies).
 *  Labelled as a hint — the user should confirm; it only sets a sensible default. */
export function suggestBusinessModel(industry: string): { businessModel: BusinessModel; note: BilingualText } {
  const businessModel = MODEL_BY_INDUSTRY[industry] ?? 'odm_oem';
  return {
    businessModel,
    note: {
      zhTW: '依產業給的「起點」建議,請依你實際在價值鏈的位置調整(會影響哪些 Scope 3 類別是你的)。',
      en: 'A starting suggestion by industry — adjust to your actual position in the value chain (it changes which Scope 3 categories are yours).',
    },
  };
}

/** Public framework member-list pointers — the lookup IS the work; we point, not assert. */
export const FRAMEWORK_LOOKUP_HINT: BilingualText = {
  zhTW: '不確定客戶承諾了哪些框架?查 RE100 / SBTi / CDP 的公開會員名單,確認你的主要品牌客戶是否在列——這份查找本身就是工作的一部分。',
  en: 'Unsure which frameworks your customers committed to? Check the public RE100 / SBTi / CDP member lists for your key brand customers — this lookup is itself part of the work.',
};
