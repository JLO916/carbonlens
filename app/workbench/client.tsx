'use client';

import { type ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import ProfileForm from '@/components/workbench/ProfileForm';
import CarbonPnL from '@/components/workbench/CarbonPnL';
import FootprintSummary from '@/components/workbench/FootprintSummary';
import CarbonFeeBreakdown from '@/components/workbench/CarbonFeeBreakdown';
import PriorityList from '@/components/workbench/PriorityList';
import CbamRampChart from '@/components/workbench/CbamRampChart';
import ReductionLens from '@/components/workbench/ReductionLens';
import AssuranceGuide from '@/components/workbench/AssuranceGuide';
import SnapshotHistory from '@/components/workbench/SnapshotHistory';
import { loadProfile, saveProfile, exportProfileJson, parseProfile } from '@/lib/workbench/storage';
import { inventorySheetCsv, disclosureReportText, cbamCommunicationCsv } from '@/lib/workbench/export-deliverables';
import { snapshotOf, appendSnapshot, loadSnapshots, type Snapshot } from '@/lib/workbench/snapshots';
import ListedResultView from '@/components/diagnose/ListedResult';
import SupplyChainResultView from '@/components/diagnose/SupplyChainResult';
import CbamResultView from '@/components/diagnose/CbamResult';
import Disclaimer from '@/components/diagnose/Disclaimer';
import { emptyProfile, type CompanyProfile } from '@/lib/workbench/profile';
import { computeWorkbench, type WorkbenchResult } from '@/lib/workbench/aggregate';
import { cbamRampSeries } from '@/lib/workbench/ramp';
import type { CbamDefaultLookup } from '@/lib/diagnose/logic/cbam';

interface ComputeSnapshot {
  profile: CompanyProfile;
  lookups: (CbamDefaultLookup | undefined)[];
  result: WorkbenchResult;
}

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
  const { t, lang } = useI18n();
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile());
  const [snap, setSnap] = useState<ComputeSnapshot | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [busy, setBusy] = useState(false);

  // Hydrate from localStorage after mount (client-only → no SSR/hydration mismatch).
  useEffect(() => {
    const saved = loadProfile();
    if (saved) setProfile(saved);
    setHistory(loadSnapshots());
  }, []);

  async function compute() {
    setBusy(true);
    try {
      const lookups = await Promise.all(profile.cbamProducts.map((line) => fetchLookup(line, profile)));
      setSnap({ profile, lookups, result: computeWorkbench(profile, lookups) });
      saveProfile(profile); // remember the profile across visits
    } finally {
      setBusy(false);
    }
  }

  function takeSnapshot() {
    if (!snap) return;
    setHistory(appendSnapshot(snapshotOf(snap.result, new Date().toISOString())));
  }

  function downloadText(filename: string, text: string, mime: string) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportProfile() {
    downloadText('carbon-workbench-profile.json', exportProfileJson(profile), 'application/json');
  }

  // P2a deliverables — the inventory worksheet + a disclosure draft a practitioner can hand over.
  function exportInventoryCsv() {
    // ﻿ BOM so Excel reads the UTF-8 (Chinese) columns correctly.
    downloadText('ghg-inventory-sheet.csv', '﻿' + inventorySheetCsv(profile, lang), 'text/csv;charset=utf-8');
  }

  function exportReport() {
    if (!snap) return;
    downloadText('climate-disclosure-draft.txt', disclosureReportText(profile, snap.result, lang), 'text/plain;charset=utf-8');
  }

  function exportCbamTemplate() {
    downloadText('cbam-communication-template.csv', '﻿' + cbamCommunicationCsv(profile, lang), 'text/csv;charset=utf-8');
  }

  function importProfile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      const p = parseProfile(text);
      if (p) {
        setProfile(p);
        saveProfile(p);
        setSnap(null);
      } else {
        alert(t('匯入失敗:檔案格式不符或版本不對。', 'Import failed: bad format or wrong version.'));
      }
    });
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

      {!snap && (
        <div className="rounded-xl border border-[#89B56C]/30 bg-[#89B56C]/5 p-3 text-sm leading-relaxed text-gray-700">
          <span className="font-medium text-[#5d7d44]">{t('已幫你預填一組範例 ', 'A sample is pre-filled ')}</span>
          {t('——直接按下方「計算我的合規全貌」即可看結果,再依你的實際數據逐欄調整。約 1 分鐘。', '— just hit “Compute” below to see results, then adjust each field to your real data. ~1 minute.')}
        </div>
      )}

      <ProfileForm profile={profile} onChange={(p) => setProfile(p)} />

      <Button onClick={compute} disabled={busy} className="h-11 w-full bg-[#89B56C] text-base text-white hover:bg-[#6E9156]">
        {busy ? t('計算中…', 'Computing…') : t('計算我的合規全貌', 'Compute my whole picture')}
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <button type="button" onClick={exportProfile} className="text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline">⬇ {t('匯出側寫(JSON 檔)', 'Export profile (JSON)')}</button>
        <span className="text-gray-300">·</span>
        <button type="button" onClick={exportInventoryCsv} className="text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline">⬇ {t('盤查清冊(CSV)', 'Inventory sheet (CSV)')}</button>
        <span className="text-gray-300">·</span>
        <button type="button" onClick={exportCbamTemplate} className="text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline">⬇ {t('CBAM 溝通範本(CSV)', 'CBAM template (CSV)')}</button>
        {snap && <span className="text-gray-300">·</span>}
        {snap && <button type="button" onClick={exportReport} className="text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline">⬇ {t('揭露報告段落(草稿)', 'Disclosure draft (text)')}</button>}
        <span className="text-gray-300">·</span>
        <label className="cursor-pointer text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline">
          ⬆ {t('匯入側寫', 'Import profile')}
          <input type="file" accept="application/json,.json" onChange={importProfile} className="hidden" />
        </label>
        <span className="text-gray-300">·</span>
        <span className="text-gray-400">{t('檔案可攜:換電腦/多 CN 不必重打', 'Portable file: no re-typing on a new laptop')}</span>
      </div>

      {snap && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">{t('碳合規 P&L', 'Carbon-compliance P&L')}</h2>
          <FootprintSummary profile={snap.profile} />
          <CarbonPnL result={snap.result} />
          <CarbonFeeBreakdown result={snap.result} profile={snap.profile} />
          <PriorityList result={snap.result} />
          <CbamRampChart ramp={cbamRampSeries(snap.profile, snap.lookups)} />
          <ReductionLens profile={snap.profile} lookups={snap.lookups} />

          <AssuranceGuide />

          <Button variant="outline" onClick={takeSnapshot} className="w-full">
            📸 {t('拍下這次快照（存到瀏覽器,追蹤變化）', 'Take a snapshot (saved in your browser to track change)')}
          </Button>

          <details className="rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-gray-700">▸ {t('明細：各模組完整診斷', 'Detail: full per-module diagnosis')}</summary>
            <div className="mt-4 space-y-6">
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{t('上市櫃揭露', 'Listed disclosure')}</h3>
                <ListedResultView result={snap.result.listed} />
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{t('供應鏈碳要求', 'Supply-chain demands')}</h3>
                <SupplyChainResultView result={snap.result.supplyChain} />
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{t('CBAM 暴露（逐品項）', 'CBAM exposure (per line)')}</h3>
                <div className="space-y-5">
                  {snap.result.cbam.lines.map(({ line, result: r }) => (
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

      {history.length > 0 && <SnapshotHistory snapshots={history} />}

      <Disclaimer />
    </div>
  );
}
