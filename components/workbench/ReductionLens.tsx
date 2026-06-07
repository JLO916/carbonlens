'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { applyReduction, REDUCTION_LEVERS, REDUCTION_CBAM_NOTE, type ReductionType } from '@/lib/workbench/reduction';
import { CBAM_SCOPE_NOTE } from '@/lib/workbench/data';
import type { CompanyProfile } from '@/lib/workbench/profile';
import type { CbamDefaultLookup } from '@/lib/diagnose/logic/cbam';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

/** The one honest reduction lever: a target % flows through the REAL engines (no abatement costs).
 *  Shows carbon fee + CBAM before/after, and the key caveat that the official-default CBAM path
 *  does not reward reductions (only actual data does). */
export default function ReductionLens({ profile, lookups }: { profile: CompanyProfile; lookups: (CbamDefaultLookup | undefined)[] }) {
  const { t, tObj } = useI18n();
  // C1 — seed the slider from the managed target (was hardcoded 0, ignoring the user's set target).
  const [pct, setPct] = useState(profile.targetReductionPct ?? 0);
  const [type, setType] = useState<ReductionType>('scope1');

  const base = useMemo(() => computeWorkbench(profile, lookups), [profile, lookups]);
  const reduced = useMemo(() => computeWorkbench(applyReduction(profile, pct, type), lookups), [profile, pct, type, lookups]);

  const feeBase = base.domestic.totalFeeTWD;
  const feeNew = reduced.domestic.totalFeeTWD;
  const cbamBase = base.cbam.totalObligationEUR;
  const cbamNew = reduced.cbam.totalObligationEUR;
  const cbamUnchanged = cbamBase !== undefined && cbamNew !== undefined && cbamNew === cbamBase;

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('減碳鏡：一個目標,牽動三筆', 'Reduction lens: one target, three levers move')}</CardTitle>
        <p className="mt-1 text-xs text-gray-500">{t('拉動目標減量 %,看它如何同時降低碳費與(有實際數據時的)CBAM。', 'Drag a target reduction % to see it lower the carbon fee and (with actual data) CBAM together.')}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{t('目標減量', 'Target reduction')}</span>
            <span className="font-bold text-[#5d7d44]">{pct}%</span>
          </div>
          <input type="range" min={0} max={50} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="mt-2 w-full accent-[#89B56C]" />
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">{t('減量類型', 'Reduction type')}</span>
          <div className="flex flex-wrap gap-2">
            {([['scope1', t('製程／燃料（直接 · Scope 1）', 'Process/fuel (direct · Scope 1)')], ['scope2', t('綠電（外購電力 · Scope 2）', 'Green power (Scope 2)')]] as [ReductionType, string][]).map(([v, label]) => (
              <button key={v} type="button" onClick={() => setType(v)} className={`rounded-md border px-2.5 py-1 text-xs ${type === v ? 'border-[#89B56C] bg-[#89B56C]/10 font-medium text-[#5d7d44]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{t('國內碳費／年', 'Domestic fee / yr')}</p>
            <p className="mt-0.5 text-sm">
              <span className="text-gray-400 line-through">NT${fmt(feeBase)}</span>{' → '}
              <span className="font-bold text-gray-900">NT${fmt(feeNew)}</span>
            </p>
            {pct > 0 && feeBase > feeNew && <p className="text-xs font-medium text-[#5d7d44]">{t(`省 NT$${fmt(feeBase - feeNew)}`, `−NT$${fmt(feeBase - feeNew)}`)}</p>}
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{t(`CBAM 義務（${profile.year}）`, `CBAM obligation (${profile.year})`)}</p>
            {cbamBase !== undefined ? (
              <p className="mt-0.5 text-sm">
                <span className="text-gray-400 line-through">€{fmt(cbamBase)}</span>{' → '}
                <span className="font-bold text-gray-900">€{fmt(cbamNew ?? cbamBase)}</span>
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-gray-400">{t('— 待 ETS 價 / 實際數據', '— needs ETS price / actual data')}</p>
            )}
            {pct > 0 && cbamUnchanged && <p className="text-xs text-amber-600">{t('未變(官方預設值路徑)', 'unchanged (default path)')}</p>}
          </div>
        </div>

        {pct > 0 && type === 'scope2' && (
          <p className="rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">{tObj(CBAM_SCOPE_NOTE)}</p>
        )}
        {pct > 0 && cbamUnchanged && type === 'scope1' && (
          <p className="rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">{tObj(REDUCTION_CBAM_NOTE)}</p>
        )}

        <div>
          <p className="text-xs font-medium text-gray-600">{t('常見減碳槓桿（質性,無成本估算）', 'Common levers (qualitative, no cost estimates)')}</p>
          <div className="mt-2 space-y-1.5">
            {REDUCTION_LEVERS.map((lever, i) => (
              <div key={i} className="text-xs leading-relaxed">
                <span className="font-medium text-gray-700">{tObj(lever.name)}</span>
                <span className="text-gray-500"> — {tObj(lever.note)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
