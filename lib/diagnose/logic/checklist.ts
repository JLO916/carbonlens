// Builds a downloadable "初步因應清單" from a (fully sourced) result. V2: the checklist maps
// to the REAL deliverables the user has to produce — IFRS S1/S2 four pillars, the sustainability
// report's climate chapter, CDP questionnaire fields, numbered Scope 3 categories, and (CBAM)
// the exact CN-code default value — so it can be pasted straight into their report/questionnaire.
// Content stays sourced; next steps are generic/qualitative (no invented numbers).

import type { CbamResult, ListedResult, PressureLevel, SupplyChainResult } from '@/lib/diagnose/types';
import type { Lang } from '@/lib/i18n/context';
import { materialScope3, BUSINESS_MODEL_NOTE } from '@/lib/diagnose/data/scope3-categories';

const pick = (lang: Lang) => (o: { zhTW: string; en: string }) => (lang === 'zhTW' ? o.zhTW : o.en);

/** IFRS S1/S2 (ISSB) four pillars — definitional structure (the disclosure skeleton). */
function ifrsPillars(L: boolean): string[] {
  return L
    ? [
        '治理（Governance）：氣候相關風險與機會的董事會監督，及管理階層的角色與流程。',
        '策略（Strategy）：氣候風險／機會對商業模式、策略與財務的影響；含情境分析（首年可先質性）。',
        '風險管理（Risk Management）：辨識、評估與管理氣候相關風險的流程，並整合進整體風險管理。',
        '指標與目標（Metrics & Targets）：Scope 1／2（必揭）、Scope 3（適用時）、內部碳價、減量目標與進度。',
      ]
    : [
        'Governance: board oversight and management’s role/processes for climate risks & opportunities.',
        'Strategy: effects of climate risks/opportunities on business model, strategy and finances; scenario analysis (qualitative in year one is fine).',
        'Risk Management: processes to identify, assess and manage climate risks, integrated into enterprise risk management.',
        'Metrics & Targets: Scope 1/2 (required), Scope 3 (when applicable), internal carbon price, reduction targets & progress.',
      ];
}

/** CDP questionnaire ↔ IFRS pillar crosswalk (when customers/investors ask via CDP). */
function cdpCrosswalk(L: boolean): string[] {
  return L
    ? [
        'CDP C1 治理 → 對應支柱 1（治理）。',
        'CDP C2／C3 風險、機會與策略 → 對應支柱 2／3。',
        'CDP C4 目標與績效 → 對應支柱 4（指標與目標）。',
        'CDP C6／C7 排放數據 → Scope 1／2／3 盤查結果。',
      ]
    : [
        'CDP C1 Governance → Pillar 1 (Governance).',
        'CDP C2/C3 Risks, opportunities & strategy → Pillars 2/3.',
        'CDP C4 Targets & performance → Pillar 4 (Metrics & Targets).',
        'CDP C6/C7 Emissions data → your Scope 1/2/3 inventory.',
      ];
}

