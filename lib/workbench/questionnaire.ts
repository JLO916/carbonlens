// S2 — customer questionnaire response mode. An SME does carbon work because a CUSTOMER asked: a CDP
// Supply Chain request, a brand ESG questionnaire, an SBTi supplier-engagement ask. This maps the
// already-computed inventory / targets to those common asks, marks each answer ready / partial /
// missing, and lists the gaps — so the SME can actually answer the email, not just see a number.
// RED LINE: every value comes from the user's computed result; missing data is flagged, never faked.

import { footprintSummary } from './scope3';
import { computeInventory } from './inventory';
import { targetTrajectory } from './target';
import { computeScope3 } from './scope3';
import type { CompanyProfile } from './profile';
import type { WorkbenchResult } from './aggregate';
import type { CountryCode } from '@/lib/types';
import type { BilingualText } from '@/lib/diagnose/types';

export type QStatus = 'ready' | 'partial' | 'missing';

export interface QItem {
  question: BilingualText;
  value: string; // the computed answer, or '—'
  status: QStatus;
  gap?: BilingualText; // what to add to make it answerable
}

export interface QSection {
  key: string;
  title: BilingualText;
  blurb: BilingualText; // who asks this / context
  items: QItem[];
}

export interface QuestionnairePack {
  sections: QSection[];
  readyCount: number;
  totalCount: number;
  gaps: { section: BilingualText; question: BilingualText; gap: BilingualText }[];
}

const fmtT = (n: number) => Math.round(n).toLocaleString('en-US') + ' tCO₂e';
const pct = (n: number) => `${Math.round(n)}%`;

/** Computed facts shared across questionnaire frameworks. */
function facts(profile: CompanyProfile) {
  const fp = footprintSummary(profile);
  let s2loc = 0, s2mkt = 0;
  for (const f of profile.facilities) {
    if (!f.useInventory || !f.activities?.length) continue;
    const inv = computeInventory(f.activities, f.countryCode as CountryCode, f.renewablePct ?? 0);
    s2loc += inv.scope2Tonnes; s2mkt += inv.scope2MarketTonnes;
  }
  const renewablePct = s2loc > 0 ? (1 - s2mkt / s2loc) * 100 : 0;
  const s3 = computeScope3(profile.scope3 ?? []);
  const cats = Array.from(new Set((profile.scope3 ?? []).map((l) => l.category))).sort((a, b) => a - b);
  const tr = targetTrajectory(profile);
  const assuredStage = ['assured', 'filed', 'disclosed'].includes(profile.cycleStage ?? '');
  const inProgress = profile.cycleStage === 'assure';
  return { fp, s2loc, s2mkt, renewablePct, s3, cats, tr, assuredStage, inProgress };
}

