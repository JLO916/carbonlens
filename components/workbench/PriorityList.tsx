'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { rankObligations, PRIORITY_METHODOLOGY } from '@/lib/workbench/prioritize';
import type { WorkbenchResult } from '@/lib/workbench/aggregate';

const COLOR: Record<string, string> = {
  domestic: '#89B56C',
  disclosure: '#d97706',
  cbam: '#3b82f6',
  'supply-chain': '#f43f5e',
};

export default function PriorityList({ result }: { result: WorkbenchResult }) {
  const { t, tObj } = useI18n();
  const items = rankObligations(result);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('先做哪件？（跨義務優先序）', 'Do this first (cross-obligation priority)')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={item.key} className="flex items-start gap-3">
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: COLOR[item.key] }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800">{tObj(item.title)}</p>
                <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: COLOR[item.key] }} />
                </div>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{tObj(item.rationale)}</p>
            </div>
          </div>
        ))}
        <p className="border-t border-gray-100 pt-2 text-[11px] leading-relaxed text-gray-400">{tObj(PRIORITY_METHODOLOGY)}</p>
      </CardContent>
    </Card>
  );
}
