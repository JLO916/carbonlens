// Builds a downloadable "初步因應清單" from a (fully sourced) ListedResult.
// Content = sourced obligations/timeline + GENERIC, qualitative next steps (no invented
// numbers). Triggered client-side as a Blob — no localStorage/sessionStorage.

import type { CbamResult, ListedResult, PressureLevel, SupplyChainResult } from '@/lib/diagnose/types';
import type { Lang } from '@/lib/i18n/context';

const pick = (lang: Lang) => (o: { zhTW: string; en: string }) => (lang === 'zhTW' ? o.zhTW : o.en);

export function buildChecklist(result: ListedResult, lang: Lang): string {
  const s = pick(lang);
  const { gri, ifrs, disclosureScope, urgency } = result;
  const L = lang === 'zhTW';

  const steps = L
    ? [
        '確認您的 IFRS S1/S2 適用階段與申報年度（如上）。',
        '盤點 Scope 1（直接）與 Scope 2（外購能源）排放源，建立量化方法。',
        '評估 Scope 3 價值鏈資料缺口——這是接軌的最大難點，宜最早啟動。',
        '對照同業的揭露範圍與品質，找出您的落差。',
        '規劃內部治理與資料蒐集流程，並預留第三方查證時間。',
      ]
    : [
        'Confirm your IFRS S1/S2 phase and filing year (above).',
        'Inventory Scope 1 (direct) and Scope 2 (purchased energy) sources; set a quantification method.',
        'Assess Scope 3 value-chain data gaps — the hardest part; start earliest.',
        'Benchmark peers’ disclosure scope and quality to find your gaps.',
        'Plan internal governance and data collection, and reserve time for third-party assurance.',
      ];

  const lines: string[] = [];
  const h = (x: string) => lines.push(x);

  h(L ? '# 碳合規暴露 — 初步因應清單（上市櫃揭露）' : '# Carbon Compliance Exposure — Action Checklist (Listed Disclosure)');
  h('');
  h(`${L ? '合規急迫度分數' : 'Urgency score'}: ${urgency.total} / 100`);
  h('');
  h(L ? '## 永續報告書（GRI）義務' : '## Sustainability Report (GRI) obligation');
  h(`- ${s(gri.scopeNote)}`);
  h(`- ${L ? '申報期限' : 'Deadline'}: ${s(gri.annualDeadlineLabel)}`);
  h(`- ${L ? '編製基準' : 'Basis'}: ${s(gri.basis)}`);
  h(`- ${L ? '來源' : 'Source'}: ${s(gri.citation.source)} · ${s(gri.citation.officialDocVersion)} · ${gri.citation.asOfDate}`);
  h('');
  h(L ? '## IFRS S1/S2（ISSB 接軌）' : '## IFRS S1/S2 (ISSB alignment)');
  h(`- ${L ? '階段' : 'Phase'}: ${ifrs.phase}（${s(ifrs.capitalLabel)}）`);
  h(`- ${L ? '編製會計年度' : 'Prepare for FY'}: ${s(ifrs.compileFY)}`);
  h(`- ${L ? '申報時程' : 'Filing'}: ${s(ifrs.fileLabel)}`);
  h(`- ${L ? '來源' : 'Source'}: ${s(ifrs.citation.source)} · ${s(ifrs.citation.officialDocVersion)} · ${ifrs.citation.asOfDate}`);
  h('');
  h(L ? '## 重點揭露範圍' : '## Key disclosure scope');
  for (const item of disclosureScope.items) {
    h(`- ${s(item.label)}${item.isHardest ? (L ? '（最大難點）' : ' (hardest)') : ''}: ${s(item.description)}`);
  }
  h('');
  h(L ? '## 初步因應步驟' : '## Suggested next steps');
  steps.forEach((step, i) => h(`${i + 1}. ${step}`));
  h('');
  h(
    L
      ? '— 本清單為初步診斷與情報參考，非法律意見、非永續簽證。正式申報請依主管機關規範與專業意見辦理。'
      : '— This checklist is a preliminary diagnostic and intelligence reference — not legal advice, not a sustainability assurance. For formal filing, follow the competent authority’s rules and professional advice.',
  );

  return lines.join('\n');
}

