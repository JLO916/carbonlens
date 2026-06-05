'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import ListedForm from '@/components/diagnose/ListedForm';
import ListedResultView from '@/components/diagnose/ListedResult';
import LeadCaptureForm from '@/components/diagnose/LeadCaptureForm';
import DualCTA from '@/components/diagnose/DualCTA';
import Disclaimer from '@/components/diagnose/Disclaimer';
import { diagnoseListed } from '@/lib/diagnose/logic/listed';
import { classifyLead } from '@/lib/diagnose/logic/lead-routing';
import { buildChecklist } from '@/lib/diagnose/logic/checklist';
import type { ListedInput, ListedResult, LeadRoutingResult } from '@/lib/diagnose/types';

export default function ListedDiagnoseClient() {
  const { t, lang } = useI18n();
  const [result, setResult] = useState<ListedResult | null>(null);
  const [routing, setRouting] = useState<LeadRoutingResult | null>(null);

  function handleSubmit(input: ListedInput) {
    setRouting(null);
    setResult(diagnoseListed(input)); // today defaults to new Date() (client-side)
  }

  function handleReset() {
    setResult(null);
    setRouting(null);
  }

  function downloadChecklist() {
    if (!result) return;
    const text = buildChecklist(result, lang);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carbon-compliance-checklist.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#5d7d44]">{t('模組一 · 上市櫃揭露', 'Module 1 · Listed disclosure')}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('你的永續揭露義務與急迫度', 'Your disclosure obligations & urgency')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {t(
            '判定永續報告書（GRI）與 IFRS S1/S2 接軌的義務、時程與揭露範圍，並給出 0–100 急迫度分數。',
            'Determine your GRI report and IFRS S1/S2 obligations, timeline and disclosure scope, with a 0–100 urgency score.',
          )}
        </p>
      </header>

      <ListedForm onSubmit={handleSubmit} />

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('診斷結果', 'Your result')}</h2>
            <Button variant="outline" size="sm" onClick={handleReset}>
              {t('重新診斷', 'Start over')}
            </Button>
          </div>

          <ListedResultView result={result} />

          {!routing ? (
            <LeadCaptureForm
              module="listed"
              routingInput={{ capitalTier: result.input.capitalTier }}
              score={result.urgency.total}
              input={result.input}
              onSuccess={setRouting}
              onSkip={() => setRouting(classifyLead({ capitalTier: result.input.capitalTier }))}
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border-2 border-[#89B56C]/30 bg-[#89B56C]/5 p-5">
                <p className="text-sm font-medium text-gray-900">{t('已解鎖完整結果 ✓', 'Full result unlocked ✓')}</p>
                <Button
                  onClick={downloadChecklist}
                  className="mt-3 bg-[#89B56C] text-white hover:bg-[#6E9156]"
                >
                  {t('⬇ 下載初步因應清單', '⬇ Download action checklist')}
                </Button>
              </div>
              <DualCTA routing={routing} />
            </div>
          )}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
