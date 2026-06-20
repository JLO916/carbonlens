// Customer scorecard — how a supplier is actually evaluated by its (multiple) brand customers on
// carbon/ESG. Grounded in INDUSTRY-COMMON practice, not one deck: the requirement dimensions map to
// real frameworks (CDP bands, EcoVadis percentile medals, SBTi near-term/net-zero, RE100, ISO 14067
// PCF, third-party assurance, supplier-engagement à la Walmart Gigaton). Each customer carries its own
// thresholds (gate = pass/fail "ticket"; scored = points), and the engine reads the user's CURRENT
// status from their computed inventory/targets + a few self-declared external ratings, then flags
// per-customer met/partial/unmet + an order-risk level + which single gap unblocks the most customers.
// RED LINE: status is read from the user's own data (nothing fabricated); customer thresholds are
// user-entered (templates are clearly-labelled illustrative starting points, not real contracts).

import { footprintSummary } from './scope3';
import { computeInventory } from './inventory';
import { allTargetTrajectories } from './target';
import type { CompanyProfile } from './profile';
import type { CountryCode } from '@/lib/types';
import type { BilingualText } from '@/lib/diagnose/types';

const round = (x: number) => Math.round(x * 10) / 10;

export type ScorecardDimension =
  | 'scope12' | 'scope3' | 'target' | 'sbti' | 'netzero'
  | 'renewable' | 'assurance' | 'pcf'
  | 'cdp' | 'ecovadis' | 'spcsa' | 'supplierEngagement';

export type ReqKind = 'gate' | 'scored';

/** One requirement a customer places on the supplier. Threshold fields are interpreted per dimension. */
export interface CustomerRequirement {
  id: string;
  dimension: ScorecardDimension;
  kind: ReqKind; // gate = ticket/veto; scored = contributes points
  minPct?: number; // renewable% ≥ ; reduction% ≥ ; supplier-engagement% ≥
  byYear?: number; // target/RE commitment year (≤)
  tier?: string; // cdp 'A'… ; ecovadis 'gold'… ; spcsa 'yearbook'
  points?: number; // weight for scored kind (default 1)
}

export interface CustomerLine {
  id: string;
  name: string;
  importance?: 'key' | 'major' | 'minor'; // order weight
  requirements: CustomerRequirement[];
}

/** External ratings the tool can't compute — the user self-declares their current standing. */
export interface SelfRatings {
  cdp?: string; // 'A'|'A-'|'B'|'B-'|'C'|'C-'|'D'|'D-'|'none'
  ecovadis?: string; // 'platinum'|'gold'|'silver'|'bronze'|'none'
  spcsa?: string; // 'yearbook'|'assessed'|'none'
  supplierEngagementPct?: number; // % of own suppliers with a reduction target
  // R4 #8 — SBTi is an EXTERNAL commitment/validation the tool can't compute (only the implied RATE
  // can be checked). A customer's "SBTi" gate asks whether you've committed/validated — so the
  // commitment is self-declared and a rate-aligned-but-uncommitted target must NOT read as met.
  sbti?: 'validated' | 'committed' | 'none';
}

export const DIMENSION_LABEL: Record<ScorecardDimension, BilingualText> = {
  scope12: { zhTW: '揭露 Scope 1+2', en: 'Disclose Scope 1+2' },
  scope3: { zhTW: '揭露 Scope 3', en: 'Disclose Scope 3' },
  target: { zhTW: '減量目標', en: 'Reduction target' },
  sbti: { zhTW: 'SBTi 對齊（1.5°C）', en: 'SBTi-aligned (1.5°C)' },
  netzero: { zhTW: '淨零承諾', en: 'Net-zero commitment' },
  renewable: { zhTW: '再生能源比例 / RE100', en: 'Renewable % / RE100' },
  assurance: { zhTW: '第三方查證', en: 'Third-party assurance' },
  pcf: { zhTW: '產品碳足跡', en: 'Product carbon footprint' },
  cdp: { zhTW: 'CDP 評級', en: 'CDP score' },
  ecovadis: { zhTW: 'EcoVadis 獎章', en: 'EcoVadis medal' },
  spcsa: { zhTW: 'S&P CSA / 年鑑', en: 'S&P CSA / Yearbook' },
  supplierEngagement: { zhTW: '供應商議合', en: 'Supplier engagement' },
};

