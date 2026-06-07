// P2a — deliverables a practitioner actually hands over: a GHG inventory worksheet (CSV, opens in
// Excel) and IFRS S2 four-pillar climate-disclosure paragraphs (a DRAFT pre-filled with the user's
// computed numbers). DATA RED LINE: every number comes from the user's inventory/inputs or the real
// engines; qualitative content is left as clearly-marked placeholders — we do NOT fabricate.

import { computeInventory, facilityEmissionsTonnes, DATA_QUALITY_LABEL } from './inventory';
import { countsIndirect } from './reduction';
import type { CompanyProfile } from './profile';
import type { WorkbenchResult } from './aggregate';

export type Lang = 'zhTW' | 'en';
const L = (lang: Lang, zh: string, en: string) => (lang === 'en' ? en : zh);
const n3 = (n: number) => String(Number(n.toFixed(3)));
const ntd = (n: number) => 'NT$' + Math.round(n).toLocaleString('en-US');
const eur = (n: number) => '€' + Math.round(n).toLocaleString('en-US');

/** CSV cell escaping (quote when the value contains a comma, quote or newline). */
const csvCell = (v: string | number): string => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** GHG inventory worksheet (盤查清冊) as CSV — per facility, per activity line, with full lineage +
 *  data-quality + evidence, then Scope 1/2/total. Opens in Excel; the working paper for assurance. */
