// Related-articles endpoint: returns the top RECCESSARY public news articles matched to the analysis
// surface (ctx) + company profile signals (industry/country/frameworks), in the requested language.
// The corpus is a live-augmented snapshot (lib/reccessary/feed.ts); matching is keyword overlap.
import { getFeed } from '@/lib/reccessary/feed';
import { rankArticlesWithBackfill } from '@/lib/reccessary/match';
import type { RelatedContext } from '@/lib/reccessary/types';

export const revalidate = 21600; // 6h ISR for the route

const CONTEXTS = new Set<RelatedContext>(['cbam', 'carbonFee', 'scope2re100', 'targets', 'disclosure', 'inventory', 'general']);

export async function GET(req: Request): Promise<Response> {
  const sp = new URL(req.url).searchParams;
  const lang = sp.get('lang') === 'en' ? 'en' : 'zh-tw';
  const ctxParam = sp.get('ctx') ?? 'general';
  const context: RelatedContext = CONTEXTS.has(ctxParam as RelatedContext) ? (ctxParam as RelatedContext) : 'general';
  const industry = sp.get('industry') || undefined;
  const country = sp.get('country') || undefined;
  const frameworks = (sp.get('fw') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const n = Math.min(10, Math.max(5, Number(sp.get('n') || 8))); // always 5–10 articles

  try {
    const feed = await getFeed(lang);
    const items = rankArticlesWithBackfill(feed, { context, industry, country, frameworks }, lang, n, 5);
    return Response.json(
      { items },
      { headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' } },
    );
  } catch {
    return Response.json({ items: [] });
  }
}