/** Short note on the real framework each dimension maps to (shown for credibility, not advice). */
export const DIMENSION_SOURCE: Record<ScorecardDimension, BilingualText> = {
  scope12: { zhTW: 'GHG Protocol;CDP 揭露基本項', en: 'GHG Protocol; CDP baseline disclosure' },
  scope3: { zhTW: 'GHG Protocol Scope 3;客戶常要類別1+11', en: 'GHG Protocol Scope 3; customers want Cat 1 + 11' },
  target: { zhTW: '近期/長期減量目標', en: 'Near-/long-term reduction target' },
  sbti: { zhTW: 'SBTi 1.5°C 近期準則(≈4.2%/年)', en: 'SBTi 1.5°C near-term (≈4.2%/yr)' },
  netzero: { zhTW: 'SBTi 淨零標準(實質減≥90%+移除)', en: 'SBTi Net-Zero (≥90% cut + removal)' },
  renewable: { zhTW: 'RE100;品牌客戶常要 2030 100%', en: 'RE100; brands often want 100% by 2030' },
  assurance: { zhTW: 'ISO 14064-3 有限/合理保證', en: 'ISO 14064-3 limited/reasonable assurance' },
  pcf: { zhTW: 'ISO 14067 產品碳足跡', en: 'ISO 14067 product carbon footprint' },
  cdp: { zhTW: 'CDP A–D 級(供應鏈計畫)', en: 'CDP A–D bands (Supply Chain program)' },
  ecovadis: { zhTW: 'EcoVadis 百分位獎章(金=前5%)', en: 'EcoVadis percentile medals (Gold = top 5%)' },
  spcsa: { zhTW: 'S&P CSA;年鑑=同業前15%', en: 'S&P CSA; Yearbook = top 15% in industry' },
  supplierEngagement: { zhTW: 'SBTi Scope 3 議合;Walmart Gigaton', en: 'SBTi Scope 3 engagement; Walmart Gigaton' },
};

const CDP_RANK: Record<string, number> = { A: 8, 'A-': 7, B: 6, 'B-': 5, C: 4, 'C-': 3, D: 2, 'D-': 1, none: 0 };
const ECOVADIS_RANK: Record<string, number> = { platinum: 4, gold: 3, silver: 2, bronze: 1, none: 0 };
const SPCSA_RANK: Record<string, number> = { yearbook: 2, assessed: 1, none: 0 };

export type ReqStatus = 'met' | 'partial' | 'unmet';

/** The supplier's CURRENT standing on each dimension, read from their computed data + self-ratings. */
export interface CurrentStatus {
  hasScope12: boolean;
  hasScope3: boolean;
  scope3Categories: number;
  reductionPct: number; // best target's reduction %
  reductionTargetYear?: number;
  sbtiAligned: boolean; // implied RATE meets the SBTi criterion (computed) — not a commitment
  sbtiCommitment: 'validated' | 'committed' | 'none'; // self-declared external status
  hasNetZero: boolean;
  renewablePct: number;
  assured: boolean; // self-attested freeze in the tool (assured/filed/disclosed)
  hasPcf: boolean;
  ratings: SelfRatings;
}

