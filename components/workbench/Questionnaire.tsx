'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { buildQuestionnaire, type QStatus } from '@/lib/workbench/questionnaire';
import type { CompanyProfile } from '@/lib/workbench/profile';

const MARK: Record<QStatus, string> = { ready: '✅', partial: '🟡', missing: '⬜' };
const VAL_CLS: Record<QStatus, string> = { ready: 'text-gray-900', partial: 'text-amber-700', missing: 'text-gray-400' };

/** S2 — customer questionnaire answer pack: maps the computed result to what customers actually ask
 *  (CDP Supply Chain / brand ESG / SBTi supplier), with ready / partial / missing + the gap list. */
export default function Questionnaire({ profile }: { profile: CompanyProfile }) {
  const { t, tObj, lang } = useI18n();
  const pack = buildQuestionnaire(profile, lang);
  const readyPct = pack.totalCount > 0 ? Math.round((pack.readyCount / pack.totalCount) * 100) : 0;

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">📋 {t('客戶問卷回覆', 'Customer questionnaire answers')}</CardTitle>
          <span className="rounded-full bg-[#89B56C]/15 px-2 py-0.5 text-[11px] font-medium text-[#5d7d44]">{t('可回覆', 'Ready')} {pack.readyCount}/{pack.totalCount}</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{t('你的盤查與目標,自動對映成客戶常問的格式。✅ 可直接回覆 · 🟡 部分 · ⬜ 待補。用上方「⬇ 客戶問卷回覆包」匯出貼給客戶。', 'Your inventory and targets mapped to what customers ask. ✅ ready · 🟡 partial · ⬜ to-do. Export via “Customer answer pack” above to paste to the customer.')}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-[#89B56C]" style={{ width: `${readyPct}%` }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pack.sections.map((s) => (
          <div key={s.key} className="rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-semibold text-gray-800">{tObj(s.title)}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{tObj(s.blurb)}</p>
            <div className="mt-2 space-y-1.5">
              {s.items.map((i, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-x-2 border-b border-dashed border-gray-100 pb-1.5 last:border-0">
                  <span className="text-xs text-gray-600">{MARK[i.status]} {tObj(i.question)}</span>
                  <span className={`font-mono text-xs ${VAL_CLS[i.status]}`}>{i.value}</span>
                  {i.gap && i.status !== 'ready' && <span className="w-full text-[11px] leading-relaxed text-amber-700">↳ {tObj(i.gap)}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {pack.gaps.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="text-xs font-semibold text-amber-800">{t('要補齊回覆,還差這些', 'To complete your answers')}</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] leading-relaxed text-amber-800">
              {pack.gaps.map((g, idx) => <li key={idx}><span className="font-medium">{tObj(g.question)}</span> — {tObj(g.gap)}</li>)}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
