// Reduction lens (critique: "all stick, no map" — the tool quantifies obligations but offers no
// lever). RED LINE: we do NOT invent abatement NT$/tonne costs (no credible source). Instead the
// ONE lever — a target reduction % — flows through the SAME real engines: lower facility emissions
// → lower carbon fee (taiwanCalculator); lower ACTUAL CBAM SEE → lower CBAM. Levers are listed
// qualitatively only. Key honest insight: the official-default CBAM path does NOT reward your
// reductions — you must provide ACTUAL data to benefit.

import type { CompanyProfile } from './profile';
import type { BilingualText, CbamProductKey } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 1000) / 1000;

/** Reduction type — drives CBAM scope correctness (A2). Scope-2 (green power) cuts the carbon fee
 *  but, per CBAM rules, does NOT lower steel/aluminium/etc. embedded emissions (direct-only). */
export type ReductionType = 'scope1' | 'scope2';

/** CBAM embedded emissions include INDIRECT (Scope 2) only for cement & fertilizers. */
export function countsIndirect(product: CbamProductKey): boolean {
  return product === 'cement' || product === 'fertilizer';
}

/** Apply a target reduction % through the real engines. No cost fields.
 *  - Carbon fee (Taiwan Scope 1+2): always reduced (both scopes count).
 *  - CBAM actual SEE: scope-1 reductions cut every line; scope-2 (green power) cuts ONLY the
 *    products whose CBAM counts indirect (cement/fertilizer) — steel/aluminium stay (direct-only). */
export function applyReduction(profile: CompanyProfile, pct: number, type: ReductionType = 'scope1'): CompanyProfile {
  const k = Math.max(0, Math.min(100, pct)) / 100;
  if (k === 0) return profile;
  return {
    ...profile,
    facilities: profile.facilities.map((f) => ({
      ...f,
      annualEmissionsTonnes: Math.round(f.annualEmissionsTonnes * (1 - k)),
      // inventory facilities reduce their activity amounts so the computed total drops too
      activities: f.activities?.map((a) => ({ ...a, amount: round(a.amount * (1 - k)) })),
    })),
    cbamProducts: profile.cbamProducts.map((c) => {
      if (c.emissionsSource !== 'actual' || !c.actualSpecificEmissions) return c;
      const cbamAffected = type === 'scope1' || countsIndirect(c.product);
      return cbamAffected ? { ...c, actualSpecificEmissions: round(c.actualSpecificEmissions * (1 - k)) } : c;
    }),
  };
}

export interface ReductionLever {
  name: BilingualText;
  note: BilingualText; // qualitative — NO cost number
}

export const REDUCTION_LEVERS: ReductionLever[] = [
  {
    name: { zhTW: '綠電 / 再生能源（T-REC、PPA）', en: 'Green electricity (T-REC, PPA)' },
    note: { zhTW: '降低 Scope 2（外購電力）排放,直接減碳費並回應客戶 RE100 要求。', en: 'Cuts Scope 2 (purchased power) — lowers the carbon fee and answers customer RE100 asks.' },
  },
  {
    name: { zhTW: '能源效率（製程節能、汰換設備）', en: 'Energy efficiency (process & equipment)' },
    note: { zhTW: '降低 Scope 1/2,通常回收期較短,是最先盤的低垂果實。', en: 'Cuts Scope 1/2 — usually shorter payback; the first low-hanging fruit.' },
  },
  {
    name: { zhTW: '製程改善 / 低碳原料', en: 'Process change / low-carbon inputs' },
    note: { zhTW: '降低單位內含排放(SEE),直接壓低 CBAM——但需可查證數據才算數。', en: 'Lowers specific embedded emissions (SEE) — directly cuts CBAM, but only with verifiable data.' },
  },
  {
    name: { zhTW: '燃料轉換（燃煤→天然氣→電氣化）', en: 'Fuel switching (coal→gas→electrification)' },
    note: { zhTW: '降低 Scope 1 直接排放;與綠電搭配效果最大。', en: 'Cuts Scope 1 direct emissions; strongest paired with green power.' },
  },
];

export const REDUCTION_CBAM_NOTE: BilingualText = {
  zhTW: '注意:CBAM「官方預設值」路徑不會反映你的減量——只有提供「實際內含排放」數據,減碳才會降低你買家的 CBAM 成本。',
  en: 'Note: the CBAM “official default” path does NOT reflect your reductions — only ACTUAL embedded-emissions data lets your cuts lower your buyer’s CBAM cost.',
};