export function currentStatus(profile: CompanyProfile): CurrentStatus {
  const fp = footprintSummary(profile);
  let s2loc = 0, s2mkt = 0;
  for (const f of profile.facilities) {
    if (!f.useInventory || !f.activities?.length) continue;
    const inv = computeInventory(f.activities, f.countryCode as CountryCode, f.renewablePct ?? 0);
    s2loc += inv.scope2Tonnes; s2mkt += inv.scope2MarketTonnes;
  }
  const renewablePct = s2loc > 0 ? round((1 - s2mkt / s2loc) * 100) : 0;
  const trs = allTargetTrajectories(profile);
  const best = trs.reduce<{ pct: number; year?: number }>((a, t) => (t.targetReductionPct > a.pct ? { pct: t.targetReductionPct, year: t.targetYear } : a), { pct: 0 });
  const cats = new Set((profile.scope3 ?? []).map((l) => l.category));
  return {
    hasScope12: fp.scope12 > 0,
    hasScope3: fp.scope3 > 0,
    scope3Categories: cats.size,
    reductionPct: best.pct,
    reductionTargetYear: best.year,
    sbtiAligned: trs.some((t) => t.sbtiAligned),
    sbtiCommitment: (profile.selfRatings?.sbti as CurrentStatus['sbtiCommitment']) ?? 'none',
    hasNetZero: trs.some((t) => t.targetReductionPct >= 90),
    renewablePct,
    assured: ['assured', 'filed', 'disclosed'].includes(profile.cycleStage ?? ''),
    hasPcf: (profile.products?.length ?? 0) > 0,
    ratings: profile.selfRatings ?? {},
  };
}

export interface RequirementResult {
  req: CustomerRequirement;
  status: ReqStatus;
  have: BilingualText; // your current value, human-readable (R4 #9 — bilingual so EN exports are clean)
  need: BilingualText; // what's required
  gap?: BilingualText;
}

