'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import type { CbamResult } from '@/lib/diagnose/types';
import { CBAM_LIVE_CACHE } from '@/lib/diagnose/data/cbam-cache';
import { STAGED_COUNT, STAGED_COUNTRIES, STAGED_AS_OF, STAGED_SOURCE } from '@/lib/diagnose/data/cbam-staging';
import { CBAM_PITFALLS, CITATION_CBAM_PRACTICE } from '@/lib/diagnose/data/cbam';
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
            <div className="rounded-lg border border-[#89B56C]/30 bg-[#89B56C]/5 p-2.5 text-xs leading-relaxed text-gray-600">
              <span className="font-medium text-[#5d7d44]">✓ {t('同步管線已就位', 'Sync pipeline in place')}：</span>
              {t(
                `已自官方 Excel 解析 ${STAGED_COUNT.toLocaleString()} 筆預設值(${STAGED_COUNTRIES.length} 國,${STAGED_AS_OF})至暫存,待異常檢查與人工基線確認後解鎖、顯示數字。`,
                `Parsed ${STAGED_COUNT.toLocaleString()} default values (${STAGED_COUNTRIES.length} countries, ${STAGED_AS_OF}) from the official Excel into staging; unlocks once anomaly checks pass and a human confirms the baseline.`,
              )}
              <span className="mt-1 block text-[11px] text-gray-400">{t('來源', 'Source')}：{tObj(STAGED_SOURCE)}</span>
            </div>
            <p className="text-xs text-gray-500">{t('改用「實際數據」即可立即估算指示性暴露。', 'Switch to “actual data” to get an indicative estimate now.')}</p>
          </CardContent>
        </Card>
      ) : exposure.indicativeExposureEUR !== undefined ? (
        <Card className="border-2 border-[#89B56C]/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('你買家面臨的 CBAM 成本（指示性、條件式）', 'CBAM cost your buyer faces (indicative, conditional)')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">{t(`在 ETS €${exposure.etsPrice}／噸時`, `At ETS €${exposure.etsPrice}/t`)}</p>
              <p className="mt-1 text-5xl font-extrabold tracking-tight text-gray-900">≈ €{fmt(exposure.indicativeExposureEUR)}</p>
              {exposure.fromOfficialDefault && exposure.exposureMinEUR !== undefined && exposure.exposureMaxEUR !== undefined && (
                <p className="mt-1 text-sm text-gray-500">
                  {t('區間', 'Range')} €{fmt(exposure.exposureMinEUR)} – €{fmt(exposure.exposureMaxEUR)}
                </p>
              )}
              {exposure.fromOfficialDefault ? (
                <p className="mt-1.5 text-xs text-gray-400">
                  {t(
                    `依官方預設值中位數（該類別 ${exposure.defaultN} 筆官方值，${exposure.defaultAsOf}，含加成）;非實際數據,因 CN 碼與廠而異。`,
                    `Median of official defaults (${exposure.defaultN} CN values in this category, ${exposure.defaultAsOf}, incl. mark-up); not actual data — varies by CN code and facility.`,
                  )}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-400">{t('指示性、條件於 ETS 價，實際因廠而異', 'Indicative, conditional on ETS price; actual varies by facility')}</p>
              )}
            </div>
            <div className="rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
              {t(
                '法律上這筆由你的歐盟「進口商」繳納——這是他的成本。對你（出口商）的衝擊是商業性的：可能被轉嫁、被壓價，或在無法提供已查證數據時被換掉供應商。',
                'Legally this is paid by your EU importer — it’s their cost. The impact on you (the exporter) is commercial: it may be passed back, priced down, or you may be switched out if you can’t provide verified data.',
              )}
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
          <div className="space-y-2 pt-2">
            {result.citations.map((c, i) => (
              <CitationTag key={i} citation={c} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 常見實務坑 — collapsible（critique #12） */}
      {input.exportsToEU && (
        <details className="rounded-xl border border-gray-200 bg-white p-4">
          <summary className="cursor-pointer list-none text-sm font-medium text-gray-700 marker:hidden">
            ▸ {t('常見實務坑：為什麼要先把可查證數據備好', 'Common pitfalls: why to get verifiable data ready first')}
          </summary>
          <div className="mt-3 space-y-2">
            <ul className="list-disc space-y-1.5 pl-5 text-xs leading-relaxed text-gray-600">
              {CBAM_PITFALLS.map((p, i) => (
                <li key={i}>{tObj(p)}</li>
              ))}
            </ul>
            <CitationTag citation={CITATION_CBAM_PRACTICE} className="mt-1" />
          </div>
        </details>
      )}
    </div>
  );
}