/** Build the answer pack across CDP Supply Chain / brand ESG / SBTi supplier frameworks. */
export function buildQuestionnaire(profile: CompanyProfile, lang: 'zhTW' | 'en' = 'zhTW', _result?: WorkbenchResult): QuestionnairePack {
  const f = facts(profile);
  const en = lang === 'en';
  const hasInventory = f.fp.scope12 > 0;
  const hasScope3 = f.s3.totalTonnes > 0;

  const scope1Item: QItem = {
    question: { zhTW: 'Scope 1 直接排放(tCO₂e)', en: 'Scope 1 direct emissions (tCO₂e)' },
    value: hasInventory ? fmtT(f.fp.scope1) : '—',
    status: f.fp.scope1 > 0 ? 'ready' : hasInventory ? 'partial' : 'missing',
    gap: hasInventory ? undefined : { zhTW: '在「① 公司基本→盤查」建立活動數據', en: 'Build activity data under the inventory section' },
  };
  const scope2Item: QItem = {
    question: { zhTW: 'Scope 2 外購電力(地點＋市場基礎)', en: 'Scope 2 purchased electricity (location + market)' },
    value: hasInventory ? `${fmtT(f.s2loc)} (loc) · ${fmtT(f.s2mkt)} (mkt)` : '—',
    status: hasInventory ? 'ready' : 'missing',
    gap: hasInventory ? undefined : { zhTW: '加入外購電力活動數據', en: 'Add purchased-electricity activity data' },
  };
  const scope3Item: QItem = {
    question: { zhTW: 'Scope 3 價值鏈排放(及分類)', en: 'Scope 3 value-chain emissions (by category)' },
    value: hasScope3 ? `${fmtT(f.s3.totalTonnes)} · ${f.cats.length} ${en ? (f.cats.length === 1 ? 'cat' : 'cats') : '類'} (Cat ${f.cats.join(', ')})` : '—',
    status: hasScope3 ? (f.cats.length >= 2 ? 'ready' : 'partial') : 'missing',
    gap: hasScope3 ? (f.cats.length >= 2 ? undefined : { zhTW: '多數客戶至少要 Cat 1(採購)+ Cat 11(售出使用)', en: 'Most customers want at least Cat 1 (purchased) + Cat 11 (use of sold)' }) : { zhTW: '在「⑦ Scope 3」量化至少類別 1', en: 'Quantify at least Category 1 under Scope 3' },
  };
  const targetItem: QItem = {
    question: { zhTW: '減量目標(年期、範疇、是否 SBTi 對齊)', en: 'Reduction target (year, scope, SBTi alignment)' },
    value: f.tr ? `−${f.tr.targetReductionPct}% by ${f.tr.targetYear} (${f.tr.scope === 'scope123' ? 'S1+2+3' : f.tr.scope === 'scope3' ? 'S3' : 'S1+2'})` : '—',
    status: f.tr ? (f.tr.sbtiAligned ? 'ready' : 'partial') : 'missing',
    gap: f.tr ? (f.tr.sbtiAligned ? undefined : (f.tr.sbtiKind === 'netzero' ? { zhTW: '淨零目標需減 ≥90%', en: 'A net-zero target needs a ≥90% cut' } : { zhTW: `隱含年減未達 SBTi ${f.tr.scope === 'scope3' ? 'Scope 3' : '1.5°C'} 最低 ${f.tr.sbtiBasisPct}%/年`, en: `Implied annual cut is below the SBTi ${f.tr.scope === 'scope3' ? 'Scope 3' : '1.5°C'} minimum ${f.tr.sbtiBasisPct}%/yr` })) : { zhTW: '在「① 公司基本」設定基準年＋目標年＋減量 %', en: 'Set base year + target year + reduction % under company basics' },
  };
  const verifyItem: QItem = {
    question: { zhTW: '查證／保證等級', en: 'Verification / assurance level' },
    value: f.assuredStage ? (profile.cycleStage === 'assured' ? (en ? 'Assured' : '已查證 (assured)') : profile.cycleStage ?? '') : f.inProgress ? (en ? 'In progress' : '查證中 (in progress)') : '—',
    status: f.assuredStage ? 'ready' : f.inProgress ? 'partial' : 'missing',
    gap: f.assuredStage ? undefined : { zhTW: '完成查證後在「週期」標記;或先凍結定版作為內部基準', en: 'Mark assured under the cycle once verified; or freeze a version as an internal baseline' },
  };
  const methodItem: QItem = {
    question: { zhTW: '盤查方法與排放係數來源', en: 'Methodology & emission-factor sources' },
    value: 'GHG Protocol · ' + (profile.facilities.some((x) => x.countryCode !== 'tw') ? (en ? 'national grid factors / ' : '各國電網係數 / ') : '') + (en ? 'MOENV factor table 6.0.4 · IPCC AR5 GWP' : '環境部係數表 6.0.4 · IPCC AR5 GWP'),
    status: 'ready',
  };
  const baseYearItem: QItem = {
    question: { zhTW: '基準年及基準年排放', en: 'Base year & base-year emissions' },
    value: profile.baseYear ? `${profile.baseYear}${profile.baseYearEmissionsTonnes ? ` · ${fmtT(profile.baseYearEmissionsTonnes)}` : ''}` : '—',
    status: profile.baseYear ? 'ready' : 'missing',
    gap: profile.baseYear ? undefined : { zhTW: '設定基準年(減量比較的起點)', en: 'Set a base year (the reduction baseline)' },
  };
  const intensityItem: QItem = {
    question: { zhTW: '排放強度(每單位產品 PCF)', en: 'Emission intensity (per-unit PCF)' },
    value: f.fp.pcfPerUnit != null ? `${f.fp.pcfPerUnit.toLocaleString('en-US')} kgCO₂e/${profile.unitLabel || 'unit'}` : '—',
    status: f.fp.pcfPerUnit != null ? 'ready' : 'missing',
    gap: f.fp.pcfPerUnit != null ? undefined : { zhTW: '在「⑦」填年售出單位數(或用產品碳足跡分攤)', en: 'Enter annual units sold (or use per-product allocation)' },
  };
  const renewableItem: QItem = {
    question: { zhTW: '再生能源使用比例(RE100 進度)', en: 'Renewable electricity share (RE100 progress)' },
    value: hasInventory ? pct(f.renewablePct) : '—',
    status: hasInventory ? (f.renewablePct > 0 ? 'ready' : 'partial') : 'missing',
    gap: f.renewablePct > 0 ? undefined : { zhTW: '若有 PPA／綠電憑證,於廠區填再生能源 %', en: 'If you have a PPA/REC, enter the renewable % on the facility' },
  };

  const sections: QSection[] = [
    {
      key: 'cdp',
      title: { zhTW: 'CDP 供應鏈(氣候)', en: 'CDP Supply Chain (Climate)' },
      blurb: { zhTW: '大型品牌客戶常透過 CDP 要求供應商揭露排放、目標與查證。', en: 'Brand customers often request supplier disclosure of emissions, targets and verification via CDP.' },
      items: [scope1Item, scope2Item, scope3Item, targetItem, verifyItem, methodItem],
    },
    {
      key: 'brand',
      title: { zhTW: '品牌客戶通用 ESG 問卷', en: 'Brand customer ESG questionnaire' },
      blurb: { zhTW: '客戶自有的供應商 ESG 問卷,通常問總量、強度、綠電與基準年。', en: "A customer's own supplier ESG form — typically totals, intensity, renewables and base year." },
      items: [baseYearItem, { ...scope1Item }, { ...scope2Item }, intensityItem, renewableItem, scope3Item],
    },
    {
      key: 'sbti',
      title: { zhTW: 'SBTi 供應商承諾', en: 'SBTi supplier engagement' },
      blurb: { zhTW: '客戶為達成自身 Scope 3 目標,要求供應商設定經科學基礎驗證的目標。', en: "To meet their own Scope 3 target, customers ask suppliers to set science-based targets." },
      items: [targetItem, { ...scope1Item }, { ...scope2Item }, scope3Item, baseYearItem],
    },
  ];

  const allItems = sections.flatMap((s) => s.items);
  const readyCount = allItems.filter((i) => i.status === 'ready').length;
  // de-dup gaps by question text (the same item appears in several frameworks)
  const seen = new Set<string>();
  const gaps: QuestionnairePack['gaps'] = [];
  for (const s of sections) {
    for (const i of s.items) {
      if (i.status !== 'ready' && i.gap && !seen.has(i.question.zhTW)) {
        seen.add(i.question.zhTW);
        gaps.push({ section: s.title, question: i.question, gap: i.gap });
      }
    }
  }

  return { sections, readyCount, totalCount: allItems.length, gaps };
}

