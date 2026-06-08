import { rankArticles, queryTerms } from '@/lib/reccessary/match';
import type { ReccessaryArticle } from '@/lib/reccessary/types';

const A: ReccessaryArticle[] = [
  { url: 'u1', lang: 'zh-tw', title: 'CBAM台商因應指南', tags: ['CBAM', '碳邊境調整機制', '出口歐盟'], summary: '', date: '2026-05-01' },
  { url: 'u2', lang: 'zh-tw', title: '台灣碳費開徵', tags: ['碳費', '碳定價', '環境部'], summary: '', date: '2026-05-02' },
  { url: 'u3', lang: 'zh-tw', title: '企業綠電採購攻略', tags: ['再生能源', '綠電', 'PPA', 'RE100'], summary: '', date: '2026-05-03' },
  { url: 'u4', lang: 'zh-tw', title: '越南電子業減碳路徑', tags: ['越南', '電子業減碳', '碳盤查'], summary: '', date: '2026-05-04' },
  { url: 'u5', lang: 'en', title: 'EU CBAM guide for exporters', tags: ['CBAM', 'carbon border', 'EU'], summary: '', date: '2026-05-05' },
  { url: 'u6', lang: 'zh-tw', title: '東協周報》越南熱浪推升用電', tags: ['東協', '再生能源'], summary: '', date: '2026-05-10' },
  { url: 'u7', lang: 'zh-tw', title: '東協周報》印尼碳市場新規', tags: ['東協', '碳市場'], summary: '', date: '2026-05-09' },
];

describe('R2 — RECCESSARY article matcher', () => {
  it('ranks the on-topic article first per context (substring match handles compound tags)', () => {
    expect(rankArticles(A, { context: 'cbam' }, 'zh-tw')[0].url).toBe('u1'); // "CBAM台商因應" ⊃ "CBAM"
    expect(rankArticles(A, { context: 'carbonFee' }, 'zh-tw')[0].url).toBe('u2');
    expect(rankArticles(A, { context: 'scope2re100' }, 'zh-tw')[0].url).toBe('u3');
  });

  it('filters by language (an English surface never returns Chinese articles)', () => {
    const en = rankArticles(A, { context: 'cbam' }, 'en');
    expect(en.every((a) => a.lang === 'en')).toBe(true);
    expect(en.map((a) => a.url)).toContain('u5');
    expect(en.map((a) => a.url)).not.toContain('u1');
  });

  it('industry + country signals boost sector/region-relevant articles', () => {
    const top = rankArticles(A, { context: 'inventory', industry: 'electronics', country: 'vn' }, 'zh-tw')[0];
    expect(top.url).toBe('u4'); // 越南 + 電子業 + 碳盤查 all hit
  });

  it('returns nothing rather than fabricating when no article matches', () => {
    const off: ReccessaryArticle[] = [{ url: 'x', lang: 'zh-tw', title: '股市收盤', tags: ['台股', '財報'], summary: '' }];
    expect(rankArticles(off, { context: 'cbam' }, 'zh-tw')).toEqual([]);
  });

  it('caps to n and de-duplicates same-series roundups', () => {
    expect(rankArticles(A, { context: 'scope2re100' }, 'zh-tw', 2).length).toBeLessThanOrEqual(2);
    // both 東協周報 editions match the general context, but only one should appear
    const gen = rankArticles(A, { context: 'general' }, 'zh-tw', 5);
    expect(gen.filter((a) => a.title.startsWith('東協周報')).length).toBe(1);
  });

  it('queryTerms weights primary context terms above broad/industry terms', () => {
    const terms = queryTerms({ context: 'cbam', industry: 'metals' });
    expect(terms.find((t) => t.t === 'CBAM')!.w).toBeGreaterThan(terms.find((t) => t.t === '鋼')!.w);
  });
});
