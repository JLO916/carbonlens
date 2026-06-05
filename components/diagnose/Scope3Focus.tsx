'use client';

import { useI18n } from '@/lib/i18n/context';
import { SCOPE3_CATEGORIES, materialScope3, CITATION_SCOPE3_CATEGORIES } from '@/lib/diagnose/data/scope3-categories';
import CitationTag from './CitationTag';

/** "Which Scope 3 categories actually matter for your industry" — a starting point,
 *  not a materiality assessment. (Critique #6: move from "Scope 3 is hard" to specifics.) */
export default function Scope3Focus({ industry }: { industry: string }) {
  const { t, tObj } = useI18n();
  const cats = materialScope3(industry);
  if (cats.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      <p className="text-sm font-semibold text-gray-800">
        {t('你這產業的 Scope 3 重點類別（起點）', 'Likely material Scope 3 categories for your industry (a starting point)')}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <span key={c.num} className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-700 ring-1 ring-amber-200">
            <span className="font-medium text-amber-700">{t(`類別 ${c.num}`, `Cat ${c.num}`)}</span>・{tObj(c.name)}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-gray-400">
        {t(
          'GHG Protocol 共 15 類；以上為依產業常見重點,先從這幾類盤起。實際重大性須自行評估。',
          'GHG Protocol defines 15 categories; these are common focuses by industry — start your inventory here. Assess your own materiality.',
        )}
      </p>
      <CitationTag citation={CITATION_SCOPE3_CATEGORIES} className="mt-2" />
    </div>
  );
}