const STATUS_MARK: Record<QStatus, string> = { ready: '✅', partial: '🟡', missing: '⬜' };

/** Plain-text export the SME can paste straight into the customer's email / portal. */
export function questionnaireText(profile: CompanyProfile, lang: 'zhTW' | 'en' = 'zhTW'): string {
  const pack = buildQuestionnaire(profile, lang);
  const L = (b: BilingualText) => (lang === 'en' ? b.en : b.zhTW);
  const out: string[] = [];
  const title = lang === 'en' ? 'Customer questionnaire — answer pack' : '客戶問卷回覆包';
  out.push(`# ${title}${profile.company ? ` — ${profile.company}` : ''} (${profile.year})`);
  out.push(lang === 'en'
    ? `Ready ${pack.readyCount}/${pack.totalCount}. Values are computed from your inventory/targets; "—" = missing data.`
    : `可回覆 ${pack.readyCount}/${pack.totalCount}。數值來自你的盤查／目標;「—」表示資料尚缺。`);
  for (const s of pack.sections) {
    out.push('', `## ${L(s.title)}`, L(s.blurb));
    for (const i of s.items) out.push(`${STATUS_MARK[i.status]} ${L(i.question)}: ${i.value}${i.gap && i.status !== 'ready' ? `  — ${lang === 'en' ? 'gap' : '缺口'}: ${L(i.gap)}` : ''}`);
  }
  if (pack.gaps.length) {
    out.push('', `## ${lang === 'en' ? 'To complete your answers' : '要補齊回覆,還差這些'}`);
    pack.gaps.forEach((g, idx) => out.push(`${idx + 1}. ${L(g.question)} — ${L(g.gap)}`));
  }
  out.push('', lang === 'en'
    ? 'Generated by Carbon Lens — a screening workbench; figures are self-declared unless independently verified.'
    : '由 Carbon Lens 產生——篩選用工作台;除非經獨立查證,數值屬自行宣告。');
  return out.join('\n');
}