/** Evaluate one requirement against the supplier's current status. */
export function evaluateRequirement(req: CustomerRequirement, s: CurrentStatus): RequirementResult {
  const B = (zhTW: string, en: string): BilingualText => ({ zhTW, en });
  const ok = (have: BilingualText, need: BilingualText): RequirementResult => ({ req, status: 'met', have, need });
  const no = (have: BilingualText, need: BilingualText, gap: BilingualText): RequirementResult => ({ req, status: 'unmet', have, need, gap });
  const part = (have: BilingualText, need: BilingualText, gap: BilingualText): RequirementResult => ({ req, status: 'partial', have, need, gap });
  const dash = B('—', '—');

  switch (req.dimension) {
    case 'scope12':
      return s.hasScope12 ? ok(B('已揭露', 'Disclosed'), B('揭露', 'Disclose')) : no(dash, B('揭露', 'Disclose'), { zhTW: '建立 Scope 1+2 盤查', en: 'Build a Scope 1+2 inventory' });
    case 'scope3':
      if (!s.hasScope3) return no(dash, B('揭露', 'Disclose'), { zhTW: '在 ⑦ 量化 Scope 3(至少類別1)', en: 'Quantify Scope 3 (at least Cat 1) in ⑦' });
      return s.scope3Categories >= 2
        ? ok(B(`${s.scope3Categories} 類`, `${s.scope3Categories} cats`), B('揭露', 'Disclose'))
        : part(B(`${s.scope3Categories} 類`, `${s.scope3Categories} cat`), B('≥2 類', '≥2 cats'), { zhTW: '多數客戶要類別1(採購)+類別11(使用)', en: 'Most want Cat 1 + Cat 11' });
    case 'target': {
      const needStr = `−${req.minPct ?? 0}%${req.byYear ? ` by ${req.byYear}` : ''}`;
      const need = B(needStr, needStr);
      const haveStr = s.reductionPct > 0 ? `−${s.reductionPct}%${s.reductionTargetYear ? ` by ${s.reductionTargetYear}` : ''}` : '—';
      const have = B(haveStr, haveStr);
      if (s.reductionPct <= 0) return no(have, need, { zhTW: '設定減量目標(基準年+目標年+%)', en: 'Set a reduction target' });
      const pctOk = s.reductionPct >= (req.minPct ?? 0);
      const yearOk = !req.byYear || (s.reductionTargetYear != null && s.reductionTargetYear <= req.byYear);
      return pctOk && yearOk ? ok(have, need) : part(have, need, { zhTW: '目標幅度或目標年未達客戶門檻', en: 'Target depth or year below the threshold' });
    }
    case 'sbti': {
      // R4 #8 — the gate is met only on a self-declared SBTi commitment/validation. A rate-aligned but
      // uncommitted target is PARTIAL (close, not yet formally committed), never a green ✅ — a sales
      // rep must not tell a customer "we're SBTi" off the implied rate alone.
      const need = B('SBTi 對齊', 'SBTi-aligned');
      if (s.sbtiCommitment === 'validated') return ok(B('已驗證', 'Validated'), need);
      if (s.sbtiCommitment === 'committed') return ok(B('已承諾', 'Committed'), need);
      if (s.sbtiAligned) return part(B('未承諾（速率已達）', 'Not committed (rate qualifies)'), need, { zhTW: '隱含年減已達標,但尚未向 SBTi 提交/驗證目標——在 ⑩ 自評填寫承諾狀態', en: 'The implied rate qualifies, but no target is committed/validated with SBTi — set the commitment status in ⑩' });
      return no(s.reductionPct > 0 ? B('未承諾·未達速率', 'Not committed; rate short') : dash, need, { zhTW: '設定符合 SBTi 的減量目標,並向 SBTi 承諾/驗證', en: 'Set an SBTi-conforming target and commit/validate it with SBTi' });
    }
    case 'netzero':
      return s.hasNetZero ? ok(B('已設淨零', 'Net-zero set'), B('淨零承諾', 'Net-zero')) : no(dash, B('淨零承諾', 'Net-zero'), { zhTW: '在 ⑧ 加一條長期淨零目標(減≥90%)', en: 'Add a long-term net-zero target (≥90%) in ⑧' });
    case 'renewable': {
      const needStr = `≥${req.minPct ?? 100}%${req.byYear ? ` by ${req.byYear}` : ''}`;
      const need = B(needStr, needStr);
      if (s.renewablePct >= (req.minPct ?? 100)) return ok(B(`${s.renewablePct}%`, `${s.renewablePct}%`), need);
      return s.renewablePct > 0
        ? part(B(`${s.renewablePct}%`, `${s.renewablePct}%`), need, { zhTW: '提高綠電/PPA/REC 佔比', en: 'Raise renewable/PPA/REC share' })
        : no(B('0%', '0%'), need, { zhTW: '在廠區填再生能源 %(綠電/PPA/REC)', en: 'Enter renewable % on a facility' });
    }
    case 'assurance':
      return s.assured ? ok(B('已定版', 'Frozen'), B('第三方查證', 'Third-party assurance')) : no(dash, B('第三方查證', 'Third-party assurance'), { zhTW: '完成查證後標記;工具內為自我定版,正式查證須外部機構', en: 'Mark once verified; the tool freeze is self-attested — real assurance needs an external body' });
    case 'pcf':
      return s.hasPcf ? ok(B('已建', 'Built'), B('產品碳足跡', 'PCF')) : no(dash, B('產品碳足跡', 'PCF'), { zhTW: '在 ⑨ 建立每料號產品碳足跡', en: 'Build per-SKU PCF in ⑨' });
    case 'cdp': {
      const tier = req.tier ?? 'B';
      const need = B(`≥${tier}`, `≥${tier}`);
      const have = s.ratings.cdp ?? 'none';
      const haveLabel = have === 'none' ? B('未填', '—') : B(have, have);
      return (CDP_RANK[have] ?? 0) >= (CDP_RANK[tier] ?? 6) ? ok(B(have, have), need) : no(haveLabel, need, { zhTW: '提升 CDP 評級(揭露→管理→領導)', en: 'Improve your CDP band' });
    }
    case 'ecovadis': {
      const need = req.tier ?? 'gold';
      const have = s.ratings.ecovadis ?? 'none';
      const haveLabel = have === 'none' ? B('未填', '—') : B(have, have);
      return (ECOVADIS_RANK[have] ?? 0) >= (ECOVADIS_RANK[need] ?? 3) ? ok(B(have, have), B(`≥${need}`, `≥${need}`)) : no(haveLabel, B(`≥${need}`, `≥${need}`), { zhTW: '提升 EcoVadis 獎章(百分位)', en: 'Raise your EcoVadis medal (percentile)' });
    }
    case 'spcsa': {
      const need = req.tier ?? 'assessed';
      const have = s.ratings.spcsa ?? 'none';
      const haveLabel = have === 'none' ? B('未填', '—') : B(have, have);
      return (SPCSA_RANK[have] ?? 0) >= (SPCSA_RANK[need] ?? 1) ? ok(B(have, have), B(`≥${need}`, `≥${need}`)) : no(haveLabel, B(`≥${need}`, `≥${need}`), { zhTW: '參與 S&P CSA(年鑑=同業前15%)', en: 'Take the S&P CSA (Yearbook = top 15%)' });
    }
    case 'supplierEngagement': {
      const needStr = `≥${req.minPct ?? 50}%`;
      const need = B(needStr, needStr);
      const have = s.ratings.supplierEngagementPct ?? 0;
      return have >= (req.minPct ?? 50)
        ? ok(B(`${have}%`, `${have}%`), need)
        : (have > 0 ? part(B(`${have}%`, `${have}%`), need, { zhTW: '要求更多供應商設減量目標', en: 'Get more suppliers to set targets' }) : no(dash, need, { zhTW: '要求供應商碳盤查/設目標(SBTi Scope 3)', en: 'Ask suppliers to inventory/set targets (SBTi Scope 3)' }));
    }
  }
}

