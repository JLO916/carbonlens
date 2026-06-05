'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import type { ListedResult } from '@/lib/diagnose/types';
import {
  IFRS_LOCAL_NUANCES,
  CITATION_IFRS_ROADMAP,
  IMPLEMENTATION_STEPS,
  CITATION_IMPLEMENTATION,
} from '@/lib/diagnose/data/listed-disclosure';
import CitationTag from './CitationTag';
import UrgencyMeter from './UrgencyMeter';
import Scope3Focus from './Scope3Focus';

export default function ListedResultView({ result }: { result: ListedResult }) {
  const { t, tObj } = useI18n();
  const { gri, ifrs, disclosureScope, urgency } = result;

  return (
    <div className="space-y-5">
      {/* Hard deadlines first — the concrete headline (the score is only a reminder) */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-medium text-gray-500">{t('你的硬死線', 'Your hard deadlines')}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#89B56C]/30 bg-[#89B56C]/5 p-3">
            <p className="text-xs text-gray-500">{t('永續報告書（每年）', 'Sustainability report (annual)')}</p>
            <p className="mt-0.5 font-semibold text-gray-800">{tObj(gri.annualDeadlineLabel)}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-gray-500">{t('IFRS S1/S2 首次申報', 'IFRS S1/S2 first filing')}</p>
            <p className="mt-0.5 font-semibold text-gray-800">{tObj(ifrs.fileLabel)}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">{t('以這些法定時程排你的工作；下方的分數只是輔助提醒。', 'Plan around these statutory dates — the score below is only a supporting reminder.')}</p>
      </div>

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
          <CitationTag citation={gri.citation} className="mt-2" />
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
          <CitationTag citation={ifrs.citation} className="mt-2" />
        </CardContent>
      </Card>

      {/* 在地細節 — collapsible（critique #7） */}
      <details className="rounded-xl border border-gray-200 bg-white p-4">
        <summary className="cursor-pointer list-none text-sm font-medium text-gray-700 marker:hidden">
          ▸ {t('在地細節：你的情況可能不同（金融業／KY 股／過渡規定／查證）', 'Local nuances: your case may differ (financials / KY shares / transition relief / assurance)')}
        </summary>
        <div className="mt-3 space-y-2.5">
          {IFRS_LOCAL_NUANCES.map((n, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-gray-800">{tObj(n.title)}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{tObj(n.detail)}</p>
            </div>
          ))}
          <CitationTag citation={CITATION_IFRS_ROADMAP} className="mt-1" />
        </div>
      </details>

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
          <Scope3Focus industry={result.input.industry} />
          <CitationTag citation={disclosureScope.citation} className="mt-2" />
        </CardContent>
      </Card>

      {/* 實務下一步 — collapsible（critique #9） */}
      <details className="rounded-xl border border-gray-200 bg-white p-4">
        <summary className="cursor-pointer list-none text-sm font-medium text-gray-700 marker:hidden">
          ▸ {t('實務下一步：你真正要做的工（盤查／系統／查證）', 'Next in practice: the real work ahead (inventory / tooling / assurance)')}
        </summary>
        <div className="mt-3 space-y-2.5">
          {IMPLEMENTATION_STEPS.map((s, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-gray-800">{tObj(s.title)}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{tObj(s.detail)}</p>
            </div>
          ))}
          <CitationTag citation={CITATION_IMPLEMENTATION} className="mt-1" />
        </div>
      </details>
    </div>
  );
}
