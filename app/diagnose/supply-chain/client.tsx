'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import SupplyChainForm from '@/components/diagnose/SupplyChainForm';
import SupplyChainResultView from '@/components/diagnose/SupplyChainResult';
import LeadCaptureForm from '@/components/diagnose/LeadCaptureForm';
import DualCTA from '@/components/diagnose/DualCTA';
import Disclaimer from '@/components/diagnose/Disclaimer';
import WorkbenchBridge from '@/components/WorkbenchBridge';
import RelatedArticles from '@/components/RelatedArticles';
import { diagnoseSupplyChain } from '@/lib/diagnose/logic/supply-chain';
import { classifyLead } from '@/lib/diagnose/logic/lead-routing';
import { buildSupplyChainChecklist } from '@/lib/diagnose/logic/checklist';
import type { SupplyChainInput, SupplyChainResult, LeadRoutingResult } from '@/lib/diagnose/types';

const ENTERPRISE_CTA = {
  title: { zhTW: '預約供應鏈碳數據與對標服務', en: 'Book a supply-chain carbon data & benchmarking service' },
  desc: {
    zhTW: '由 RECC 協助建立可被查證的排放數據、回應品牌要求並對標同業。',
    en: 'RECC helps you build verifiable emissions data, respond to brand demands, and benchmark peers.',
  },
};

export default function SupplyChainDiagnoseClient() {
  const { t, lang } = useI18n();
  const [result, setResult] = useState<SupplyChainResult | null>(null);
  const [routing, setRouting] = useState<LeadRoutingResult | null>(null);

  function handleSubmit(input: SupplyChainInput) {
    setRouting(null);
    setResult(diagnoseSupplyChain(input));
  }

  function handleReset() {
    setResult(null);
    setRouting(null);
  }

  function downloadChecklist() {
    if (!result) return;
    const text = buildSupplyChainChecklist(result, lang);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supply-chain-carbon-profile.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#5d7d44]">{t('模組二 · 供應鏈碳要求', 'Module 2 · Supply-chain carbon demands')}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('你的供應鏈碳壓力側寫', 'Your supply-chain carbon pressure profile')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {t(
            '依品牌客戶的公開承諾（RE100／SBTi／CDP），側寫您「預期被要求」的供應鏈碳壓力——定性風險側寫，非金額損失。',
            'Profile the supply-chain carbon pressure you’re likely to face, from brand customers’ public commitments (RE100/SBTi/CDP) — a qualitative risk profile, not a monetary loss.',
          )}
        </p>
      </header>

      <SupplyChainForm onSubmit={handleSubmit} />

      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('側寫結果', 'Your profile')}</h2>
            <Button variant="outline" size="sm" onClick={handleReset}>
              {t('重新側寫', 'Start over')}
            </Button>
          </div>

          <SupplyChainResultView result={result} />

          <WorkbenchBridge from={t('供應鏈壓力', 'Supply-chain pressure')} />

          {!routing ? (
            <LeadCaptureForm
              module="supply-chain"
              routingInput={{ employeeBand: result.input.employeeBand, exportSupplyChain: result.input.exportSupplyChain }}
              pressureLevel={result.pressureLevel}
              input={result.input}
              onSuccess={setRouting}
              onSkip={() => setRouting(classifyLead({ employeeBand: result.input.employeeBand, exportSupplyChain: result.input.exportSupplyChain }))}
            />
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border-2 border-[#89B56C]/30 bg-[#89B56C]/5 p-5">
                <p className="text-sm font-medium text-gray-900">{t('已解鎖完整側寫 ✓', 'Full profile unlocked ✓')}</p>
                <Button
                  onClick={downloadChecklist}
                  className="mt-3 bg-[#89B56C] text-white hover:bg-[#6E9156]"
                >
                  {t('⬇ 下載供應鏈碳壓力側寫', '⬇ Download supply-chain profile')}
                </Button>
              </div>
              <DualCTA routing={routing} enterprise={ENTERPRISE_CTA} />
            </div>
          )}

          <RelatedArticles context="inventory" industry={result.input.industry} frameworks={result.input.frameworks} />
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
