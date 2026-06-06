'use client';

import { useI18n } from '@/lib/i18n/context';
import { ASSURANCE_INTRO, ASSURANCE_STEPS, CITATION_ASSURANCE } from '@/lib/workbench/data';
import CitationTag from '@/components/diagnose/CitationTag';

/** The persistent gap across four critique rounds: the tool names verification/assurance as the
 *  bottleneck but never helps. This is a sourced pathway (guidance, not a service). */
export default function AssuranceGuide() {
  const { t, tObj } = useI18n();
  return (
    <details className="rounded-xl border border-gray-200 bg-white p-4">
      <summary className="cursor-pointer list-none text-sm font-medium text-gray-700">
        ▸ {t('查證／確信銜接:把數字變成「官方認可」的最後一關', 'Verification & assurance: the last step to make numbers official')}
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-xs leading-relaxed text-gray-600">{tObj(ASSURANCE_INTRO)}</p>
        <ol className="space-y-2.5">
          {ASSURANCE_STEPS.map((s, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#89B56C]/15 text-[11px] font-bold text-[#5d7d44]">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{tObj(s.title)}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{tObj(s.detail)}</p>
              </div>
            </li>
          ))}
        </ol>
        <CitationTag citation={CITATION_ASSURANCE} />
      </div>
    </details>
  );
}