export function buildChecklist(result: ListedResult, lang: Lang): string {
  const s = pick(lang);
  const { gri, ifrs, disclosureScope, urgency, input } = result;
  const L = lang === 'zhTW';

  const steps = L
    ? [
        '確認您的 IFRS S1/S2 適用階段與申報年度（如上）。',
        '盤點 Scope 1（直接）與 Scope 2（外購能源）排放源，建立量化方法。',
        '評估 Scope 3 價值鏈資料缺口——這是接軌的最大難點，宜最早啟動。',
        '規劃內部治理與資料蒐集流程，並預留第三方查證時間。',
      ]
    : [
        'Confirm your IFRS S1/S2 phase and filing year (above).',
        'Inventory Scope 1 (direct) and Scope 2 (purchased energy) sources; set a quantification method.',
        'Assess Scope 3 value-chain data gaps — the hardest part; start earliest.',
        'Plan internal governance and data collection, and reserve time for third-party assurance.',
      ];

  const cats = materialScope3(input.industry);

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
  h(`- ${L ? '來源' : 'Source'}: ${s(gri.citation.source)} · ${s(gri.citation.officialDocVersion)} · ${L ? '資料快照' : 'snapshot'} ${gri.citation.asOfDate}（${L ? '以主管機關最新公告為準' : 'verify latest official notice'}）`);
  h('');
  h(L ? '## IFRS S1/S2（ISSB 接軌）' : '## IFRS S1/S2 (ISSB alignment)');
  h(`- ${L ? '階段' : 'Phase'}: ${ifrs.phase}（${s(ifrs.capitalLabel)}）`);
  h(`- ${L ? '編製會計年度' : 'Prepare for FY'}: ${s(ifrs.compileFY)}`);
  h(`- ${L ? '申報時程' : 'Filing'}: ${s(ifrs.fileLabel)}`);
  h(`- ${L ? '來源' : 'Source'}: ${s(ifrs.citation.source)} · ${s(ifrs.citation.officialDocVersion)} · ${L ? '資料快照' : 'snapshot'} ${ifrs.citation.asOfDate}`);
  h('');
  // ---- Deliverable mapping (critique #8) ----
  h(L ? '## 對齊你的交付物（可直接落地）' : '## Map to your deliverables (ready to use)');
  h(
    L
      ? `### IFRS S1/S2 四大支柱（依你第 ${ifrs.phase} 階段；編製 ${s(ifrs.compileFY)}、${s(ifrs.fileLabel)}）`
      : `### IFRS S1/S2 four pillars (your Phase ${ifrs.phase}; prepare ${s(ifrs.compileFY)}, ${s(ifrs.fileLabel)})`,
  );
  const pillars = ifrsPillars(L);
  if (cats.length) {
    pillars[3] += L
      ? `——你的重點 Scope 3：${cats.map((c) => `類別${c.num}`).join('、')}（先盤這幾類）`
      : ` — your material Scope 3: ${cats.map((c) => `Cat ${c.num}`).join(', ')} (start here)`;
  }
  pillars.forEach((p, i) => h(`${i + 1}. ${p}`));
  h(
    L
      ? '> 首年實作提示：策略（情境分析）首年可先質性、逐年量化；指標先鎖 Scope 1/2（必揭），Scope 3 從上面幾類起；治理／風險管理可沿用既有 ERM 流程銜接。'
      : '> Year-1 tip: Strategy (scenario analysis) can start qualitative and deepen yearly; lock Scope 1/2 first (required), start Scope 3 from the categories above; Governance/Risk Management can build on your existing ERM.',
  );
  h('');
  h(L ? '### 永續報告書（氣候相關專章）' : '### Sustainability report (climate chapter)');
  h(
    L
      ? '- 將上述四支柱寫入永續報告書的氣候相關專章（對應 TCFD／IFRS S2），並與年報、財報數據相互一致。'
      : '- Write the four pillars into your sustainability report’s climate chapter (aligned to TCFD/IFRS S2), consistent with your annual & financial reports.',
  );
  h('');
  h(L ? '### CDP 問卷對應（若客戶／投資人要求）' : '### CDP questionnaire crosswalk (if asked by customers/investors)');
  cdpCrosswalk(L).forEach((c) => h(`- ${c}`));
  h('');
  if (cats.length) {
    h(L ? '### 你的 Scope 3 重點類別（起點，支柱4 指標）' : '### Your material Scope 3 categories (starting point, Pillar 4 metric)');
    for (const c of cats) h(`- ${L ? '類別' : 'Cat'} ${c.num}・${s(c.name)}`);
    h('');
  }
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
        : exposure.defaultMode === 'range' && exposure.exposureMaxEUR !== undefined
          ? L
            ? `未指定 CN 碼 → 該類別官方值範圍：在 ETS €${exposure.etsPrice}／噸時，暴露 €${Math.round(exposure.exposureMinEUR ?? 0).toLocaleString('en-US')} – €${Math.round(exposure.exposureMaxEUR).toLocaleString('en-US')}（${exposure.defaultN} 個 CN 碼）。`
            : `No CN code → category range: at ETS €${exposure.etsPrice}/t, exposure €${Math.round(exposure.exposureMinEUR ?? 0).toLocaleString('en-US')} – €${Math.round(exposure.exposureMaxEUR).toLocaleString('en-US')} (${exposure.defaultN} CN codes).`
          : exposure.indicativeExposureEUR !== undefined
            ? L
              ? `在 ETS €${exposure.etsPrice}／噸時，指示性暴露 ≈ €${Math.round(exposure.indicativeExposureEUR).toLocaleString('en-US')}（排放 ${Math.round(exposure.totalEmissions ?? 0).toLocaleString('en-US')} tCO₂e）。`
              : `At ETS €${exposure.etsPrice}/t, indicative exposure ≈ €${Math.round(exposure.indicativeExposureEUR).toLocaleString('en-US')} (${Math.round(exposure.totalEmissions ?? 0).toLocaleString('en-US')} tCO₂e).`
            : L
              ? '尚未輸入 ETS 價（與實際排放或 CN 碼），無法估算。'
              : 'ETS price (plus actual emissions or CN code) not entered — no estimate.';

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
  if (exposure.cbamFactorPct !== undefined) {
    h(
      L
        ? `（已套 ${input.year} 年 CBAM 因子 ${exposure.cbamFactorPct}%：定義期義務逐年相位導入，2026 約 2.5% → 2034 年 100%${exposure.grossExposureEUR !== undefined ? `；2034 全額約 €${Math.round(exposure.grossExposureEUR).toLocaleString('en-US')}` : ''}。）`
        : `(CBAM factor ${exposure.cbamFactorPct}% applied for ${input.year}: the obligation phases in, ~2.5% in 2026 → 100% by 2034${exposure.grossExposureEUR !== undefined ? `; full by 2034 ≈ €${Math.round(exposure.grossExposureEUR).toLocaleString('en-US')}` : ''}.)`,
    );
  }
  h('');
  // ---- CN-level official default used (critique #1/#8) ----
  if (exposure.defaultMode === 'cn' && exposure.defaultCnCode) {
    h(L ? '## 你採用的官方預設值（CN 碼級）' : '## Official default used (CN-code level)');
    h(`- ${L ? 'CN 碼' : 'CN code'}: ${exposure.defaultCnCode} — ${exposure.defaultDescription ?? ''}`);
    h(
      L
        ? `- 內含排放係數：${exposure.defaultPerTonne} tCO₂e/t（官方內含 ${exposure.defaultBase} ＋ ${exposure.defaultMarkupPct}% 加成，資料快照 ${exposure.defaultAsOf}）`
        : `- Embedded factor: ${exposure.defaultPerTonne} tCO₂e/t (official ${exposure.defaultBase} + ${exposure.defaultMarkupPct}% mark-up, snapshot ${exposure.defaultAsOf})`,
    );
    h(
      L
        ? '- 用於 CBAM 報告：此為「無實際數據時的官方預設值」；提供經查證的實際數據通常更低。'
        : '- For the CBAM report: this is the official default used when actual data is absent; verified actual data is usually lower.',
    );
    h('');
  }
  if (exposure.exporterShareEUR !== undefined || exposure.exporterShareMaxEUR !== undefined) {
    h(L ? '## 落到出口商的份額（你的轉嫁假設）' : '## Share landing on the exporter (your pass-through assumption)');
    h(
      exposure.exporterShareEUR !== undefined
        ? `- ${L ? `@ ${exposure.passThroughPct}% 轉嫁 ≈ €${Math.round(exposure.exporterShareEUR).toLocaleString('en-US')}` : `@ ${exposure.passThroughPct}% pass-through ≈ €${Math.round(exposure.exporterShareEUR).toLocaleString('en-US')}`}`
        : `- ${L ? `@ ${exposure.passThroughPct}% 轉嫁 ≈ €${Math.round(exposure.exporterShareMinEUR ?? 0).toLocaleString('en-US')} – €${Math.round(exposure.exporterShareMaxEUR ?? 0).toLocaleString('en-US')}` : `@ ${exposure.passThroughPct}% pass-through ≈ €${Math.round(exposure.exporterShareMinEUR ?? 0).toLocaleString('en-US')} – €${Math.round(exposure.exporterShareMaxEUR ?? 0).toLocaleString('en-US')}`}`,
    );
    h(L ? '- 這是商業假設、非法定金額：CBAM 繳費義務在進口商，轉嫁比例由雙方合約決定。' : '- This is a commercial assumption, not a statutory amount: the CBAM obligation sits with the importer; pass-through is set by your contract.');
    h('');
  }
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
  h(`${L ? '來源' : 'Sources'}: ${result.citations.map((c) => `${s(c.source)} · ${s(c.officialDocVersion)} · ${L ? '資料快照' : 'snapshot'} ${c.asOfDate}`).join(' ; ')}`);
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
  const { input } = result;
  const lines: string[] = [];
  const h = (x: string) => lines.push(x);

  const cats = materialScope3(input.industry, input.businessModel);

  const steps = L
    ? [
        '對照 RE100／SBTi／CDP 公開會員名單，確認主要品牌客戶是否在列。',
        '盤點自身 Scope 1/2，並識別客戶最可能要的數據（CDP Supply Chain 問卷／排放數據）。',
        '若員工 <1,000 人，了解 VSME 範圍，避免提供超出義務的資訊。',
        '建立可被第三方查證的數據與回應流程。',
        '預約供應鏈碳數據與對標，了解同業如何回應品牌要求。',
      ]
    : [
        'Cross-check the public RE100 / SBTi / CDP member lists to confirm your key brand customers.',
        'Inventory your Scope 1/2 and identify the data customers most likely want (CDP Supply Chain questionnaire / emissions data).',
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
  h(`- ${L ? '來源' : 'Source'}: ${s(result.frameworksCitation.source)} · ${L ? '資料快照' : 'snapshot'} ${result.frameworksCitation.asOfDate}`);
  h('');
  // ---- Scope 3 boundary by business model + material categories (critique #6/#8) ----
  h(L ? '## 你的 Scope 3 邊界（依商業模式）' : '## Your Scope 3 boundary (by business model)');
  h(`- ${s(BUSINESS_MODEL_NOTE[input.businessModel])}`);
  if (cats.length) {
    h(L ? `- 重點類別（起點）：${cats.map((c) => `${L ? '類別' : 'Cat'} ${c.num}・${s(c.name)}`).join('；')}` : `- Material categories (start): ${cats.map((c) => `Cat ${c.num}・${s(c.name)}`).join('; ')}`);
  }
  h(
    L
      ? '- 對齊交付物：客戶多透過 CDP Supply Chain 問卷或自有平台要數據——先備好 Scope 1/2 ＋ 上述重點 Scope 3 類別。'
      : '- Map to deliverables: customers usually ask via the CDP Supply Chain questionnaire or their own platform — have Scope 1/2 + the categories above ready.',
  );
  h('');
  h(L ? '## 為何壓力落在供應商（Scope 3 規模）' : '## Why pressure lands on suppliers (Scope 3 scale)');
  for (const p of result.scope3.points) h(`- ${s(p)}`);
  if (result.scope3.industryNote) h(`- ${s(result.scope3.industryNote)}`);
  h(`- ${L ? '來源' : 'Source'}: ${s(result.scope3.citation.source)} · ${L ? '資料快照' : 'snapshot'} ${result.scope3.citation.asOfDate}`);
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
