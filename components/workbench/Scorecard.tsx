'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { scorecardSummary, DIMENSION_LABEL, SCORECARD_NOTE, type OrderRisk, type ReqStatus } from '@/lib/workbench/scorecard';
import type { CompanyProfile } from '@/lib/workbench/profile';

const RISK: Record<OrderRisk, { label: { zhTW: string; en: string }; cls: string; dot: string }> = {
  'at-risk': { label: { zhTW: '抽單風險', en: 'Order at risk' }, cls: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  watch: { label: { zhTW: '需補強', en: 'Needs work' }, cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  preferred: { label: { zhTW: '首選供應商', en: 'Preferred' }, cls: 'bg-[#89B56C]/10 text-[#5d7d44] border-[#89B56C]/30', dot: 'bg-[#89B56C]' },
};
const MARK: Record<ReqStatus, string> = { met: '✅', partial: '🟡', unmet: '⬜' };

/** CS — customer scorecard: each brand customer's carbon/ESG requirements vs the supplier's current
 *  status, an order-risk ranking, and the single gap that unblocks the most customers. */
export default function Scorecard({ profile }: { profile: CompanyProfile }) {
  const { t, tObj } = useI18n();
  if ((profile.scorecardCustomers?.length ?? 0) === 0) return null;
  const sum = scorecardSummary(profile);

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">🎯 {t('客戶記分卡', 'Customer scorecard')}</CardTitle>
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${sum.atRisk > 0 ? RISK['at-risk'].cls : RISK.preferred.cls}`}>
            {sum.atRisk > 0 ? `${sum.atRisk} ${t('個客戶有抽單風險', 'at risk')}` : t('全部達標', 'all clear')}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{t('每個客戶的碳/ESG 門檻 vs 你目前的狀態(讀自你算好的盤查、目標與自評評級)。✅ 達標 · 🟡 部分 · ⬜ 未達。', "Each customer's carbon/ESG bar vs your current status (from your computed inventory, targets and self-declared ratings). ✅ met · 🟡 partial · ⬜ unmet.")}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{t('「門票」=必達,任一未達即列抽單風險;「計分」=加權加分。風險:🔴 抽單風險(門票失) · 🟡 需補強(僅計分缺) · 🟢 首選供應商(全達)。', '“Gate” = must-pass; any miss flags order risk. “Scored” = weighted points. Risk: 🔴 at-risk (a gate fails) · 🟡 needs work (only scored gaps) · 🟢 preferred (all met).')}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Highest-leverage gap — fix one thing, unblock the most customers */}
        {sum.leverage.length > 0 && sum.leverage[0].unblocks >= 2 && (
          <div className="rounded-xl border border-[#89B56C]/30 bg-[#89B56C]/5 p-3 text-sm">
            <p className="font-semibold text-[#5d7d44]">⚡ {t('最高槓桿', 'Highest leverage')}</p>
            <p className="mt-0.5 text-gray-700">
              {t('補上「', 'Closing ')}<span className="font-medium">{tObj(DIMENSION_LABEL[sum.leverage[0].dimension])}</span>{t('」可同時解鎖 ', ' unblocks ')}<span className="font-mono font-semibold text-[#5d7d44]">{sum.leverage[0].unblocks}</span>{t(' 個客戶的門票要求(', ' customers’ gate requirements (')}{sum.leverage[0].customers.join('、')}{t(')。', ').')}
            </p>
          </div>
        )}

        {sum.customers.map((cr) => {
          const rk = RISK[cr.risk];
          return (
            <div key={cr.customer.id} className="rounded-xl border border-gray-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <span className={`inline-block h-2 w-2 rounded-full ${rk.dot}`} />{cr.customer.name || '—'}
                  {cr.customer.importance === 'key' && <span className="rounded bg-gray-100 px-1.5 text-[10px] text-gray-500">{t('重點', 'key')}</span>}
                </p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${rk.cls}`}>{tObj(rk.label)}</span>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {t('門票', 'Gates')} {cr.gatesMet}/{cr.gatesTotal}{cr.scoredTotal > 0 && ` · ${t('計分', 'Scored')} ${cr.scoredEarned}/${cr.scoredTotal}`}
              </p>
              <div className="mt-2 space-y-1">
                {cr.rows.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-2 border-b border-dashed border-gray-100 pb-1 last:border-0">
                    <span className="text-xs text-gray-600">
                      {MARK[row.status]} {tObj(DIMENSION_LABEL[row.req.dimension])}
                      {row.req.kind === 'gate' ? <span className="ml-1 text-[10px] text-gray-400">{t('門票', 'gate')}</span> : <span className="ml-1 text-[10px] text-gray-400">{row.req.points ?? 1}{t('分', 'pt')}</span>}
                    </span>
                    <span className="font-mono text-[11px] text-gray-500">{row.have} / {t('需', 'need')} {row.need}</span>
                    {row.gap && row.status !== 'met' && <span className="w-full text-[11px] leading-relaxed text-amber-700">↳ {tObj(row.gap)}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <p className="text-[11px] leading-relaxed text-gray-400">{tObj(SCORECARD_NOTE)}</p>
      </CardContent>
    </Card>
  );
}
