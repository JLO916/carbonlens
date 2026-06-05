'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import type { ListedResult } from '@/lib/diagnose/types';
import CitationTag from './CitationTag';
import UrgencyMeter from './UrgencyMeter';

export default function ListedResultView({ result }: { result: ListedResult }) {
  const { t, tObj } = useI18n();
  const { gri, ifrs, disclosureScope, urgency } = result;

  return (
    <div className="space-y-5">
      {/* Urgency first — the headline number */}
      <UrgencyMeter urgency={urgency} />

      {/* GRI universal obligation */}
      <Card className="border-l-4 border-l-[#89B56C]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('永續報告書（GRI）義務', 'Sustainability report (GRI) obligation')}</CardTitle>
            <span className="rounded-full bg-[#89B56C]/10 px-2.5 py-0.5 text-xs font-medium text-[#5d7d44]">
              {t('適用', 'Applies')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>{tObj(gri.scopeNote)}。</p>
          <p>
            <span className="font-medium">{t('申報期限', 'Deadline')}：</span>
            {tObj(gri.annualDeadlineLabel)}
          </p>
          <p>
            <span className="font-medium">{t('編製基準', 'Basis')}：</span>
            {tObj(gri.basis)}
          </p>
          <CitationTag citation={gri.citation} className="pt-2" />
        </CardContent>
      </Card>

      {/* IFRS S1/S2 phase */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('IFRS S1/S2（ISSB 接軌）', 'IFRS S1/S2 (ISSB alignment)')}</CardTitle>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {t(`第 ${ifrs.phase} 階段`, `Phase ${ifrs.phase}`)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{t('編製會計年度', 'Prepare for FY')}</p>
              <p className="mt-0.5 font-medium">{tObj(ifrs.compileFY)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{t('申報時程', 'Filing')}</p>
              <p className="mt-0.5 font-medium">{tObj(ifrs.fileLabel)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {t('同階段家數', 'Firms in this phase')}：{tObj(ifrs.firmCount)}
          </p>
          <p className="rounded-lg bg-amber-50 p-2.5 text-xs leading-relaxed text-amber-800">
            {tObj(result.adoptionBasisNote)}
          </p>
          <CitationTag citation={ifrs.citation} className="pt-1" />
        </CardContent>
      </Card>

      {/* Disclosure scope */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('重點揭露範圍', 'Key disclosure scope')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {disclosureScope.items.map((s) => (
            <div
              key={s.key}
              className={`rounded-lg border p-3 ${s.isHardest ? 'border-amber-200 bg-amber-50/60' : 'border-gray-100 bg-white'}`}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-800">{tObj(s.label)}</p>
                {s.isHardest && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                    {t('最大難點', 'Hardest')}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{tObj(s.description)}</p>
            </div>
          ))}
          <CitationTag citation={disclosureScope.citation} className="pt-1" />
        </CardContent>
      </Card>
    </div>
  );
}