export type OrderRisk = 'preferred' | 'watch' | 'at-risk';

export interface CustomerResult {
  customer: CustomerLine;
  rows: RequirementResult[];
  gatesTotal: number;
  gatesMet: number;
  scoredEarned: number;
  scoredTotal: number;
  risk: OrderRisk; // any failed gate → at-risk; else any scored gap → watch; else preferred
}

export function evaluateCustomer(customer: CustomerLine, s: CurrentStatus): CustomerResult {
  const rows = customer.requirements.map((r) => evaluateRequirement(r, s));
  const gates = rows.filter((r) => r.req.kind === 'gate');
  const gatesMet = gates.filter((r) => r.status === 'met').length;
  const scored = rows.filter((r) => r.req.kind === 'scored');
  const scoredEarned = scored.reduce((a, r) => a + (r.status === 'met' ? (r.req.points ?? 1) : r.status === 'partial' ? (r.req.points ?? 1) / 2 : 0), 0);
  const scoredTotal = scored.reduce((a, r) => a + (r.req.points ?? 1), 0);
  const anyGateFail = gates.some((r) => r.status !== 'met');
  const anyScoredGap = scored.some((r) => r.status !== 'met');
  const risk: OrderRisk = anyGateFail ? 'at-risk' : anyScoredGap ? 'watch' : 'preferred';
  return { customer, rows, gatesTotal: gates.length, gatesMet, scoredEarned: round(scoredEarned), scoredTotal: round(scoredTotal), risk };
}

export interface LeverageItem {
  dimension: ScorecardDimension;
  unblocks: number; // how many customers have an UNMET GATE on this dimension
  customers: string[];
}

export interface ScorecardSummary {
  status: CurrentStatus;
  customers: CustomerResult[]; // sorted: at-risk → watch → preferred (key importance first within tier)
  atRisk: number;
  leverage: LeverageItem[]; // gaps sorted by how many customers they unblock (highest leverage first)
}

const RISK_ORDER: Record<OrderRisk, number> = { 'at-risk': 0, watch: 1, preferred: 2 };
const IMP_ORDER: Record<string, number> = { key: 0, major: 1, minor: 2 };