export function buildCbamChecklist(result: CbamResult, lang: Lang): string {
  const s = pick(lang);
  const L = lang === 'zhTW';
  const { input, exposure } = result;
  const lines: string[] = [];
  const h = (x: string) => lines.push(x);

  const summary = !input.exportsToEU
    ? L
      ? '未出口歐盟，目前不適用 CBAM。'
      : 'No EU exports — CBAM not applicable now.'
    : exposure.deMinimisExempt
      ? L
        ? '年出口 ≤50 噸，大致豁免（de minimis）。'
        : 'Annual exports ≤50 t — broadly exempt (de minimis).'
      : exposure.defaultsLocked
        ? L
          ? '官方預設值同步中、暫鎖，不顯示估算數字。'
          : 'Official defaults are syncing/locked — no estimate shown.'
        : exposure.indicativeExposureEUR !== undefined
          ? L
            ? `在 ETS €${exposure.etsPrice}／噸時，指示性暴露 ≈ €${Math.round(exposure.indicativeExposureEUR).toLocaleString('en-US')}（排放 ${Math.round(exposure.totalEmissions ?? 0).toLocaleString('en-US')} tCO₂e）。`
            : `At ETS €${exposure.etsPrice}/t, indicative exposure ≈ €${Math.round(exposure.indicativeExposureEUR).toLocaleString('en-US')} (${Math.round(exposure.totalEmissions ?? 0).toLocaleString('en-US')} tCO₂e).`
          : L
            ? '尚未輸入實際排放與 ETS 價，無法估算。'
            : 'Actual emissions and ETS price not entered — no estimate.';

  const steps = L
    ? [
        '確認產品 CN 碼，以及年出口是否逾 50 噸 de minimis 門檻（氫／電力不適用豁免）。',
        '盤點實際單位內含排放（優於使用含加成的官方預設值）。',
        '追蹤當前 EU ETS 價，定期更新暴露估算。',
        '確認授權申報人安排，並對齊 2027/9/30 首次申報與繳交時程。',
        '預約 CBAM 因應評估（RECC 數據層 ＋ 申報執行夥伴）。',
      ]
    : [
        'Confirm your product CN code and whether annual exports exceed the 50 t de minimis (hydrogen/electricity not eligible).',
        'Inventory your actual specific embedded emissions (better than the marked-up official defaults).',
        'Track the current EU ETS price and refresh the exposure estimate regularly.',
        'Confirm authorised-declarant arrangements and align to the 30 Sep 2027 first declaration & surrender.',
        'Book a CBAM response assessment (RECC data layer + filing-execution partner).',
      ];

  h(L ? '# 碳合規暴露 — CBAM 暴露評估' : '# Carbon Compliance Exposure — CBAM Assessment');
  h('');
  h(`${L ? '暴露摘要' : 'Exposure summary'}: ${summary}`);
  h('');
  h(L ? '## 時程' : '## Timeline');
  for (const row of result.timeline) h(`- ${s(row.label)}: ${s(row.value)}`);
  h('');
  h(L ? '## 罰則 / de minimis / 加成' : '## Penalty / de minimis / mark-up');
  h(`- ${s(result.penaltyNote)}`);
  h(`- ${s(result.deMinimisNote)}`);
  h(`- ${s(result.markupNote)}`);
  h('');
  h(L ? '## 誠實揭露' : '## Honest disclosure');
  for (const d of result.disclosures) h(`- ${s(d)}`);
  h('');
  h(L ? '## 初步因應步驟' : '## Suggested next steps');
  steps.forEach((step, i) => h(`${i + 1}. ${step}`));
  h('');
  h(`${L ? '來源' : 'Sources'}: ${result.citations.map((c) => `${s(c.source)} · ${s(c.officialDocVersion)} · ${c.asOfDate}`).join(' ; ')}`);
  h('');
  h(
    L
      ? '— CBAM 繳費義務由歐盟進口商承擔；官方預設值未經驗證同步前不顯示數字、不估算。非法律意見、非永續簽證。'
      : '— The CBAM payment obligation is borne by the EU importer; official defaults are not shown until a verified sync (never estimated). Not legal advice, not a sustainability assurance.',
  );

  return lines.join('\n');
}

