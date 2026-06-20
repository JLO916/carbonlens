'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { allTargetTrajectories, SBTI_NOTE, CITATION_SBTI, type TargetTrajectory, type TargetScope } from '@/lib/workbench/target';
import { renewableForTarget, RE100_TARGET_NOTE } from '@/lib/workbench/re100-target';
import CitationTag from '@/components/diagnose/CitationTag';
import InfoHint from '@/components/ui/InfoHint';
import type { CompanyProfile } from '@/lib/workbench/profile';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

const scopeLabel = (s: TargetScope) => (s === 'scope3' ? 'Scope 3' : s === 'scope123' ? 'Scope 1+2+3' : 'Scope 1+2');

function scopeNote(s: TargetScope, t: (zh: string, en: string) => string) {
  if (s === 'scope3') return t('基準年、目標與實際皆以 Scope 3(價值鏈)比較。', 'Base, target and actual are all on Scope 3 (value chain).');
  if (s === 'scope123') return t('基準年、目標與實際皆以全足跡(含 Scope 3)比較。', 'Base, target and actual are all on the whole footprint (incl. Scope 3).');
  return t('基準年、目標與實際皆以 Scope 1+2(營運)比較;Scope 3 通常另設目標。', 'Base, target and actual are all on Scope 1+2 (operations); Scope 3 usually gets a separate target.');
}