export function inventorySheetCsv(profile: CompanyProfile, lang: Lang = 'zhTW'): string {
  const header = [
    L(lang, '廠區', 'Facility'), L(lang, '排放源', 'Source'), 'Scope',
    L(lang, '活動量', 'Amount'), L(lang, '單位', 'Unit'),
    L(lang, '係數(kgCO₂e/單位)', 'Factor (kgCO₂e/unit)'), L(lang, '係數來源', 'Factor source'),
    L(lang, '已覆寫', 'Overridden'), L(lang, '數據品質', 'Data quality'),
    L(lang, '佐證來源', 'Evidence'), L(lang, '不確定性±%', 'Uncertainty ±%'),
    L(lang, '排放量(tCO₂e)', 'Emissions (tCO₂e)'),
  ];
  const rows: (string | number)[][] = [header];
  let g1 = 0, g2 = 0, gt = 0;

  for (const f of profile.facilities) {
    if (f.useInventory && f.activities && f.activities.length > 0) {
      const inv = computeInventory(f.activities, f.countryCode);
      inv.lines.forEach((ln) => {
        const fac = ln.factor;
        rows.push([
          f.label,
          fac ? L(lang, fac.label.zhTW, fac.label.en) : ln.line.factorKey,
          ln.scope,
          ln.line.amount,
          fac ? L(lang, fac.unit.zhTW, fac.unit.en) : '',
          ln.effectiveFactor,
          fac ? L(lang, fac.source.zhTW, fac.source.en) : '',
          ln.isOverride ? L(lang, '是', 'Y') : '',
          ln.line.dataQuality ? L(lang, DATA_QUALITY_LABEL[ln.line.dataQuality].zhTW, DATA_QUALITY_LABEL[ln.line.dataQuality].en) : '',
          ln.line.evidenceNote ?? '',
          ln.line.uncertaintyPct ?? '',
          n3(ln.tonnes),
        ]);
      });
      g1 += inv.scope1Tonnes; g2 += inv.scope2Tonnes; gt += inv.totalTonnes;
    } else {
      const tonnes = facilityEmissionsTonnes(f);
      rows.push([f.label, L(lang, '(直接填總數)', '(typed total)'), '1+2', '', '', '', '', '', '', '', '', n3(tonnes)]);
      gt += tonnes;
    }
  }

  rows.push([]);
  rows.push([L(lang, '合計 Scope 1 (tCO₂e)', 'Total Scope 1 (tCO₂e)'), '', '', '', '', '', '', '', '', '', n3(g1)]);
  rows.push([L(lang, '合計 Scope 2 (tCO₂e)', 'Total Scope 2 (tCO₂e)'), '', '', '', '', '', '', '', '', '', n3(g2)]);
  rows.push([L(lang, '總計 (tCO₂e)', 'Grand total (tCO₂e)'), '', '', '', '', '', '', '', '', '', n3(gt)]);
  rows.push([L(lang, '註:Scope 1/2 僅含盤查廠區;直接填總數之廠區未分 Scope。係數/GWP 來源見工作台。', 'Note: Scope 1/2 cover inventory facilities only; typed-total facilities are not scope-split.')]);

  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

/** CBAM "communication template for installations" (Reg (EU) 2023/956) — the data the EU importer
 *  asks the non-EU operator for, pre-filled from the profile. RED LINE: actual SEE only when the
 *  user entered it; official-default lines are flagged as pending (NOT fabricated). Steel/aluminium/
 *  hydrogen embedded emissions are direct-only (Annex II). */
export function cbamCommunicationCsv(profile: CompanyProfile, lang: Lang = 'zhTW'): string {
  const header = [
    L(lang, '設施(公司)', 'Installation (company)'), L(lang, '原產國', 'Country of origin'),
    L(lang, '品名', 'Goods'), 'CN', L(lang, '年出口量(t)', 'Annual qty (t)'),
    L(lang, '生產路徑', 'Production route'),
    L(lang, '單位內含排放 SEE(tCO₂e/t)', 'Specific embedded emissions (tCO₂e/t)'),
    L(lang, '排放範圍', 'Scope of embedded emissions'),
    L(lang, '數據來源', 'Data basis'),
    L(lang, '原產國碳價', 'Carbon price paid in origin'),
  ];
  const rows: (string | number)[][] = [header];
  for (const c of profile.cbamProducts) {
    const indirect = countsIndirect(c.product);
    const see = c.emissionsSource === 'actual' && c.actualSpecificEmissions != null
      ? c.actualSpecificEmissions
      : L(lang, '〔官方預設值待解鎖／請提供實際數據〕', '〔official default pending / provide actual〕');
    rows.push([
      profile.company || L(lang, '〔填公司名〕', '〔company name〕'),
      c.originCountry.toUpperCase(),
      c.label,
      c.cnCode || L(lang, '〔填 CN 碼〕', '〔CN code〕'),
      c.annualVolumeTonnes,
      L(lang, '〔填:高爐BF-BOF／電爐EAF…〕', '〔route: BF-BOF/EAF…〕'),
      see,
      indirect ? L(lang, '直接＋間接(水泥/肥料)', 'direct + indirect (cement/fertilizer)') : L(lang, '僅直接(鋼/鋁/氫)', 'direct only (steel/al/H₂)'),
      c.emissionsSource === 'actual' ? L(lang, '實際', 'actual') : L(lang, '官方預設值', 'official default'),
      L(lang, '〔見國內碳費;依設施分攤後填〕', '〔from domestic carbon fee; allocate per installation〕'),
    ]);
  }
  rows.push([]);
  rows.push([L(lang, '依 Regulation (EU) 2023/956「設施溝通範本」欄位整理;〔…〕請補。鋼/鋁/氫之內含排放僅計直接排放(附件二)。', 'Per Reg (EU) 2023/956 communication template; complete 〔…〕. Steel/aluminium/hydrogen embedded emissions are direct-only (Annex II).')]);
  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

/** IFRS S2 four-pillar climate-disclosure DRAFT, pre-filled with the user's computed numbers.
 *  Qualitative content is left as 〔…〕 placeholders to complete — this is a starting draft, not an
 *  assured statement. */
export function disclosureReportText(profile: CompanyProfile, result: WorkbenchResult, lang: Lang = 'zhTW'): string {
  let s1 = 0, s2 = 0, s2m = 0, elecTotal = 0, elecRenew = 0;
  for (const f of profile.facilities) {
    if (f.useInventory && f.activities && f.activities.length > 0) {
      const inv = computeInventory(f.activities, f.countryCode, f.renewablePct);
      s1 += inv.scope1Tonnes; s2 += inv.scope2Tonnes; s2m += inv.scope2MarketTonnes;
      const facS2 = inv.scope2Tonnes;
      elecTotal += facS2; elecRenew += facS2 * (Math.max(0, Math.min(100, f.renewablePct ?? 0)) / 100);
    }
  }
  const re100Pct = elecTotal > 0 ? Math.round((elecRenew / elecTotal) * 100) : 0;
  const total = profile.facilities.reduce((a, f) => a + facilityEmissionsTonnes(f), 0);
  const fee = result.domestic.totalFeeTWD;
  const cbam = result.cbam.totalObligationEUR;
  const locked = result.cbam.lockedLines;
  const co = profile.company || L(lang, '本公司', 'The Company');
  const yr = profile.year;

  if (lang === 'en') {
    return [
      `Climate-related disclosure draft (IFRS S1/S2) — ${co}, FY${yr}${profile.baseYear ? ` · base year ${profile.baseYear}` : ''}`,
      '',
      '1. Governance',
      `   〔Describe the board's oversight of climate-related risks/opportunities, and management's role, cadence and reporting line.〕`,
      '',
      '2. Strategy',
      `   In FY${yr}, ${co}'s GHG emissions are approximately ${total.toLocaleString('en-US')} tCO₂e (Scope 1 ${s1.toLocaleString('en-US')}, Scope 2 ${s2.toLocaleString('en-US')} from the inventory).`,
      `   Estimated domestic carbon fee: ${ntd(fee)}/yr.${cbam !== undefined ? ` Estimated EU CBAM obligation: ${eur(cbam)} (FY${yr}).` : ''}${locked > 0 ? ` (${locked} CBAM line(s) pending official-default unlock — provide actual embedded-emissions data.)` : ''}`,
      `   〔Describe transition risks (carbon pricing, CBAM, customer decarbonisation asks), physical risks, and the resilience of the strategy.〕`,
      '',
      '3. Risk management',
      `   〔Describe how climate risks are identified, assessed and integrated into the enterprise risk process.〕`,
      '',
      '4. Metrics & targets',
      `   Scope 1: ${s1.toLocaleString('en-US')} tCO₂e; Scope 2 (location-based): ${s2.toLocaleString('en-US')} tCO₂e; total ${total.toLocaleString('en-US')} tCO₂e.`,
      re100Pct > 0 ? `   Scope 2 (market-based): ${s2m.toLocaleString('en-US')} tCO₂e; renewable electricity (RE100): ${re100Pct}%.` : '   〔Report market-based Scope 2 and RE100% once renewable procurement is set.〕',
      `${profile.baseYear ? `   Base year: ${profile.baseYear}.` : '   〔Set a base year for targets.〕'}${profile.targetReductionPct ? ` Reduction target: ${profile.targetReductionPct}%.` : ' 〔Set a reduction target.〕'}`,
      profile.customerFrameworks.length ? `   Customer frameworks in scope: ${profile.customerFrameworks.join(', ')}.` : '',
      '',
      'NOTE: Draft auto-generated from your inputs. Figures rely on your inventory/inputs; qualitative content (〔…〕) must be completed; not assured.',
    ].filter((x) => x !== '').join('\n');
  }

  return [
    `氣候相關揭露草稿(IFRS S1/S2)——${co},${yr} 年度${profile.baseYear ? ` · 基準年 ${profile.baseYear}` : ''}`,
    '',
    '一、治理',
    `   〔請補述:董事會對氣候相關風險與機會之監督機制,以及管理階層之角色、頻率與向董事會報告之方式。〕`,
    '',
    '二、策略',
    `   ${yr} 年度,${co}溫室氣體排放約 ${total.toLocaleString('en-US')} tCO₂e(盤查 Scope 1 約 ${s1.toLocaleString('en-US')}、Scope 2 約 ${s2.toLocaleString('en-US')})。`,
    `   國內碳費估算約 ${ntd(fee)}／年。${cbam !== undefined ? `歐盟 CBAM 義務估算約 ${eur(cbam)}(${yr} 年義務)。` : ''}${locked > 0 ? `(尚有 ${locked} 筆 CBAM 品項待官方預設值解鎖,建議提供實際內含排放數據。)` : ''}`,
    `   〔請補述:轉型風險(碳定價、CBAM、客戶減碳要求)、實體風險,以及策略之韌性。〕`,
    '',
    '三、風險與機會管理',
    `   〔請補述:氣候相關風險之鑑別、評估流程,以及如何整合進公司整體風險管理。〕`,
    '',
    '四、指標與目標',
    `   Scope 1:${s1.toLocaleString('en-US')} tCO₂e;Scope 2(地點基礎):${s2.toLocaleString('en-US')} tCO₂e;合計 ${total.toLocaleString('en-US')} tCO₂e。`,
    re100Pct > 0 ? `   Scope 2(市場基礎):${s2m.toLocaleString('en-US')} tCO₂e;綠電佔比(RE100):${re100Pct}%。` : '   〔設定綠電採購後,補市場基礎 Scope 2 與 RE100%。〕',
    `${profile.baseYear ? `   基準年:${profile.baseYear}。` : '   〔請設定減量目標之基準年。〕'}${profile.targetReductionPct ? ` 減量目標:${profile.targetReductionPct}%。` : ' 〔請設定減量目標。〕'}`,
    profile.customerFrameworks.length ? `   涉及之客戶框架:${profile.customerFrameworks.join('、')}。` : '',
    '',
    '註:本段為依你輸入自動生成之草稿。數字以你的盤查/輸入為準;定性內容(〔…〕)請補述完整;非經第三方查證。',
  ].filter((x) => x !== '').join('\n');
}
