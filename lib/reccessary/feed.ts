// Server-only feed provider. The corpus is RECCESSARY public news articles. It is genuinely dynamic:
// at runtime (ISR-cached) it re-harvests the latest articles from the PUBLIC sitemap + each article's
// public OG/meta, and unions them with a bundled snapshot (seed.json) for coverage + resilience. If
// the live harvest is disabled or fails, the snapshot keeps the feature working. RED LINE: only public
// /news/ articles, real metadata; no login-walled sections, nothing fabricated.
// (server-only: this module is imported only by the /api/reccessary route handler.)
import { unstable_cache } from 'next/cache';
import seedData from './seed.json';
import type { ReccessaryArticle } from './types';

const SEED = seedData as ReccessaryArticle[];
const BASE = 'https://www.reccessary.com';
const UA = 'Mozilla/5.0 (compatible; CarbonLensBot/1.0; +https://carbonlens.app)';
const LIVE = process.env.RECCESSARY_LIVE !== '0'; // dynamic by default; set RECCESSARY_LIVE=0 to pin to the snapshot
const PER_LANG = 14; // recent articles to refresh live (bounded for latency)
const REVALIDATE = 21600; // 6h

const pick = (html: string, re: RegExp) => { const m = html.match(re); return m ? m[1].trim() : ''; };
const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ');

async function get(url: string, revalidate = REVALIDATE): Promise<string> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(6000), next: { revalidate } });
    return r.ok ? await r.text() : '';
  } catch { return ''; }
}

function parseArticle(url: string, html: string): ReccessaryArticle | null {
  if (!html) return null;
  const lang: ReccessaryArticle['lang'] = url.includes('/en/') ? 'en' : 'zh-tw';
  let title = pick(html, /<meta property="og:title" content="([^"]*)"/i) || pick(html, /<title>([^<]*)<\/title>/i);
  title = decode(title).replace(/\s*\|\s*(新聞|News|Insight|專欄)\s*\|\s*Reccessary\s*$/i, '').replace(/\s*\|\s*Reccessary\s*$/i, '').trim();
  const tags = decode(pick(html, /<meta name="keywords" content="([^"]*)"/i)).split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  if (!title || tags.length === 0) return null;
  return {
    url, lang, title, tags,
    summary: decode(pick(html, /<meta name="description" content="([^"]*)"/i)).slice(0, 160),
    image: pick(html, /<meta property="og:image" content="([^"]*)"/i) || undefined,
    date: pick(html, /"datePublished"\s*:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})/) || undefined,
  };
}

/** Harvest the latest N articles per language from the public sitemap + OG/meta. Bounded + best-effort. */
async function harvestLive(lang: 'zh-tw' | 'en'): Promise<ReccessaryArticle[]> {
  const sm = await get(`${BASE}/sitemap.xml`);
  if (!sm) return [];
  const urls = [...sm.matchAll(new RegExp(`<loc>(${BASE}/${lang}/news/[a-z0-9-]+)</loc>`, 'gi'))].map((m) => m[1]).slice(0, PER_LANG);
  const settled = await Promise.allSettled(urls.map(async (u) => parseArticle(u, await get(u))));
  return settled.flatMap((s) => (s.status === 'fulfilled' && s.value ? [s.value] : []));
}

const cachedFeed = unstable_cache(
  async (lang: 'zh-tw' | 'en'): Promise<ReccessaryArticle[]> => {
    const base = SEED.filter((a) => a.lang === lang);
    if (!LIVE) return base;
    try {
      const live = await harvestLive(lang);
      if (!live.length) return base;
      const byUrl = new Map<string, ReccessaryArticle>();
      for (const a of [...live, ...base]) if (!byUrl.has(a.url)) byUrl.set(a.url, a); // live first (fresher)
      return [...byUrl.values()];
    } catch {
      return base;
    }
  },
  ['reccessary-feed-v1'],
  { revalidate: REVALIDATE, tags: ['reccessary-feed'] },
);

/** The article corpus for a language — live-augmented snapshot, ISR-cached. */
export function getFeed(lang: 'zh-tw' | 'en'): Promise<ReccessaryArticle[]> {
  return cachedFeed(lang);
}
