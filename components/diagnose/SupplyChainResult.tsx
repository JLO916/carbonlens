'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import type { PressureLevel, SupplyChainResult } from '@/lib/diagnose/types';
import CitationTag from './CitationTag';

// Qualitative pressure → alert color (high = more pressure). Not a stock metric.
function band(level: PressureLevel) {
  if (level === 'high') return { color: '#dc2626', label: { zhTW: '高', en: 'High' } };
  if (level === 'medium') return { color: '#d97706', label: { zhTW: '中', en: 'Medium' } };
  return { color: '#64748b', label: { zhTW: '低', en: 'Low' } };
}

export default function SupplyChainResultView({ result }: { result: SupplyChainResult }) {
  const { t, tObj } = useI18n();
  const b = band(result.pressureLevel);

  return (
    <div className="space-y-5">
      {/* Expected pressure level */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{t('預期被要求壓力', 'Expected demand pressure')}</p>
            <p className="mt-1 text-xs text-gray-400">{t('定性等級，非金額', 'Qualitative level, not an amount')}</p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-lg font-bold"
            style={{ color: b.color, backgroundColor: `${b.color}1a` }}
          >
            {tObj(b.label)}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-700">{tObj(result.pressureRationale)}</p>
        <p className="mt-3 border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-gray-400">
          {tObj(result.pressureNote)}
        </p>
      </div>

      {/* Expected demands per framework */}
      <Card className="border-l-4 border-l-[#89B56C]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('預期被要求事項（依公開框架承諾）', 'Expected demands (from public framework commitments)')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.expectations.length > 0 ? (
            result.expectations.map((e) => (
              <div key={e.key} className="rounded-lg border border-gray-100 bg-white p-3">
                <p className="text-sm font-semibold text-gray-800">{tObj(e.name)}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{tObj(e.commitment)}</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-[#5d7d44]">{tObj(e.expectedAsk)}</p>
              </div>
            ))
          ) : (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{result.unsureNote ? tObj(result.unsureNote) : ''}</p>
          )}
          <CitationTag citation={result.frameworksCitation} className="mt-2" />
        </CardContent>
      </Card>

      {/* Why Scope 3 falls on suppliers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('為何壓力落在供應商（Scope 3 規模）', 'Why pressure lands on suppliers (Scope 3 scale)')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <ul className="list-disc space-y-1.5 pl-5">
            {result.scope3.points.map((p, i) => (
              <li key={i}>{tObj(p)}</li>
            ))}
          </ul>
          {result.scope3.industryNote && (
            <p className="rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">{tObj(result.scope3.industryNote)}</p>
          )}
          <CitationTag citation={result.scope3.citation} className="mt-2" />
        </CardContent>
      </Card>

      {/* Transmission mechanism */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('傳導機制', 'Transmission mechanism')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>{tObj(result.transmission.text)}</p>
          <CitationTag citation={result.transmission.citation} className="mt-2" />
        </CardContent>
      </Card>

      {/* CSRD value-chain cap protection */}
      <Card className={result.csrdProtection.protected ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-500'}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('CSRD 價值鏈上限保護', 'CSRD value-chain cap protection')}</CardTitle>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                result.csrdProtection.protected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {result.csrdProtection.protected ? t('有保護', 'Protected') : t('不在保護範圍', 'Not protected')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>{tObj(result.csrdProtection.text)}</p>
          <CitationTag citation={result.csrdProtection.citation} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