const PRESSURE_LABEL: Record<PressureLevel, { zhTW: string; en: string }> = {
  low: { zhTW: '低', en: 'Low' },
  medium: { zhTW: '中', en: 'Medium' },
  high: { zhTW: '高', en: 'High' },
};

export function buildSupplyChainChecklist(result: SupplyChainResult, lang: Lang): string {
  const s = pick(lang);
  const L = lang === 'zhTW';
  const lines: string[] = [];
  const h = (x: string) => lines.push(x);

  const steps = L
    ? [
        '對照 RE100／SBTi／CDP 公開會員名單，確認主要品牌客戶是否在列。',
        '盤點自身 Scope 1/2，並識別客戶最可能要的數據（CDP 問卷／排放數據）。',
        '若員工 <1,000 人，了解 VSME 範圍，避免提供超出義務的資訊。',
        '建立可被第三方查證的數據與回應流程。',
        '預約供應鏈碳數據與對標，了解同業如何回應品牌要求。',
      ]
    : [
        'Cross-check the public RE100 / SBTi / CDP member lists to confirm your key brand customers.',
        'Inventory your Scope 1/2 and identify the data customers most likely want (CDP questionnaire / emissions data).',
        'If under 1,000 employees, understand the VSME scope to avoid over-providing beyond your obligation.',
        'Build a verifiable data and response process.',
        'Book a supply-chain carbon data & benchmarking session to see how peers respond.',
      ];

  h(L ? '# 碳合規暴露 — 供應鏈碳要求側寫' : '# Carbon Compliance Exposure — Supply-Chain Demand Profile');
  h('');
  h(`${L ? '預期被要求壓力（定性，非金額）' : 'Expected demand pressure (qualitative, not an amount)'}: ${s(PRESSURE_LABEL[result.pressureLevel])}`);
  h(`- ${s(result.pressureRationale)}`);
  h(`- ${s(result.pressureNote)}`);
  h('');
  h(L ? '## 預期被要求事項（依公開框架承諾）' : '## Expected demands (from public framework commitments)');
  if (result.expectations.length) {
    for (const e of result.expectations) {
      h(`- ${s(e.name)}: ${s(e.expectedAsk)}`);
    }
  } else if (result.unsureNote) {
    h(`- ${s(result.unsureNote)}`);
  }
  h(`- ${L ? '來源' : 'Source'}: ${s(result.frameworksCitation.source)} · ${result.frameworksCitation.asOfDate}`);
  h('');
  h(L ? '## 為何壓力落在供應商（Scope 3 規模）' : '## Why pressure lands on suppliers (Scope 3 scale)');
  for (const p of result.scope3.points) h(`- ${s(p)}`);
  if (result.scope3.industryNote) h(`- ${s(result.scope3.industryNote)}`);
  h(`- ${L ? '來源' : 'Source'}: ${s(result.scope3.citation.source)} · ${result.scope3.citation.asOfDate}`);
  h('');
  h(L ? '## 傳導機制' : '## Transmission mechanism');
  h(`- ${s(result.transmission.text)}`);
  h('');
  h(L ? '## CSRD 價值鏈上限保護' : '## CSRD value-chain cap protection');
  h(`- ${s(result.csrdProtection.text)}`);
  h('');
  h(L ? '## 初步因應步驟' : '## Suggested next steps');
  steps.forEach((step, i) => h(`${i + 1}. ${step}`));
  h('');
  h(
    L
      ? '— 本側寫基於品牌客戶之公開承諾推估，非該品牌對貴司的具體要求，亦非金額損失。非法律意見、非永續簽證。'
      : '— This profile is estimated from brand customers’ public commitments — not any brand’s specific demand on your company, and not a monetary loss. Not legal advice, not a sustainability assurance.',
  );

  return lines.join('\n');
}
