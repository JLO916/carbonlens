'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';

interface Article { url: string; title: string; tags: string[]; summary: string; image?: string; date?: string }

interface Props {
  context: string; // RelatedContext — the analysis surface this card sits on
  industry?: string;
  country?: string;
  frameworks?: string[];
}

/** "Further reading" — contextual RECCESSARY articles for the current analysis. Sends only profile
 *  metadata (surface/industry/country/frameworks) to our own API — never the computed carbon figures.
 *  Outbound links carry a UTM only, point at public articles, and open in a new tab. */
export default function RelatedArticles({ context, industry, country, frameworks }: Props) {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    const apiLang = lang === 'en' ? 'en' : 'zh-tw';
    const qs = new URLSearchParams({ ctx: context, lang: apiLang, n: '8' });
    if (industry) qs.set('industry', industry);
    if (country) qs.set('country', country);
    if (frameworks?.length) qs.set('fw', frameworks.join(','));
    let alive = true;
    fetch(`/api/reccessary?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => { if (alive) setItems(Array.isArray(d.items) ? d.items : []); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [context, industry, country, frameworks, lang]);

  if (items.length === 0) return null;

  const utm = (url: string) => url + (url.includes('?') ? '&' : '?') + `utm_source=carbonlens&utm_medium=related&utm_campaign=${encodeURIComponent(context)}`;
  const home = (lang === 'en' ? 'https://www.reccessary.com/en' : 'https://www.reccessary.com/zh-tw') + '?utm_source=carbonlens&utm_medium=related';

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">📰 {t('延伸閱讀', 'Further reading')}</CardTitle>
          <a href={home} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-gray-400 hover:text-[#5d7d44] hover:underline">{t('由 RECCESSARY 提供', 'via RECCESSARY')}</a>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{t('與你這次分析相關的碳與綠電新聞、政策與市場觀察(外部連結)。', 'Carbon & clean-energy news, policy and market coverage relevant to this analysis (external links).')}</p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {items.map((a) => (
            <a key={a.url} href={utm(a.url)} target="_blank" rel="noopener noreferrer" className="group flex gap-3 rounded-lg border border-gray-100 p-2.5 transition-colors hover:border-[#89B56C]/50 hover:bg-[#89B56C]/5">
              {a.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 group-hover:text-[#5d7d44]">{a.title}</p>
                {a.summary && <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-gray-400">{a.summary}</p>}
                {a.date && <p className="mt-1 text-[10px] text-gray-300">{a.date} · RECCESSARY</p>}
              </div>
            </a>
          ))}
        </div>
        <a href={home} target="_blank" rel="noopener noreferrer" className="block pt-1 text-right text-xs font-medium text-[#5d7d44] hover:underline">{t('更多碳與綠電新聞 →', 'More carbon & energy news →')}</a>
      </CardContent>
    </Card>
  );
}