export function scorecardSummary(profile: CompanyProfile): ScorecardSummary {
  const status = currentStatus(profile);
  const customers = (profile.scorecardCustomers ?? []).map((c) => evaluateCustomer(c, status));
  customers.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk] || (IMP_ORDER[a.customer.importance ?? 'major'] - IMP_ORDER[b.customer.importance ?? 'major']));

  // cross-customer leverage: a dimension with an unmet GATE in N customers — fixing it unblocks N.
  const byDim = new Map<ScorecardDimension, string[]>();
  for (const cr of customers) {
    for (const r of cr.rows) {
      if (r.req.kind === 'gate' && r.status !== 'met') {
        const list = byDim.get(r.req.dimension) ?? [];
        if (!list.includes(cr.customer.name)) list.push(cr.customer.name);
        byDim.set(r.req.dimension, list);
      }
    }
  }
  const leverage: LeverageItem[] = [...byDim.entries()]
    .map(([dimension, names]) => ({ dimension, unblocks: names.length, customers: names }))
    .sort((a, b) => b.unblocks - a.unblocks);

  return { status, customers, atRisk: customers.filter((c) => c.risk === 'at-risk').length, leverage };
}

/** Illustrative templates grounded in PUBLIC framework requirements — a fast start, EDIT to your real
 *  customer's contract. Not a claim about any specific company's confidential terms. */
export interface ScorecardTemplate { key: string; name: BilingualText; blurb: BilingualText; build: () => CustomerRequirement[] }
const rid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'r' + Math.random().toString(36).slice(2));
const req = (dimension: ScorecardDimension, kind: ReqKind, extra: Partial<CustomerRequirement> = {}): CustomerRequirement => ({ id: rid(), dimension, kind, ...extra });

export const SCORECARD_TEMPLATES: ScorecardTemplate[] = [
  {
    key: 'us-tech-cleanenergy',
    name: { zhTW: '國際品牌(綠電+SBTi)', en: 'Global brand (clean energy + SBTi)' },
    blurb: { zhTW: '如要求 2030 製造 100% 綠電、SBTi 目標、揭露 Scope 1/2/3、查證(對映 Apple Supplier Clean Energy 等公開要求,示意可改)。', en: 'e.g. 100% renewable for manufacturing by 2030, SBTi target, disclose Scope 1/2/3, assurance (illustrative, à la Apple Supplier Clean Energy — edit).' },
    build: () => [req('renewable', 'gate', { minPct: 100, byYear: 2030 }), req('sbti', 'gate'), req('scope12', 'gate'), req('scope3', 'gate'), req('assurance', 'gate'), req('pcf', 'scored', { points: 2 })],
  },
  {
    key: 'eu-ecovadis',
    name: { zhTW: '歐洲品牌(EcoVadis)', en: 'European brand (EcoVadis)' },
    blurb: { zhTW: '以 EcoVadis 獎章為門檻(金=前5%),加揭露 Scope 1/2/3、減量目標、供應商議合。', en: 'Gated on an EcoVadis medal (Gold = top 5%), plus disclose Scope 1/2/3, a reduction target, supplier engagement.' },
    build: () => [req('ecovadis', 'gate', { tier: 'gold' }), req('scope12', 'gate'), req('scope3', 'gate'), req('target', 'scored', { minPct: 30, byYear: 2030 }), req('supplierEngagement', 'scored', { minPct: 50 })],
  },
  {
    key: 'cdp-supplychain',
    name: { zhTW: 'CDP 供應鏈客戶', en: 'CDP Supply Chain customer' },
    blurb: { zhTW: '要求透過 CDP 揭露並達一定評級(≥B),加 Scope 3、減量目標、綠電。', en: 'Disclose via CDP at a band (≥B), plus Scope 3, a target, renewables.' },
    build: () => [req('cdp', 'gate', { tier: 'B' }), req('scope12', 'gate'), req('scope3', 'gate'), req('target', 'gate', { minPct: 25, byYear: 2030 }), req('renewable', 'scored', { minPct: 50 })],
  },
  {
    key: 'generic-reduction',
    name: { zhTW: '通用減碳要求', en: 'Generic decarbonization ask' },
    blurb: { zhTW: '2030 較基準減≥30%、綠電≥30%(計分)、CDP 揭露、Scope 3。', en: '≥30% cut by 2030, ≥30% renewable (scored), CDP disclosure, Scope 3.' },
    build: () => [req('target', 'gate', { minPct: 30, byYear: 2030 }), req('scope12', 'gate'), req('scope3', 'gate'), req('renewable', 'scored', { minPct: 30, points: 2 }), req('cdp', 'scored', { tier: 'C' })],
  },
  {
    key: 'netzero',
    name: { zhTW: '淨零承諾客戶', en: 'Net-zero customer' },
    blurb: { zhTW: '要求淨零承諾、2030 RE100、SBTi、查證。', en: 'Net-zero commitment, RE100 by 2030, SBTi, assurance.' },
    build: () => [req('netzero', 'gate'), req('renewable', 'gate', { minPct: 100, byYear: 2030 }), req('sbti', 'gate'), req('assurance', 'scored')],
  },
];

