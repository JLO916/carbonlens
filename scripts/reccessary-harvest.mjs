// Harvest a snapshot of RECCESSARY public news articles from the PUBLIC sitemap + each article's
// public OG/meta tags (title, keywords, description, image, datePublished). Writes a normalized JSON
// the app uses as the "related articles" corpus — and as the resilient fallback for the live feed.
// DATA RED LINE: only public /news/ articles (no login-walled sections); real metadata, nothing
// fabricated. Re-run periodically (or wire a cron) to refresh.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'lib', 'reccessary', 'seed.json');
const BASE = 'https://www.reccessary.com';
const UA = 'Mozilla/5.0 (compatible; CarbonLensBot/1.0; +https://carbonlens.app)';
const PER_LANG = Number(process.env.PER_LANG || 45);

const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim() : ''; };
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ');

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try { const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal }); return r.ok ? await r.text() : ''; }
  catch { return ''; } finally { clearTimeout(t); }
}

async function articleMeta(url) {
  const html = await fetchText(url);
  if (!html) return null;
  const lang = url.includes('/en/') ? 'en' : 'zh-tw';
  let title = pick(html, /<meta property="og:title" content="([^"]*)"/i) || pick(html, /<title>([^<]*)<\/title>/i);
  title = decode(title).replace(/\s*\|\s*(新聞|News|Insight|專欄)\s*\|\s*Reccessary\s*$/i, '').replace(/\s*\|\s*Reccessary\s*$/i, '').trim();
  const keywords = decode(pick(html, /<meta name="keywords" content="([^"]*)"/i)).split(/[,，]/).map((s) => s.trim()).filter(Boolean);
  const summary = decode(pick(html, /<meta name="description" content="([^"]*)"/i));
  const image = pick(html, /<meta property="og:image" content="([^"]*)"/i);
  const date = pick(html, /"datePublished"\s*:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})/);
  if (!title || keywords.length === 0) return null; // need tags to match on — skip untagged
  return { url, lang, title, tags: keywords, summary: summary.slice(0, 160), image, date };
}

async function mapLimit(items, limit, fn) {
  const out = []; let i = 0;
  const workers = Array.from({ length: limit }, async () => { while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); } });
  await Promise.all(workers);
  return out;
}

async function main() {
  console.log('Fetching sitemap…');
  const sm = await fetchText(`${BASE}/sitemap.xml`);
  const urls = [...sm.matchAll(/<loc>([^<]+\/(?:zh-tw|en)\/news\/[a-z0-9-]+)<\/loc>/gi)].map((m) => m[1]);
  const zh = urls.filter((u) => u.includes('/zh-tw/')).slice(0, PER_LANG);
  const en = urls.filter((u) => u.includes('/en/')).slice(0, PER_LANG);
  console.log(`Sitemap: ${urls.length} news URLs → harvesting ${zh.length} zh-tw + ${en.length} en…`);

  const metas = (await mapLimit([...zh, ...en], 6, articleMeta)).filter(Boolean);
  // dedupe by url
  const seen = new Set();
  const articles = metas.filter((a) => !seen.has(a.url) && seen.add(a.url));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(articles, null, 0) + '\n');
  console.log(`✓ Wrote ${articles.length} articles → ${path.relative(path.join(__dirname, '..'), OUT)}`);
  console.log('Sample tags:', [...new Set(articles.flatMap((a) => a.tags))].slice(0, 30).join(' · '));
}
main().catch((e) => { console.error(e); process.exit(1); });
