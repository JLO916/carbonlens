// Contextual matcher: score RECCESSARY articles against the analysis surface + company profile by
// keyword overlap (bilingual, substring-based so compound tags like "CBAM台商因應" still match "CBAM").
// Pure + testable. No fabricated content — it only ranks the real harvested corpus.

import type { ReccessaryArticle, RelatedContext, MatchSignals } from './types';

interface Lex { primary: string[]; broad: string[] }

/** Topic lexicon per surface. primary terms drive the match; broad terms keep the card populated when
 *  the corpus is thin (graceful degradation to adjacent climate/energy coverage). */
export const CONTEXT_LEXICON: Record<RelatedContext, Lex> = {
  cbam: { primary: ['CBAM', '碳邊境', '碳關稅', 'carbon border'], broad: ['出口歐盟', '歐盟', '碳定價', 'carbon pric', 'export', 'tariff', '供應鏈', 'supply chain'] },
  carbonFee: { primary: ['碳費', '碳稅', '碳定價', 'carbon fee', 'carbon tax', 'carbon pric'], broad: ['碳市場', '排放交易', 'ETS', 'carbon market', '碳權', 'carbon credit', '環境部'] },
  scope2re100: { primary: ['再生能源', '綠電', 'RE100', 'PPA', 'REC', 'renewable', 'green power'], broad: ['離岸風電', '太陽能', '光電', '儲能', 'wind', 'solar', 'offshore', 'energy transition', '綠電交易', '轉供', '直購', 'energy security'] },
  targets: { primary: ['SBTi', '淨零', 'net-zero', 'net zero', '科學基礎', '減碳目標', 'carbon reduction'], broad: ['減碳', '碳中和', 'carbon neutral', 'decarboni', 'climate target', '2050', 'transition'] },
  disclosure: { primary: ['IFRS', '永續報告', 'ESG', '揭露', 'disclosure', 'sustainability report', 'TCFD', 'GRI'], broad: ['金管會', '綠色政策', 'green policy', '法規', 'regulation', 'reporting'] },
  inventory: { primary: ['碳盤查', '盤查', '碳管理', 'GHG', '溫室氣體', 'carbon management', 'Scope', '範疇'], broad: ['碳中和', '減碳', 'ESG', '電子業減碳', '供應鏈', 'supply chain', 'emissions'] },
  general: { primary: ['碳', '再生能源', 'carbon', 'renewable', 'ESG', '淨零'], broad: ['綠電', '減碳', 'energy', 'climate', '永續'] },
};

const INDUSTRY_TERMS: Record<string, string[]> = {
  electronics: ['電子', '半導體', '晶圓', 'semiconduct', 'electronic', 'chip', '科技業'],
  metals: ['鋼', '金屬', '鋁', 'steel', 'metal', 'alumin'],
  chemicals: ['化工', '石化', '塑膠', 'chemical', 'petrochem', 'plastic'],
  cement: ['水泥', '熟料', 'cement', 'clinker'],
  textiles: ['紡織', '成衣', 'textile', 'apparel'],
  machinery: ['機械', '設備', 'machinery', 'equipment'],
  food: ['食品', '農', 'food', 'agri'],
};

const COUNTRY_TERMS: Record<string, string[]> = {
  tw: ['台灣', '台商', 'taiwan'], vn: ['越南', 'vietnam'], th: ['泰國', 'thailand'],
  sg: ['新加坡', 'singapore'], kr: ['韓國', 'korea'], jp: ['日本', 'japan'],
};

const FRAMEWORK_TERMS: Record<string, string[]> = {
  sbti: ['SBTi', '科學基礎', '淨零', 'net-zero'],
  re100: ['RE100', '再生能源', '綠電', 'renewable'],
  cdp: ['CDP', '揭露', 'disclosure', '供應鏈'],
};

function countryTerms(country?: string): string[] {
  if (!country) return [];
  const base = COUNTRY_TERMS[country] ?? [];
  return country === 'vn' || country === 'th' ? [...base, '東協', 'ASEAN'] : base;
}

interface WeightedTerm { t: string; w: number }

/** The weighted query terms for a set of signals (exposed for testing/inspection). */
export function queryTerms(signals: MatchSignals): WeightedTerm[] {
  const lex = CONTEXT_LEXICON[signals.context] ?? CONTEXT_LEXICON.general;
  return [
    ...lex.primary.map((t) => ({ t, w: 4 })),
    ...lex.broad.map((t) => ({ t, w: 1.5 })),
    ...(INDUSTRY_TERMS[signals.industry ?? ''] ?? []).map((t) => ({ t, w: 2 })),
    ...countryTerms(signals.country).map((t) => ({ t, w: 1.5 })),
    ...(signals.frameworks ?? []).flatMap((f) => FRAMEWORK_TERMS[f] ?? []).map((t) => ({ t, w: 1.5 })),
  ];
}

/** A series prefix (before 》/：/:) so we don't return 3 weekly-roundup editions of the same series. */
const seriesKey = (title: string) => (title.split(/》|：|:/)[0] || title).trim().slice(0, 12);

/** Rank the corpus for a surface+profile; returns the top `n` (lang-filtered, score>0, recency tiebreak). */
export function rankArticles(articles: ReccessaryArticle[], signals: MatchSignals, lang: 'zh-tw' | 'en', n = 4): ReccessaryArticle[] {
  const terms = queryTerms(signals);
  const scored = articles
    .filter((a) => a.lang === lang)
    .map((a) => {
      const hay = (a.title + ' ' + a.tags.join(' ')).toLowerCase();
      let score = 0;
      for (const { t, w } of terms) if (hay.includes(t.toLowerCase())) score += w;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || (y.a.date ?? '').localeCompare(x.a.date ?? ''));

  // de-duplicate same-series roundups (keep the highest-scored / newest of each series)
  const out: ReccessaryArticle[] = [];
  const seenSeries = new Set<string>();
  for (const { a } of scored) {
    const k = seriesKey(a.title);
    if (seenSeries.has(k)) continue;
    seenSeries.add(k);
    out.push(a);
    if (out.length >= n) break;
  }
  return out;
}