export function customerFromTemplate(tpl: ScorecardTemplate, name: string): CustomerLine {
  return { id: rid(), name, importance: 'major', requirements: tpl.build() };
}

const RISK_LABEL: Record<OrderRisk, BilingualText> = {
  'at-risk': { zhTW: '抽單風險', en: 'At risk' }, watch: { zhTW: '需補強', en: 'Needs work' }, preferred: { zhTW: '首選供應商', en: 'Preferred' },
};
const MARK: Record<ReqStatus, string> = { met: '✅', partial: '🟡', unmet: '⬜' };

/** Plain-text scorecard — an internal "which customers are at risk + what to fix first" summary. */
export function scorecardText(profile: CompanyProfile, lang: 'zhTW' | 'en' = 'zhTW'): string {
  const sum = scorecardSummary(profile);
  const L = (b: BilingualText) => (lang === 'en' ? b.en : b.zhTW);
  const out: string[] = [];
  out.push(`# ${lang === 'en' ? 'Customer scorecard' : '客戶記分卡'}${profile.company ? ` — ${profile.company}` : ''} (${profile.year})`);
  out.push(lang === 'en' ? `${sum.atRisk} of ${sum.customers.length} customers at risk.` : `${sum.customers.length} 個客戶,${sum.atRisk} 個有抽單風險。`);
  if (sum.leverage[0]?.unblocks >= 2) out.push((lang === 'en' ? 'Highest leverage: closing ' : '最高槓桿:補上「') + L(DIMENSION_LABEL[sum.leverage[0].dimension]) + (lang === 'en' ? ` unblocks ${sum.leverage[0].unblocks} customers.` : `」可解鎖 ${sum.leverage[0].unblocks} 個客戶。`));
  for (const cr of sum.customers) {
    out.push('', `## ${cr.customer.name || '—'} — ${L(RISK_LABEL[cr.risk])} (${lang === 'en' ? 'gates' : '門票'} ${cr.gatesMet}/${cr.gatesTotal}${cr.scoredTotal > 0 ? `, ${lang === 'en' ? 'scored' : '計分'} ${cr.scoredEarned}/${cr.scoredTotal}` : ''})`);
    for (const r of cr.rows) out.push(`${MARK[r.status]} ${L(DIMENSION_LABEL[r.req.dimension])} [${r.req.kind === 'gate' ? (lang === 'en' ? 'gate' : '門票') : `${r.req.points ?? 1}${lang === 'en' ? 'pt' : '分'}`}]: ${L(r.have)} / ${lang === 'en' ? 'need' : '需'} ${L(r.need)}${r.gap && r.status !== 'met' ? `  — ${L(r.gap)}` : ''}`);
  }
  out.push('', L(SCORECARD_NOTE));
  return out.join('\n');
}

export const SCORECARD_NOTE: BilingualText = {
  zhTW: '客戶要求由你輸入;範本為對映公開框架(CDP/EcoVadis/SBTi/RE100)之示意起點,非任何特定客戶之合約條款,請依實際要求調整。達標狀態讀自你算好的盤查/目標與自評評級,僅供內部管理,非客戶正式評分。',
  en: 'Customer requirements are yours to enter; templates are illustrative starting points mapped to public frameworks (CDP/EcoVadis/SBTi/RE100), not any specific customer’s contract — edit to your actual terms. Status is read from your computed inventory/targets + self-declared ratings, for internal management — not an official customer score.',
};
