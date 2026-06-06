// 供應鏈碳要求定性側寫 (Brief §3C/§6C). Pure function. Output is a QUALITATIVE risk
// profile — never a $ amount, never a specific brand's demand on the company.

import type {
  SupplyChainInput,
  SupplyChainResult,
  FrameworkExpectation,
  PressureLevel,
  BilingualText,
  BusinessModel,
  FrameworkKey,
} from '@/lib/diagnose/types';
import {
  FRAMEWORKS,
  SCOPE3_SCALE_POINTS,
  SCOPE3_INDUSTRY_NOTES,
  TRANSMISSION_TEXT,
  CSRD_CAP_PROTECTED,
  CSRD_CAP_ABOVE_THRESHOLD,
  CITATION_FRAMEWORKS,
  CITATION_SCOPE3,
  CITATION_TRANSMISSION,
  CITATION_CSRD,
} from '@/lib/diagnose/data/supply-chain';
import { scope3ProfileOf } from '@/lib/diagnose/data/industries';

// ⚠️ TOOL-DEFINED, ADJUSTABLE qualitative rubric (not an official figure). Pressure =
// number of frameworks the brand customers have publicly committed to, nudged up for an export
// supply chain, and adjusted by business model: a component/代工 supplier is the one most
// directly (and by many customers) asked for data → +1; a brand owner is usually the requester,
// not the requestee → −1. (ODM/OEM stays neutral.) Employee size feeds the CSRD note, not this.
const LEVELS: PressureLevel[] = ['low', 'medium', 'high'];
function pressureFrom(concreteCount: number, exportSupplyChain: boolean, businessModel: BusinessModel): PressureLevel {
  let i = concreteCount >= 2 ? 2 : concreteCount === 1 ? 1 : 0;
  if (exportSupplyChain && i < 2) i += 1;
  if (businessModel === 'component' && i < 2) i += 1;
  if (businessModel === 'brand' && i > 0) i -= 1;
  return LEVELS[Math.max(0, Math.min(2, i))];
}

const MODEL_PRESSURE_NOTE: Record<BusinessModel, BilingualText> = {
  brand: { zhTW: '（品牌商：你多半是發問方而非被問方，故下修）', en: ' (brand owner: usually the requester, not the requestee — adjusted down)' },
  odm_oem: { zhTW: '', en: '' },
  component: { zhTW: '（零組件供應商：你最常被多家下游客戶直接要數據，故上修）', en: ' (component supplier: most directly asked by many downstream customers — adjusted up)' },
};

const LEVEL_LABEL: Record<PressureLevel, BilingualText> = {
  low: { zhTW: '低', en: 'Low' },
  medium: { zhTW: '中', en: 'Medium' },
  high: { zhTW: '高', en: 'High' },
};

export function diagnoseSupplyChain(input: SupplyChainInput): SupplyChainResult {
  const concrete = input.frameworks.filter((f): f is Exclude<FrameworkKey, 'unsure'> => f !== 'unsure');

  const expectations: FrameworkExpectation[] = concrete
    .map((k) => FRAMEWORKS.find((f) => f.key === k))
    .filter((f): f is (typeof FRAMEWORKS)[number] => Boolean(f))
    .map((f) => ({ key: f.key, name: f.name, commitment: f.commitment, expectedAsk: f.expectedAsk }));

  const pressureLevel = pressureFrom(expectations.length, input.exportSupplyChain, input.businessModel);
  const level = LEVEL_LABEL[pressureLevel];
  const modelNote = MODEL_PRESSURE_NOTE[input.businessModel];

  const names = expectations.map((e) => e.name);
  const namesZh = names.map((n) => n.zhTW).join('、');
  const namesEn = names.map((n) => n.en).join(', ');

  const pressureRationale: BilingualText = expectations.length
    ? {
        zhTW: `主要品牌客戶已公開承諾 ${expectations.length} 項框架（${namesZh}）${input.exportSupplyChain ? '，且您供應出口供應鏈' : ''} → 預期壓力：${level.zhTW}${modelNote.zhTW}`,
        en: `Key brand customers have publicly committed to ${expectations.length} framework(s) (${namesEn})${input.exportSupplyChain ? ', and you supply an export supply chain' : ''} → expected pressure: ${level.en}${modelNote.en}`,
      }
    : {
        zhTW: `主要客戶的框架尚未確認${input.exportSupplyChain ? '，但您供應出口供應鏈' : ''} → 預期壓力：${level.zhTW}${modelNote.zhTW}`,
        en: `Key customers’ frameworks are unconfirmed${input.exportSupplyChain ? ', but you supply an export supply chain' : ''} → expected pressure: ${level.en}${modelNote.en}`,
      };

  const pressureNote: BilingualText = {
    zhTW: '此為本工具依公開框架承諾所做的「預期壓力」定性綜合，非金額損失，也非任何品牌對貴司的具體數值要求。',
    en: 'This is the tool’s qualitative synthesis of “expected pressure” from public framework commitments — not a monetary loss, and not any brand’s specific numeric demand on your company.',
  };

  const unsureNote: BilingualText | undefined = expectations.length
    ? undefined
    : {
        zhTW: '建議查詢 RE100／SBTi／CDP 的公開會員名單，確認您的主要品牌客戶是否在列，再回來細看預期被要求事項。',
        en: 'Check the public RE100 / SBTi / CDP member lists to confirm whether your key brand customers are listed, then revisit the expected demands.',
      };

  const profile = scope3ProfileOf(input.industry);
  const industryNote =
    profile === 'finance'
      ? SCOPE3_INDUSTRY_NOTES.finance
      : profile === 'manufacturing_retail'
        ? SCOPE3_INDUSTRY_NOTES.manufacturing_retail
        : undefined;

  const protectedByCsrd = input.employeeBand !== 'over1000';

  return {
    input,
    pressureLevel,
    pressureRationale,
    pressureNote,
    expectations,
    unsureNote,
    scope3: { points: SCOPE3_SCALE_POINTS, industryNote, citation: CITATION_SCOPE3 },
    transmission: { text: TRANSMISSION_TEXT, citation: CITATION_TRANSMISSION },
    csrdProtection: {
      protected: protectedByCsrd,
      text: protectedByCsrd ? CSRD_CAP_PROTECTED : CSRD_CAP_ABOVE_THRESHOLD,
      citation: CITATION_CSRD,
    },
    frameworksCitation: CITATION_FRAMEWORKS,
  };
}
