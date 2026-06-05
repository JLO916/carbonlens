'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import CbamForm from '@/components/diagnose/CbamForm';
import CbamResultView from '@/components/diagnose/CbamResult';
import LeadCaptureForm from '@/components/diagnose/LeadCaptureForm';
import DualCTA from '@/components/diagnose/DualCTA';
import Disclaimer from '@/components/diagnose/Disclaimer';
import { diagnoseCbam, type CbamDefaultLookup } from '@/lib/diagnose/logic/cbam';
import { classifyLead } from '@/lib/diagnose/logic/lead-routing';
import { buildCbamChecklist } from '@/lib/diagnose/logic/checklist';
import type { CbamInput, CbamResult, LeadRoutingResult } from '@/lib/diagnose/types';

const ENTERPRISE_CTA = {
  title: { zhTW: '預約 CBAM 因應評估', en: 'Book a CBAM response assessment' },
  desc: {
    zhTW: 'RECC 數據層協助盤點暴露，並對接申報執行夥伴（申報、查證的最後一哩）。',
    en: 'RECC’s data layer maps your exposure and connects you to filing-execution partners (declaration & verification).',
  },
};

export default function CbamDiagnoseClient() {
  const { t, lang } = useI18n();
  const [result, setResult] = useState<CbamResult | null>(null);
  const [routing, setRouting] = useState<LeadRoutingResult | null>(null);

  async function handleSubmit(input: CbamInput) {
    setRouting(null);
    let lookup: CbamDefaultLookup | undefined;
    if (input.emissionsSource === 'official_default' && input.exportsToEU) {
      try {
        const res = await fetch(
          `/api/cbam-default?country=${encodeURIComponent(input.originCountry)}&product=${encodeURIComponent(input.product)}&year=${input.year}`,
        );
        const d = await res.json();
        if (d && !d.locked) lookup = { value: d.value, min: d.min, max: d.max, n: d.n, asOf: d.asOf };
      } catch {
        /* leave locked */
      }
    }
    setResult(diagnoseCbam(input, lookup));
  }

  function handleReset() {
    setResult(null);
    setRouting(null);
  }

  function downloadChecklist() {
    if (!result) return;
    const text = buildCbamChecklist(result, lang);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cbam-exposure-assessment.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#5d7d44]">{t('模組三 · CBAM 暴露', 'Module 3 · CBAM exposure')}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('你的 CBAM 暴露評估', 'Your CBAM exposure assessment')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {t(
            '條件式暴露區間（在 ETS €X／噸時…）＋時程與罰則。官方預設值走定期同步＋快取＋異常檢查，通過驗證前以占位呈現、不估算。',
            'A conditional exposure range (at ETS €X/t …) plus timeline and penalties. Official defaults use periodic sync + cache + anomaly checks, shown as placeholders until verified — never estimated.',
          )}
        </p>
      </header>

      <CbamForm onSubmit={handleSubmit} />

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('評估結果', 'Your assessment')}</h2>
            <Button variant="outline" size="sm" onClick={handleReset}>
              {t('重新評估', 'Start over')}
            </Button>
          </div>

          <CbamResultView result={result} />

          {!routing ? (
            <LeadCaptureForm
              module="cbam"
              routingInput={{ euExporter: result.input.exportsToEU }}
              input={result.input}
              onSuccess={setRouting}
              onSkip={() => setRouting(classifyLead({ euExporter: result.input.exportsToEU }))}
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border-2 border-[#89B56C]/30 bg-[#89B56C]/5 p-5">
                <p className="text-sm font-medium text-gray-900">{t('已解鎖完整評估 ✓', 'Full assessment unlocked ✓')}</p>
                <Button onClick={downloadChecklist} className="mt-3 bg-[#89B56C] text-white hover:bg-[#6E9156]">
                  {t('⬇ 下載 CBAM 暴露評估', '⬇ Download CBAM assessment')}
                </Button>
              </div>
              <DualCTA routing={routing} enterprise={ENTERPRISE_CTA} />
            </div>
          )}
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
