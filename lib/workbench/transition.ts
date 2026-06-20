// ②/④ — Taiwan "carbon fee → ETS (cap-and-trade)" transition outlook, plus the asset upside under a
// cap, and ③ the offset routes for residual emissions.
//
// RED LINE (the whole reason this is a separate, clearly-framed module): there is NO official Taiwan
// ETS cap, free-allocation ratio, or allowance price — trial trading is 2028. So EVERY ETS figure
// here is computed from the USER'S OWN assumptions (allowance price + free-allocation share) and is
// labelled illustrative, never a prediction. The carbon-FEE side uses the real engine. Offsets are
// listed qualitatively with no fabricated credit price.

import { facilityEmissionsTonnes } from './inventory';
import { applyReduction } from './reduction';
import { toDomesticInput } from './derive';
import { getCalculator } from '@/lib/calculators/domestic';
import type { CompanyProfile } from './profile';
import type { WorkbenchResult } from './aggregate';
import type { BilingualText } from '@/lib/diagnose/types';

export interface TransitionAssumptions {
  allowancePriceTWD: number; // NT$/tCO₂e — USER assumption (anchor: today's fee rate NT$300/t)
  freeAllocationPct: number; // % of current emissions granted free — USER assumption (early ETS ≈ high)
}

/** Neutral, clearly-labelled starting points (NOT official): price anchored to today's fee, free
 *  allocation high (early cap-and-trade typically grandfathers most allowances, tightening later). */
export const DEFAULT_TRANSITION_ASSUMPTIONS: TransitionAssumptions = { allowancePriceTWD: 300, freeAllocationPct: 80 };

export interface TransitionOutlook {
  applies: boolean; // only when there is a Taiwan facility
  twEmissionsTonnes: number; // Taiwan facilities' Scope 1+2
  feeNowTWD: number; // current carbon fee — REAL engine
  freeAllocationTonnes: number; // assumption × current emissions
  etsLiableTonnes: number; // emissions above free allocation
  etsCostTWD: number; // ILLUSTRATIVE: etsLiable × assumed price
  reductionPct: number; // the reduction applied for the "after" / asset view (from the target)
  reducedEmissionsTonnes: number;
  feeAfterTWD: number; // carbon fee after the reduction — REAL engine
  etsAfterTWD: number; // ILLUSTRATIVE ETS cost after the reduction
  surplusTonnes: number; // ④ asset face: free allocation NOT used after reduction = sellable
  surplusValueTWD: number; // ILLUSTRATIVE potential revenue from selling surplus allowances
  residualTonnes: number; // emissions remaining after reduction (what an offset would cover, ③)
}

function twFeeOf(p: CompanyProfile): number {
  return p.facilities
    .filter((f) => f.countryCode === 'tw')
    .reduce((a, f) => a + getCalculator('tw').calculate(toDomesticInput(f, p)).totalCarbonCost, 0);
}

const twEmissionsOf = (p: CompanyProfile): number =>
  p.facilities.filter((f) => f.countryCode === 'tw').reduce((a, f) => a + facilityEmissionsTonnes(f), 0);

export function transitionOutlook(
  profile: CompanyProfile,
  result: WorkbenchResult,
  a: TransitionAssumptions = DEFAULT_TRANSITION_ASSUMPTIONS,
  reductionPct = 0,
): TransitionOutlook {
  const applies = profile.facilities.some((f) => f.countryCode === 'tw');
  const emissions = Math.round(twEmissionsOf(profile));
  const price = Math.max(0, a.allowancePriceTWD);
  const freePct = Math.max(0, Math.min(100, a.freeAllocationPct));
  const free = Math.round((emissions * freePct) / 100);
  const k = Math.max(0, Math.min(100, reductionPct)) / 100;
  const reduced = Math.round(emissions * (1 - k));

  return {
    applies,
    twEmissionsTonnes: emissions,
    feeNowTWD: Math.round(result.domestic.totalFeeTWD),
    freeAllocationTonnes: free,
    etsLiableTonnes: Math.max(0, emissions - free),
    etsCostTWD: Math.round(Math.max(0, emissions - free) * price),
    reductionPct: Math.round(reductionPct),
    reducedEmissionsTonnes: reduced,
    feeAfterTWD: k > 0 ? Math.round(twFeeOf(applyReduction(profile, reductionPct, 'scope1'))) : Math.round(result.domestic.totalFeeTWD),
    etsAfterTWD: Math.round(Math.max(0, reduced - free) * price),
    surplusTonnes: Math.max(0, free - reduced),
    surplusValueTWD: Math.round(Math.max(0, free - reduced) * price),
    residualTonnes: reduced,
  };
}

/** ③ — offset/credit routes for residual emissions (qualitative; NO fabricated credit price). */
export interface OffsetRoute {
  name: BilingualText;
  use: BilingualText;
  caveat: BilingualText;
}

export const OFFSET_ROUTES: OffsetRoute[] = [
  {
    name: { zhTW: '國內自願減量額度', en: 'Domestic voluntary reduction credits' },
    use: { zhTW: '環境部自願減量／抵換專案產生的減量額度,目前可抵減部分碳費(碳費收費辦法),未來有望納入 ETS 履約。', en: 'Credits from MOENV voluntary-reduction / offset projects; today they offset part of the carbon fee, and may count toward ETS compliance later.' },
    caveat: { zhTW: '可抵比例與資格依環境部規定;額度無公開穩定行情,成本請自行查證。', en: 'Eligibility and limits per MOENV; no stable public price — verify your own cost.' },
  },
  {
    name: { zhTW: '國際碳權(巴黎協定第六條)', en: 'International credits (Paris Agreement Art. 6)' },
    use: { zhTW: '如台灣與巴拉圭合作的造林、電動巴士、農業減碳專案,依第 6.2／6.4 條機制移轉。', en: 'e.g. Taiwan–Paraguay afforestation, e-buses and agricultural projects, transferred under Art. 6.2 / 6.4.' },
    caveat: { zhTW: '能否用於台灣法遵抵減、可抵上限與相應調整(corresponding adjustment)依政策而定,仍在發展中。', en: 'Whether usable for Taiwan compliance, the cap, and corresponding adjustments are policy-dependent and still developing.' },
  },
  {
    name: { zhTW: '減量優先、抵換為輔', en: 'Reduce first, offset second' },
    use: { zhTW: 'SBTi 與品牌客戶多要求實質減量,碳權僅用於殘餘排放。先用「減碳鏡」壓低排放,再規劃抵換剩餘。', en: 'SBTi and brand customers expect real cuts — credits are for residual emissions only. Cut first (see the reduction lens), then plan offsets for the remainder.' },
    caveat: { zhTW: '過度依賴抵換可能不被客戶／SBTi 認可。', en: 'Over-reliance on offsets may not be accepted by customers / SBTi.' },
  },
];

export const TRANSITION_NOTE: BilingualText = {
  zhTW: '情境試算:台灣 ETS 目前尚無官方總量、免費配額比例與額度價格(2028 才試行交易)。下列 ETS 數字皆以「你設定的假設」計算,僅供壓力測試與規劃,非預測。碳費側為實際引擎試算。',
  en: 'Scenario tool: Taiwan’s ETS has no official cap, free-allocation ratio or allowance price yet (trial trading 2028). The ETS figures below are computed from YOUR assumptions — for stress-testing and planning, not a prediction. The carbon-fee side uses the real engine.',
};
