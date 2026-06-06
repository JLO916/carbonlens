'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import ProfileForm from '@/components/workbench/ProfileForm';
import CarbonPnL from '@/components/workbench/CarbonPnL';
import PriorityList from '@/components/workbench/PriorityList';
import ListedResultView from '@/components/diagnose/ListedResult';
import SupplyChainResultView from '@/components/diagnose/SupplyChainResult';
import CbamResultView from '@/components/diagnose/CbamResult';
import Disclaimer from '@/components/diagnose/Disclaimer';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';
import { computeWorkbench, type WorkbenchResult } from '@/lib/workbench/aggregate';
import type { CbamDefaultLookup } from '@/lib/diagnose/logic/cbam';

const enc = encodeURIComponent;

async function fetchLookup(line: CompanyProfile['cbamProducts'][number], profile: CompanyProfile): Promise<CbamDefaultLookup | undefined> {
  if (!profile.exportsToEU || line.emissionsSource !== 'official_default') return undefined;
  const q = line.cnCode
    ? `country=${enc(line.originCountry)}&cnCode=${enc(line.cnCode)}&year=${profile.year}`
    : `country=${enc(line.originCountry)}&product=${enc(line.product)}&year=${profile.year}`;
  try {
    const d = await (await fetch(`/api/cbam-default?${q}`)).json();
    if (d && !d.locked) {
      return d.mode === 'cn'
        ? { mode: 'cn', cnCode: d.cnCode, description: d.description, value: d.value, base: d.base, markupPct: d.markupPct, asOf: d.asOf }
        : { mode: 'range', min: d.min, max: d.max, n: d.n, asOf: d.asOf };
    }
  } catch {
    /* leave locked */
  }
  return undefined;
}

export default function WorkbenchClient() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile());
  const [result, setResult] = useState<WorkbenchResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function compute() {
    setBusy(true);
    try {
      const lookups = await Promise.all(profile.cbamProducts.map((line) => fetchLookup(line, profile)));
      setResult(computeWorkbench(profile, lookups));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#5d7d44]">{t('合規工作台', 'Compliance workbench')}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{t('你的碳合規全貌', 'Your whole carbon-compliance picture')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {t(
            '填一次公司側寫,同時算出國內碳費、CBAM 暴露、IFRS 揭露與供應鏈壓力,並給跨義務的「先做哪件」。資料只存在你的瀏覽器。',
            'Fill your company profile once — get domestic carbon fee, CBAM exposure, IFRS disclosure and supply-chain pressure together, plus a cross-obligation "do this first". Data stays in your browser.',
          )}
        </p>
      </header>

      <ProfileForm profile={profile} onChange={(p) => setProfile(p)} />

      <Button onClick={compute} disabled={busy} className="h-11 w-full bg-[#89B56C] text-base text-white hover:bg-[#6E9156]">
        {busy ? t('計算中…', 'Computing…') : t('計算我的合規全貌', 'Compute my whole picture')}
      </Button>

      {result && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{t('碳合規 P&L', 'Carbon-compliance P&L')}</h2>
          <CarbonPnL result={result} />
          <PriorityList result={result} />

          <details className="rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-gray-700">▸ {t('明細：各模組完整診斷', 'Detail: full per-module diagnosis')}</summary>
            <div className="mt-4 space-y-6">
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{t('上市櫃揭露', 'Listed disclosure')}</h3>
                <ListedResultView result={result.listed} />
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{t('供應鏈碳要求', 'Supply-chain demands')}</h3>
                <SupplyChainResultView result={result.supplyChain} />
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{t('CBAM 暴露（逐品項）', 'CBAM exposure (per line)')}</h3>
                <div className="space-y-5">
                  {result.cbam.lines.map(({ line, result: r }) => (
                    <div key={line.id}>
                      <p className="mb-1 text-xs font-medium text-gray-600">{line.label}</p>
                      <CbamResultView result={r} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </details>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
