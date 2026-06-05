'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import type { CbamResult } from '@/lib/diagnose/types';
import { CBAM_LIVE_CACHE } from '@/lib/diagnose/data/cbam-cache';
import CitationTag from './CitationTag';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

export default function CbamResultView({ result }: { result: CbamResult }) {
  const { t, tObj } = useI18n();
  const { input, exposure } = result;

  return (
    <div className="space-y-5">
      {/* Headline: not-applicable / exempt / locked / exposure / need-data */}
      {!input.exportsToEU ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-gray-700">{t('目前不適用 CBAM', 'CBAM not applicable')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('您未出口歐盟，暫無 CBAM 暴露；惟下游品項擬自 2028 擴大，可留意。', 'You don’t export to the EU, so there’s no CBAM exposure now; note the planned 2028 downstream expansion.')}</p>
          </CardContent>
        </Card>
      ) : exposure.deMinimisExempt ? (
        <Card className="border-2 border-emerald-200">
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-emerald-700">{t('大致豁免（de minimis）', 'Broadly exempt (de minimis)')}</p>
            <p className="mt-2 text-sm text-emerald-700">{tObj(result.deMinimisNote)}</p>
          </CardContent>
        </Card>
      ) : exposure.defaultsLocked ? (
        <Card className="border-2 border-gray-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🔒 {t('官方預設值同步中 — 暫鎖', 'Official defaults syncing — locked')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-lg bg-gray-100 p-4 text-center">
              <p className="font-mono text-3xl font-bold tracking-widest text-gray-400">€ ▓▓▓</p>
              <p className="mt-1 text-xs text-gray-500">{t('預設值通過驗證同步前不顯示數字（不估算）', 'No number shown until a verified sync (never estimated)')}</p>
            </div>
            {CBAM_LIVE_CACHE.meta.note && <p className="text-xs leading-relaxed text-gray-500">{tObj(CBAM_LIVE_CACHE.meta.note)}</p>}
            <p className="text-xs text-gray-500">{t('改用「實際數據」即可立即估算指示性暴露。', 'Switch to “actual data” to get an indicative estimate now.')}</p>
          </CardContent>
        </Card>
      ) : exposure.indicativeExposureEUR !== undefined ? (
        <Card className="border-2 border-[#89B56C]/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('指示性 CBAM 暴露（條件式）', 'Indicative CBAM exposure (conditional)')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">{t(`在 ETS €${exposure.etsPrice}／噸時`, `At ETS €${exposure.etsPrice}/t`)}</p>
              <p className="text-4xl font-bold text-gray-900">€{fmt(exposure.indicativeExposureEUR)}</p>
              <p className="mt-1 text-xs text-gray-400">{t('指示性、條件於 ETS 價，實際因廠而異', 'Indicative, conditional on ETS price; actual varies by facility')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">{t('總內含排放', 'Total embedded emissions')}</p>
                <p className="font-semibold">{fmt(exposure.totalEmissions ?? 0)} tCO₂e</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">{t('ETS 價（您輸入）', 'ETS price (your input)')}</p>
                <p className="font-semibold">€{exposure.etsPrice}/tCO₂e</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-amber-200">
          <CardContent className="p-6 text-center">
            <p className="text-lg font-semibold text-amber-800">{t('請輸入實際單位排放與當前 ETS 價', 'Enter actual specific emissions and current ETS price')}</p>
            <p className="mt-1 text-sm text-amber-700">{t('兩者皆填才能算出指示性暴露區間。', 'Both are needed to compute an indicative exposure range.')}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('時程與罰則', 'Timeline & penalties')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          {result.timeline.map((row, i) => (
            <div key={i} className="flex items-start justify-between gap-3 border-b border-gray-50 pb-1.5">
              <span className="shrink-0 font-medium text-gray-600">{tObj(row.label)}</span>
              <span className="text-right text-gray-700">{tObj(row.value)}</span>
            </div>
          ))}
          <p className="rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">{tObj(result.penaltyNote)}</p>
          <p className="text-xs text-gray-500">{tObj(result.deMinimisNote)}</p>
          <p className="text-xs text-gray-500">{tObj(result.markupNote)}</p>
        </CardContent>
      </Card>

      {/* Honest disclosure (§5) */}
      <Card className="border-l-4 border-l-amber-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('誠實揭露', 'Honest disclosure')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-gray-600">
            {result.disclosures.map((d, i) => (
              <li key={i}>{tObj(d)}</li>
            ))}
          </ul>
          <div className="space-y-1 pt-2">
            {result.citations.map((c, i) => (
              <CitationTag key={i} citation={c} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
