// Related-articles feature — types shared by the matcher, the feed provider and the UI card.
// Source: RECCESSARY (https://www.reccessary.com) public news articles (sitemap + public OG/meta).

export interface ReccessaryArticle {
  url: string;
  lang: 'zh-tw' | 'en';
  title: string;
  tags: string[];
  summary: string;
  image?: string;
  date?: string; // YYYY-MM-DD
}

/** Which analysis surface the card sits on — drives the topic lexicon used for matching. */
export type RelatedContext = 'cbam' | 'carbonFee' | 'scope2re100' | 'targets' | 'disclosure' | 'inventory' | 'general';

export interface MatchSignals {
  context: RelatedContext;
  industry?: string; // profile industry → sector terms
  country?: string; // primary facility country → region terms
  frameworks?: string[]; // customer frameworks (sbti/re100/cdp) → extra terms
}
