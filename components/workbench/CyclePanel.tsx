'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { CYCLE_STAGES, obligationCalendar, type CycleStage } from '@/lib/workbench/cycle';
import type { CompanyProfile } from '@/lib/workbench/profile';

/** C4 — where you are in the annual cycle + when the recurring obligations fall. */
export default function CyclePanel({ profile, onStageChange }: { profile: CompanyProfile; onStageChange: (s: CycleStage) => void }) {
  const { t, tObj } = useI18n();
  const current = profile.cycleStage ?? 'measure';
  const currentIdx = CYCLE_STAGES.findIndex((s) => s.value === current);
  const obligations = obligationCalendar(profile, new Date().toISOString());

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">{t('🗓 ESG 週期狀態與義務行事曆', '🗓 Cycle status & obligation calendar')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* stepper */}
        <div className="flex flex-wrap gap-1.5">
          {CYCLE_STAGES.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onStageChange(s.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${active ? 'bg-[#89B56C] text-white' : done ? 'bg-[#89B56C]/15 text-[#5d7d44]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {done && '✓ '}{tObj(s.label)}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400">{t('點選你目前所在階段(僅供團隊看板,存在你的瀏覽器)。', 'Tap your current stage (a team board, stored in your browser).')}</p>

        {/* obligation calendar + Taiwan ETS roll-out milestones (R4 ①) */}
        {obligations.length > 0 && (
          <div className="space-y-1.5 border-t border-gray-100 pt-3">
            {obligations.map((o) => {
              const isMilestone = o.kind === 'milestone';
              // policy milestones are informational — never the red "overdue" treatment of a filing
              const urgent = !isMilestone && o.daysUntil <= 30;
              const soon = !isMilestone && o.daysUntil > 30 && o.daysUntil <= 90;
              return (
                <div key={o.key} className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-medium text-gray-700">
                      {isMilestone && <span className="shrink-0 rounded-full bg-[#89B56C]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#5d7d44]">{t('制度里程碑', 'Policy')}</span>}
                      <span className="truncate">{tObj(o.label)}</span>
                    </p>
                    <p className="truncate text-[10px] text-gray-400">{tObj(o.source)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-gray-600">{o.dueDate}</p>
                    <p className={`text-[10px] font-medium ${isMilestone ? 'text-[#5d7d44]' : urgent ? 'text-[#d4453e]' : soon ? 'text-amber-600' : 'text-gray-400'}`}>
                      {isMilestone
                        ? (o.daysUntil >= 0 ? t(`約 ${o.daysUntil} 天後`, `~${o.daysUntil}d`) : t('進行中', 'underway'))
                        : (o.daysUntil >= 0 ? t(`還有 ${o.daysUntil} 天`, `in ${o.daysUntil}d`) : t(`已過 ${-o.daysUntil} 天`, `${-o.daysUntil}d ago`))}
                    </p>
                  </div>
                </div>
              );
            })}
            {obligations.some((o) => o.kind === 'milestone') && (
              <p className="border-t border-gray-50 pt-2 text-[10px] leading-relaxed text-gray-400">
                {t('「制度里程碑」為環境部碳市場「三軌並進」(碳費 + ETS + 國際碳權)的規劃時程,日期暫定、以官方公告為準;ETS 目前尚無官方總量、配額比例或額度價格,故本工具不試算 ETS 費用。', 'Policy milestones reflect MOENV’s three-track plan (carbon fee + ETS + international credits); dates are indicative — defer to official notices. No official ETS cap, allocation or allowance price exists yet, so this tool does not estimate an ETS cost.')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
