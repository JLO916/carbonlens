'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n/context';
import InfoHint from '@/components/ui/InfoHint';
import CitationTag from '@/components/diagnose/CitationTag';
import { CITATION_TW_ETS } from '@/lib/diagnose/data/taiwan-ets';
import {
  transitionOutlook,
  DEFAULT_TRANSITION_ASSUMPTIONS,
  OFFSET_ROUTES,
  TRANSITION_NOTE,
} from '@/lib/workbench/transition';
import type { WorkbenchResult } from '@/lib/workbench/aggregate';
import type { CompanyProfile } from '@/lib/workbench/profile';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

/** ②/③/④ — fee→ETS transition outlook (assumption-driven), the asset upside, and offset routes.
 *  Taiwan-only; every ETS number is the user's assumption (no official cap/price exists yet). */
export default function TransitionOutlook({ profile, result }: { profile: CompanyProfile; result: WorkbenchResult }) {
  const { t, tObj } = useI18n();
  const [price, setPrice] = useState(DEFAULT_TRANSITION_ASSUMPTIONS.allowancePriceTWD);
  const [freePct, setFreePct] = useState(DEFAULT_TRANSITION_ASSUMPTIONS.freeAllocationPct);

  const reductionPct = profile.targetReductionPct && profile.targetReductionPct > 0 ? profile.targetReductionPct : 0;
  const o = transitionOutlook(profile, result, { allowancePriceTWD: price, freeAllocationPct: freePct }, reductionPct);
  if (!o.applies || o.twEmissionsTonnes <= 0) return null;

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">🔭 {t('碳費 → ', 'Fee → ')}<InfoHint termKey="ets" label="ETS" />{t(' 轉型前瞻（情境試算）', ' transition outlook (scenario)')}</CardTitle>
        <p className="mt-1 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800">⚠️ {tObj(TRANSITION_NOTE)}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* assumptions — clearly the user's, not official */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t('額度價格（假設）NT$/噸', 'Allowance price (assumed) NT$/t')}</Label>
            <Input type="number" className="h-9" value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} />
            <p className="text-[10px] text-gray-400">{t('錨點:現行碳費率 NT$300,非 ETS 官方價', 'Anchor: today’s fee NT$300 — not an official ETS price')}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('免費配額占比（假設）%', 'Free allocation (assumed) %')}</Label>
            <Input type="number" className="h-9" value={freePct} onChange={(e) => setFreePct(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
            <p className="text-[10px] text-gray-400">{t('初期預期較高、逐年收緊（實際未定）', 'Early ETS ≈ high, tightening later (undecided)')}</p>
          </div>
        </div>

        {/* fee vs ETS — current */}
        <div className="overflow-hidden rounded-lg border border-gray-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50/70 text-left text-gray-500">
                <th className="px-3 py-1.5 font-medium">{t(`台灣排放 ${fmt(o.twEmissionsTonnes)} tCO₂e`, `Taiwan ${fmt(o.twEmissionsTonnes)} tCO₂e`)}</th>
                <th className="px-3 py-1.5 text-right font-medium">{t('現況', 'Now')}</th>
                {reductionPct > 0 && <th className="px-3 py-1.5 text-right font-medium">{t(`達標後（−${o.reductionPct}%）`, `After (−${o.reductionPct}%)`)}</th>}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-1.5 text-gray-700">{t('費率制:碳費', 'Fee regime: carbon fee')}</td>
                <td className="px-3 py-1.5 text-right font-mono text-gray-800">NT${fmt(o.feeNowTWD)}</td>
                {reductionPct > 0 && <td className="px-3 py-1.5 text-right font-mono text-[#5d7d44]">NT${fmt(o.feeAfterTWD)}</td>}
              </tr>
              <tr className="border-t border-gray-100">
                <td className="px-3 py-1.5 text-gray-700">{t('總量管制:買額度（假設）', 'Cap-and-trade: buy allowances (assumed)')}<br /><span className="text-[10px] text-gray-400">{t(`超出免費配額 ${fmt(o.etsLiableTonnes)} t × NT$${fmt(price)}`, `${fmt(o.etsLiableTonnes)} t over free × NT$${fmt(price)}`)}</span></td>
                <td className="px-3 py-1.5 text-right font-mono text-gray-800">≈ NT${fmt(o.etsCostTWD)}</td>
                {reductionPct > 0 && <td className="px-3 py-1.5 text-right font-mono text-[#5d7d44]">≈ NT${fmt(o.etsAfterTWD)}</td>}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ④ asset face */}
        {reductionPct > 0 && o.surplusTonnes > 0 && (
          <div className="rounded-lg border border-[#89B56C]/30 bg-[#89B56C]/5 p-3 text-xs">
            <p className="font-semibold text-[#5d7d44]">💰 {t('資產面:減量超過免費配額', 'Asset upside: cutting below your free allocation')}</p>
            <p className="mt-1 text-gray-700">{t(`達標後排放 ${fmt(o.reducedEmissionsTonnes)} t < 免費配額 ${fmt(o.freeAllocationTonnes)} t → 剩餘 `, `After −${o.reductionPct}% you’d emit ${fmt(o.reducedEmissionsTonnes)} t < ${fmt(o.freeAllocationTonnes)} t free → a surplus of `)}<span className="font-mono font-semibold text-[#5d7d44]">{fmt(o.surplusTonnes)} t</span>{t(' 可賣出 ≈ ', ' could be sold ≈ ')}<span className="font-mono font-semibold text-[#5d7d44]">NT${fmt(o.surplusValueTWD)}</span>{t('(假設潛在收益)。低排碳企業在總量管制下可能由「成本」轉為「收益」。', ' (illustrative). Under a cap, a low-carbon firm can flip from cost to revenue.')}</p>
          </div>
        )}

        {/* ③ offset routes for residual emissions */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-600">{t(`殘餘排放 ${fmt(o.residualTonnes)} t 的抵換途徑（第三軌:國際碳權）`, `Offset routes for ${fmt(o.residualTonnes)} t residual (third track: credits)`)}</p>
          <div className="mt-2 space-y-2">
            {OFFSET_ROUTES.map((r, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs font-medium text-gray-700">{tObj(r.name)}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">{tObj(r.use)}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-amber-700">⚠ {tObj(r.caveat)}</p>
              </div>
            ))}
          </div>
        </div>

        <CitationTag citation={CITATION_TW_ETS} />
      </CardContent>
    </Card>
  );
}
