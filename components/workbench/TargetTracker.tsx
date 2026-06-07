'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { targetTrajectory, SBTI_NOTE, CITATION_SBTI } from '@/lib/workbench/target';
import CitationTag from '@/components/diagnose/CitationTag';
import InfoHint from '@/components/ui/InfoHint';
import type { CompanyProfile } from '@/lib/workbench/profile';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

/** C1 — managed target: trajectory base→target, this-year gap / on-track, SBTi alignment. */
export default function TargetTracker({ profile }: { profile: CompanyProfile }) {
  const { t, tObj } = useI18n();
  const tr = targetTrajectory(profile);

  if (!tr) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('🎯 減量目標管理', '🎯 Target management')}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs leading-relaxed text-gray-500">{t('在 ① 設定「基準年 + 目標年 + 目標減量 %」,即可看到目標軌跡、今年缺口、是否在軌與 SBTi 對齊。', 'Set base year + target year + target reduction % in ① to see the trajectory, this-year gap, on-track status and SBTi alignment.')}</p>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(tr.baseEmissions, tr.actual, 1);

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3"><CardTitle className="text-base">{t('🎯 減量目標管理', '🎯 Target management')}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-[11px] text-gray-500">{t('基準年', 'Base')} {tr.baseYear}</p>
            <p className="font-mono text-sm font-semibold">{fmt(tr.baseEmissions)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-[11px] text-gray-500">{t('目標', 'Target')} {tr.targetYear} (−{tr.targetReductionPct}%)</p>
            <p className="font-mono text-sm font-semibold">{fmt(tr.targetEmissions)}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-2">
            <p className="text-[11px] text-blue-600">{t('今年目標', 'This-yr target')} {tr.thisYear}</p>
            <p className="font-mono text-sm font-semibold text-blue-800">{tr.thisYearTarget != null ? fmt(tr.thisYearTarget) : '—'}</p>
          </div>
          <div className={`rounded-lg p-2 ${tr.onTrack ? 'bg-[#89B56C]/15' : 'bg-red-50'}`}>
            <p className={`text-[11px] ${tr.onTrack ? 'text-[#5d7d44]' : 'text-red-600'}`}>{t('今年實際', 'Actual')}</p>
            <p className={`font-mono text-sm font-semibold ${tr.onTrack ? 'text-[#5d7d44]' : 'text-red-700'}`}>{fmt(tr.actual)}</p>
          </div>
        </div>

        {tr.gap != null && (
          <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${tr.onTrack ? 'bg-[#89B56C]/10 text-[#5d7d44]' : 'bg-red-50 text-red-700'}`}>
            <span className="font-medium">{tr.onTrack ? t('✓ 在軌', '✓ On track') : t('⚠ 落後目標', '⚠ Behind target')}</span>
            <span className="font-mono">{tr.gap > 0 ? '+' : ''}{fmt(tr.gap)} tCO₂e {t('vs 今年目標', 'vs this-yr target')}</span>
          </div>
        )}

        {/* mini trajectory bars */}
        <div className="flex items-end gap-1" style={{ height: 44 }}>
          {tr.series.map((s) => (
            <div key={s.year} className="flex-1" title={`${s.year}: ${fmt(s.target)}`}>
              <div className="mx-auto w-full rounded-t bg-[#89B56C]/40" style={{ height: `${Math.max(2, (s.target / max) * 40)}px` }} />
              <p className="mt-0.5 text-center text-[9px] text-gray-400">{String(s.year).slice(2)}</p>
            </div>
          ))}
        </div>

        <p className={`flex flex-wrap items-center gap-x-1 text-xs ${tr.sbtiAligned ? 'text-[#5d7d44]' : 'text-amber-700'}`}>
          <InfoHint termKey="sbti" label={t('隱含年減', 'Implied')} /> {tr.impliedAnnualPct}%/{t('年', 'yr')} ·
          {tr.sbtiAligned ? t(' ✓ 達 SBTi 1.5°C 最低 4.2%/年', ' ✓ meets SBTi 1.5°C min 4.2%/yr') : t(` ✗ 未達 SBTi 1.5°C 最低 4.2%/年`, ` ✗ below SBTi 1.5°C min 4.2%/yr`)}
          {tr.baseAssumed && t(' ·（基準年排放未填,暫用今年值）', ' · (base-year emissions blank — using current)')}
        </p>
        <p className="text-[11px] leading-relaxed text-gray-400">{tObj(SBTI_NOTE)}</p>
        <CitationTag citation={CITATION_SBTI} />
      </CardContent>
    </Card>
  );
}