/** One target's trajectory block — base / target / this-year / actual, gap, mini bars, SBTi line. */
function TrajectoryBlock({ tr }: { tr: TargetTrajectory }) {
  const { t } = useI18n();
  const max = Math.max(tr.baseEmissions, tr.actual, 1);
  const heading = tr.label?.trim() || scopeLabel(tr.scope);

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">{heading}</p>
        <span className="rounded-full bg-[#89B56C]/15 px-2 py-0.5 text-[11px] font-medium text-[#5d7d44]">{t('範疇', 'Scope')}:{scopeLabel(tr.scope)}</span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{scopeNote(tr.scope, t)}</p>

      <div className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
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
        <div className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm ${tr.onTrack ? 'bg-[#89B56C]/10 text-[#5d7d44]' : 'bg-red-50 text-red-700'}`}>
          <span className="font-medium">{tr.onTrack ? t('✓ 在軌', '✓ On track') : t('⚠ 落後目標', '⚠ Behind target')}</span>
          <span className="font-mono">{tr.gap > 0 ? '+' : ''}{fmt(tr.gap)} tCO₂e {t('vs 今年目標', 'vs this-yr target')}</span>
        </div>
      )}

      {/* mini trajectory bars */}
      <div className="mt-2 flex items-end gap-1" style={{ height: 44 }}>
        {tr.series.map((s) => (
          <div key={s.year} className="flex-1" title={`${s.year}: ${fmt(s.target)}`}>
            <div className="mx-auto w-full rounded-t bg-[#89B56C]/40" style={{ height: `${Math.max(2, (s.target / max) * 40)}px` }} />
            <p className="mt-0.5 text-center text-[9px] text-gray-400">{String(s.year).slice(2)}</p>
          </div>
        ))}
      </div>

      <p className={`mt-2 flex flex-wrap items-center gap-x-1 text-xs ${tr.sbtiAligned ? 'text-[#5d7d44]' : 'text-amber-700'}`}>
        {tr.sbtiKind === 'netzero' ? (
          <>
            <InfoHint termKey="sbti" label={t('長期淨零', 'Long-term')} /> −{tr.targetReductionPct}% ·
            {tr.sbtiAligned ? t(' ✓ 達 SBTi 淨零(減 ≥90%)', ' ✓ meets SBTi Net-Zero (≥90% cut)') : t(' ✗ 未達 SBTi 淨零(需減 ≥90%)', ' ✗ below SBTi Net-Zero (need ≥90% cut)')}
          </>
        ) : (
          <>
            <InfoHint termKey="sbti" label={t('隱含年減', 'Implied')} /> {tr.impliedAnnualPct}%/{t('年', 'yr')} ·
            {tr.sbtiAligned
              ? t(` ✓ 達 SBTi ${tr.scope === 'scope3' ? 'Scope 3' : '1.5°C'} 最低 ${tr.sbtiBasisPct}%/年`, ` ✓ meets SBTi ${tr.scope === 'scope3' ? 'Scope 3' : '1.5°C'} min ${tr.sbtiBasisPct}%/yr`)
              : t(` ✗ 未達 SBTi ${tr.scope === 'scope3' ? 'Scope 3' : '1.5°C'} 最低 ${tr.sbtiBasisPct}%/年`, ` ✗ below SBTi ${tr.scope === 'scope3' ? 'Scope 3' : '1.5°C'} min ${tr.sbtiBasisPct}%/yr`)}
          </>
        )}
        {tr.baseAssumed && t(' ·（基準年排放未填,暫用今年值）', ' · (base-year emissions blank — using current)')}
      </p>
    </div>
  );
}

/** C1 + E1 — managed targets: a SET of SBTi-style trajectories (near-term Scope 1+2, Scope 3,
 *  net-zero…), each tracked on its own boundary so base vs actual are comparable. */
export default function TargetTracker({ profile }: { profile: CompanyProfile }) {
  const { t, tObj } = useI18n();
  const trajectories = allTargetTrajectories(profile);
  const re = renewableForTarget(profile); // F3 — renewable % implied by the Scope 1+2 target

  if (trajectories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('🎯 減量目標管理', '🎯 Target management')}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs leading-relaxed text-gray-500">{t('在 ① 設定「基準年 + 目標年 + 目標減量 %」,即可看到目標軌跡、今年缺口、是否在軌與 SBTi 對齊。需要多條承諾(近期 Scope 1+2、Scope 3、淨零)時,在「⑧ 額外目標」加列。', 'Set base year + target year + target reduction % in ① to see the trajectory, this-year gap, on-track status and SBTi alignment. Add more commitments (near-term Scope 1+2, Scope 3, net-zero) under ⑧ Extra targets.')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{t('🎯 減量目標管理', '🎯 Target management')}</CardTitle>
          {trajectories.length > 1 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">{trajectories.length} {t('條目標', 'targets')}</span>}
        </div>
        {trajectories.length > 1 && <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{t('一個 SBTi 承諾通常是一組目標:近期 Scope 1+2(1.5°C·4.2%/年)、近期 Scope 3(≥2.5%/年)、與長期淨零(減≥90%),各依所屬準則檢核。', 'An SBTi commitment is usually a set: near-term Scope 1+2 (1.5°C, 4.2%/yr), near-term Scope 3 (≥2.5%/yr), and long-term net-zero (≥90% cut) — each checked against its own criterion.')}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {trajectories.map((tr) => <TrajectoryBlock key={tr.id} tr={tr} />)}

        {re && (
          <div className="rounded-xl border border-[#89B56C]/30 bg-[#89B56C]/5 p-3 text-xs">
            <p className="font-semibold text-[#5d7d44]">🔌 {t('RE100 ↔ Scope 1+2 目標連動', 'RE100 ↔ Scope 1+2 target')}</p>
            {re.alreadyMeets ? (
              <p className="mt-1 text-gray-700">{t('目前綠電', 'Current renewables')} {re.currentRenewablePct}% {t('已足以讓營運排放達成', 'already land operations at the')} {re.targetYear} {t('目標(純綠電情境)。', 'target (renewables-only).')}</p>
            ) : re.achievableByRenewablesAlone ? (
              <p className="mt-1 text-gray-700">{t('純靠綠電達標:', 'Renewables-only path:')} {re.targetYear} {t('綠電需達', 'renewables must reach')} <span className="font-mono font-semibold text-[#5d7d44]">{re.neededRenewablePct}%</span>（{t('目前', 'now')} {re.currentRenewablePct}% · {t('可調 Scope 2', 'addressable Scope 2')} {fmt(re.scope2LocationTonnes)} t）</p>
            ) : (
              <p className="mt-1 text-amber-700">{t('光靠綠電不足:即使 100% 綠電,不可調的 Scope 1 等仍有', 'Renewables alone fall short: even 100% renewable leaves a non-addressable floor of')} {fmt(re.floorTonnes)} t &gt; {t('目標', 'target')} {fmt(re.targetEmissions)} t — {t('須同步削減 Scope 1／用電量。', 'cut Scope 1 / electricity too.')}</p>
            )}
            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{tObj(RE100_TARGET_NOTE)}</p>
          </div>
        )}

        <p className="text-[11px] leading-relaxed text-gray-400">{tObj(SBTI_NOTE)}</p>
        <CitationTag citation={CITATION_SBTI} />
      </CardContent>
    </Card>
  );
}
