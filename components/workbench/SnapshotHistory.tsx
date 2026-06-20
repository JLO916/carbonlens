'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { monthsSince, STALE_MONTHS } from '@/lib/diagnose/aging';
import type { Snapshot } from '@/lib/workbench/snapshots';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

export default function SnapshotHistory({ snapshots }: { snapshots: Snapshot[] }) {
  const { t } = useI18n();
  if (snapshots.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">{t('快照歷史（存在你的瀏覽器）', 'Snapshot history (in your browser)')}</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-400">
                <th className="py-1.5 pr-3 font-medium">{t('年度', 'Year')}</th>
                <th className="py-1.5 pr-3 font-medium">{t('日期', 'Date')}</th>
                <th className="py-1.5 pr-3 font-medium">{t('總足跡 tCO₂e', 'Footprint tCO₂e')}</th>
                <th className="py-1.5 pr-3 font-medium">{t('碳費/年', 'Fee/yr')}</th>
                <th className="py-1.5 pr-3 font-medium">{t('CBAM 義務', 'CBAM')}</th>
                <th className="py-1.5 pr-3 font-medium">{t('供應鏈', 'Supply')}</th>
                <th className="py-1.5 font-medium">{t('IFRS', 'IFRS')}</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s, i) => {
                const aged = monthsSince(s.at.slice(0, 7));
                const stale = aged !== null && aged >= STALE_MONTHS;
                const prior = snapshots[i + 1]; // newest-first → next item is the earlier period
                const delta = s.footprintTonnes != null && prior?.footprintTonnes && prior.year === s.year ? ((s.footprintTonnes - prior.footprintTonnes) / prior.footprintTonnes) * 100 : null;
                const isYearBoundary = prior == null || prior.year !== s.year;
                return (
                  <tr key={i} className={`border-b text-gray-700 ${isYearBoundary ? 'border-gray-200' : 'border-gray-50'}`}>
                    <td className="py-1.5 pr-3 font-semibold text-gray-800">{s.year ?? '—'}</td>
                    <td className="py-1.5 pr-3">
                      {s.at.slice(0, 10)}
                      {aged !== null && aged >= 1 && <span className={stale ? 'ml-1 text-amber-600' : 'ml-1 text-gray-400'}>· {aged}{t('月前', 'mo')}</span>}
                    </td>
                    <td className="py-1.5 pr-3">
                      {s.footprintTonnes != null ? fmt(s.footprintTonnes) : '—'}
                      {delta !== null && Math.abs(delta) >= 0.5 && (
                        <span className={delta > 0 ? 'ml-1 text-[#d4453e]' : 'text-[#3a9e4a] ml-1'}>{delta > 0 ? '▲' : '▼'}{Math.abs(delta).toFixed(0)}%</span>
                      )}
                    </td>
                    <td className="py-1.5 pr-3">NT${fmt(s.feeTWD)}</td>
                    <td className="py-1.5 pr-3">{s.cbamObligationEUR !== undefined ? `€${fmt(s.cbamObligationEUR)}` : '🔒'}</td>
                    <td className="py-1.5 pr-3">{s.pressure === 'high' ? t('高', 'H') : s.pressure === 'medium' ? t('中', 'M') : t('低', 'L')}</td>
                    <td className="py-1.5">{t(`第${s.ifrsPhase}`, `P${s.ifrsPhase}`)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
