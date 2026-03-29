'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n, Lang } from '@/lib/i18n/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#89B56C] text-white text-sm font-bold shrink-0">
      {n}
    </span>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <div className="px-3 py-2 bg-white border rounded-md text-sm text-gray-700">{value}</div>
    </div>
  );
}

function MockResult({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center p-3 bg-white rounded-lg border">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function GuideContent() {
  const { t, lang } = useI18n();
  const imgPrefix = lang === 'en' ? 'en' : 'zh';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      {/* Page title */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('使用說明', 'User Guide')}
        </h1>
        <p className="text-gray-500">
          {t(
            '本指南將帶您逐步了解亞太碳成本試算器的所有功能',
            'This guide walks you through every feature of the APAC Carbon Cost Calculator'
          )}
        </p>
      </div>

      {/* Quick nav */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            <a href="#overview"><Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">{t('總覽', 'Overview')}</Badge></a>
            <a href="#domestic"><Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">{t('國內碳費', 'Domestic Carbon')}</Badge></a>
            <a href="#cbam"><Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">CBAM</Badge></a>
            <a href="#compare"><Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">{t('跨國比較', 'Compare')}</Badge></a>
            <a href="#language"><Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">{t('語言切換', 'Language')}</Badge></a>
            <a href="#confidence"><Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">{t('抵扣確定性', 'Confidence')}</Badge></a>
          </div>
        </CardContent>
      </Card>

      {/* ============ 1. OVERVIEW ============ */}
      <section id="overview" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {t('1. 工具總覽', '1. Overview')}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {t(
            '亞太碳成本試算器涵蓋台灣、新加坡、韓國、日本、泰國、越南六國的國內碳定價機制，以及歐盟碳邊境調整機制（EU CBAM）。您可以：',
            'The APAC Carbon Cost Calculator covers domestic carbon pricing mechanisms across six countries — Taiwan, Singapore, South Korea, Japan, Thailand, and Vietnam — plus the EU Carbon Border Adjustment Mechanism (CBAM). You can:'
          )}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-[#89B56C]/5 border-[#89B56C]/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-2">🏭</p>
              <p className="text-sm font-medium">{t('計算國內碳費/碳稅', 'Calculate domestic carbon cost')}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-2">🇪🇺</p>
              <p className="text-sm font-medium">{t('估算 EU CBAM 成本', 'Estimate EU CBAM cost')}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-4 text-center">
              <p className="text-2xl mb-2">📊</p>
              <p className="text-sm font-medium">{t('跨國碳成本比較', 'Cross-country comparison')}</p>
            </CardContent>
          </Card>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">
            {t(
              '💡 首頁可看到六國卡片，點擊任一國家即可進入該國碳費計算器。',
              '💡 The homepage shows six country cards — click any card to enter that country\'s calculator.'
            )}
          </p>
        </div>
      </section>

      <Separator />

      {/* ============ 2. DOMESTIC CALCULATOR ============ */}
      <section id="domestic" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {t('2. 國內碳費/碳稅計算', '2. Domestic Carbon Cost Calculator')}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {t(
            '以台灣為例，示範完整操作流程：',
            'Using Taiwan as an example, here is the complete workflow:'
          )}
        </p>

        {/* Step 1 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={1} />
              {t('選擇國家', 'Select a Country')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              {t(
                '在首頁點擊國家卡片，或使用頂部導覽列的「碳費試算」進入。每個國家都顯示其碳定價機制類型和現行費率。',
                'Click a country card on the homepage, or use the "Calculator" link in the header. Each card shows the carbon pricing mechanism type and current rate.'
              )}
            </p>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              <span className="text-2xl">🇹🇼</span>
              <div>
                <p className="font-medium text-sm">{t('台灣', 'Taiwan')}</p>
                <p className="text-xs text-gray-500">{t('碳費', 'Carbon Fee')}</p>
              </div>
              <Badge className="ml-auto bg-green-100 text-green-700" variant="secondary">{t('已實施', 'Active')}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={2} />
              {t('填寫基本資訊（Step 1）', 'Fill in Basic Information (Step 1)')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t(
                '輸入您企業的年排放量（Scope 1+2，單位 tCO₂e）並選擇產業別。',
                'Enter your facility\'s annual emissions (Scope 1+2, in tCO₂e) and select the industry type.'
              )}
            </p>
            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
              <MockField label={t('年排放量 (tCO₂e)', 'Annual Emissions (tCO₂e)')} value="100,000" />
              <MockField label={t('產業別', 'Industry Type')} value={t('鋼鐵', 'Steel')} />
            </div>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={3} />
              {t('設定國別特定參數（Step 2）', 'Set Country-specific Parameters (Step 2)')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t(
                '每個國家有不同的計算參數。以台灣為例：',
                'Each country has different parameters. For Taiwan:'
              )}
            </p>
            <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
              <MockField label={t('費率類型', 'Rate Type')} value={t('一般費率 (NT$300/tCO₂e)', 'General Rate (NT$300/tCO₂e)')} />
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">{t('高碳洩漏風險產業', 'High Carbon Leakage Risk')}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 border rounded text-xs bg-white">{t('是', 'Yes')}</span>
                  <span className="px-3 py-1 border rounded text-xs bg-gray-800 text-white">{t('否', 'No')}</span>
                </div>
              </div>
              <MockField label={t('計算期別', 'Calculation Period')} value={t('第一期 2025-2026（CL=0.2）', 'Period 1: 2025-2026 (CL=0.2)')} />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              {t(
                '💡 各國參數不同：新加坡可輸入碳權抵扣、韓國需填免費配額、日本可選擇是否為 GX-ETS 受管制企業。',
                '💡 Parameters vary by country: Singapore has carbon credit offsets, Korea requires free allowance input, Japan has GX-ETS regulated entity toggle.'
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={4} />
              {t('點擊「計算碳費」', 'Click "Calculate Carbon Cost"')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t(
                '按下綠色按鈕後，系統會即時計算碳費並顯示完整結果。',
                'Press the green button to instantly calculate and display the full results.'
              )}
            </p>
            <div className="flex justify-center">
              <div className="bg-[#89B56C] text-white px-8 py-3 rounded-lg text-sm font-medium">
                {t('計算碳費', 'Calculate Carbon Cost')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 5 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={5} />
              {t('查看計算結果（Step 3）', 'View Results (Step 3)')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t(
                '結果面板包含：碳費總額（當地幣值 + USD）、收費排放量、有效費率、計算步驟拆解，以及可用於 CBAM 抵扣的金額。',
                'The result panel shows: total carbon cost (local currency + USD), chargeable emissions, effective rate, calculation breakdown, and the amount deductible for CBAM.'
              )}
            </p>
            <div className="p-4 bg-[#89B56C]/5 rounded-lg border border-[#89B56C]/20 space-y-3">
              <div className="text-center">
                <p className="text-xs text-gray-400">{t('碳費總額', 'Total Carbon Cost')}</p>
                <p className="text-3xl font-bold text-gray-900">NT$22,500,000</p>
                <p className="text-sm text-gray-400">≈ USD 692,308</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MockResult label={t('收費排放量', 'Chargeable Emissions')} value="75,000 tCO₂e" />
                <MockResult label={t('有效費率', 'Effective Rate')} value="NT$225/tCO₂e" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-gray-500">{t('年排放量', 'Annual Emissions')}</span>
                  <span className="font-mono">100,000 tCO₂e</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-gray-500">{t('K 值（免徵額）', 'K-value (Exemption)')}</span>
                  <span className="font-mono">25,000 tCO₂e</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span className="text-gray-500">{t('適用費率', 'Applicable Rate')}</span>
                  <span className="font-mono">300 TWD/tCO₂e</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 6 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={6} />
              {t('查看情境預測圖表', 'View Scenario Projection Chart')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              {t(
                '結果下方會自動顯示 2025-2034 碳成本預測折線圖，包含三條線：國內碳價（綠）、CBAM 成本（藍）、合計（紅色虛線）。',
                'Below the results, a 2025-2034 projection chart is shown with three lines: domestic carbon cost (green), CBAM cost (blue), and total (red dashed).'
              )}
            </p>
            <div className="p-4 bg-white rounded-lg border text-center">
              <div className="flex items-center justify-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-[#89B56C] inline-block"></span> {t('國內碳價', 'Domestic')}</span>
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-500 inline-block"></span> CBAM</span>
                <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-500 inline-block border-dashed"></span> {t('合計', 'Total')}</span>
              </div>
              <p className="text-gray-400 mt-2 text-xs">{t('圖表呈上升趨勢 — CBAM 免費配額逐年減少', 'Chart trends upward — CBAM free allocation decreases yearly')}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ============ 3. CBAM CALCULATOR ============ */}
      <section id="cbam" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {t('3. EU CBAM 試算', '3. EU CBAM Calculator')}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {t(
            '從導覽列點擊「CBAM」進入。適用於向歐盟出口鋼鐵、鋁、水泥、化肥、氫、電力的企業。',
            'Click "CBAM" in the navigation bar. This is for companies exporting steel, aluminum, cement, fertilizer, hydrogen, or electricity to the EU.'
          )}
        </p>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('操作步驟', 'Steps')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <StepBadge n={1} />
                <div>
                  <p className="text-sm font-medium">{t('選擇產品類別', 'Select product type')}</p>
                  <p className="text-xs text-gray-500">{t('如：鋼鐵（高爐-轉爐）、鋁（原生）、水泥（熟料）等', 'e.g., Steel (BF-BOF), Aluminum (Primary), Cement (Clinker)')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <StepBadge n={2} />
                <div>
                  <p className="text-sm font-medium">{t('輸入進口量（噸）', 'Enter import volume (tonnes)')}</p>
                  <p className="text-xs text-gray-500">{t('年度出口至歐盟的產品總噸數', 'Total tonnes exported to EU per year')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <StepBadge n={3} />
                <div>
                  <p className="text-sm font-medium">{t('選擇排放數據來源', 'Choose emissions data source')}</p>
                  <p className="text-xs text-gray-500">{t('「使用預設值」會自動套用 EU 預設排放因子（含加成）；「實際數據」可輸入您的實際排放強度', '"Default Values" applies EU default emission factors (with surcharge); "Actual Data" lets you enter your actual emission intensity')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <StepBadge n={4} />
                <div>
                  <p className="text-sm font-medium">{t('設定計算年度與 EU ETS 價格', 'Set year and EU ETS price')}</p>
                  <p className="text-xs text-gray-500">{t('年度影響免費配額比例（2026: 97.5% → 2034: 0%）', 'The year affects free allocation (2026: 97.5% → 2034: 0%)')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <StepBadge n={5} />
                <div>
                  <p className="text-sm font-medium">{t('輸入原產國已繳碳價（€）', 'Enter domestic carbon price paid (€)')}</p>
                  <p className="text-xs text-gray-500">{t('將國內碳費按出口佔比折算為歐元。若無國內碳價（如越南），填 0', 'Convert domestic carbon cost by EU export share to EUR. Enter 0 if no domestic carbon price (e.g., Vietnam)')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4 space-y-2">
            <p className="text-sm font-medium text-blue-900">{t('範例', 'Example')}</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>{t('• 產品：鋼鐵（高爐-轉爐），進口 5,000 噸', '• Product: Steel (BF-BOF), 5,000 tonnes')}</p>
              <p>{t('• 排放因子：2.1 tCO₂e/噸（實際數據）', '• Emission intensity: 2.1 tCO₂e/t (actual data)')}</p>
              <p>{t('• 年度：2026，EU ETS €80/tCO₂e', '• Year: 2026, EU ETS €80/tCO₂e')}</p>
              <p>{t('• 原產國碳價：€0（越南，無正式碳價）', '• Domestic carbon price: €0 (Vietnam, no formal price)')}</p>
              <p className="font-bold mt-2">{t('→ CBAM 淨成本：約 €338,460', '→ Net CBAM cost: approx. €338,460')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          {t(
            '⚠️ 進口量 ≤ 50 噸（氫和電力除外）可豁免 CBAM。工具會自動判斷並顯示「豁免」。',
            '⚠️ Imports ≤ 50 tonnes (except hydrogen and electricity) are exempt from CBAM. The tool automatically detects and shows "Exempt".'
          )}
        </div>
      </section>

      <Separator />

      {/* ============ 4. CROSS-COUNTRY COMPARISON ============ */}
      <section id="compare" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {t('4. 跨國碳成本比較', '4. Cross-Country Comparison')}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {t(
            '從導覽列點擊「跨國比較」，輸入相同的排放量假設，一次比較六國的國內碳成本 + CBAM 淨成本。',
            'Click "Compare" in the navigation bar. Enter the same emissions assumptions to compare domestic carbon costs + CBAM net costs across all six countries at once.'
          )}
        </p>

        {/* Step 1: Input */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={1} />
              {t('輸入排放量與出口量', 'Enter Emissions & Export Volume')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t(
                '輸入年排放量（tCO₂e）和出口歐盟的鋼鐵噸數，系統會以相同假設計算六國碳成本。',
                'Enter annual emissions (tCO₂e) and steel export tonnes to the EU. The system calculates costs for all six countries under identical assumptions.'
              )}
            </p>
            <div className="rounded-lg border overflow-hidden">
              <Image src={`/guide/${imgPrefix}-compare-input.png`} alt={t('跨國比較輸入表單', 'Compare input form')} width={1280} height={900} className="w-full h-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Click Compare */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={2} />
              {t('點擊「開始比較」查看圖表', 'Click "Compare" to View Chart')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t(
                '堆疊長條圖顯示六國的國內碳價（綠色）與 CBAM 淨成本（藍色），一目了然各國總碳成本差異。',
                'The stacked bar chart shows domestic carbon cost (green) and CBAM net cost (blue) for all six countries, making it easy to compare total carbon costs.'
              )}
            </p>
            <div className="rounded-lg border overflow-hidden">
              <Image src={`/guide/${imgPrefix}-compare-chart.png`} alt={t('跨國比較圖表', 'Compare chart')} width={1280} height={900} className="w-full h-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <StepBadge n={3} />
              {t('查看詳細比較表格', 'View Detailed Comparison Table')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              {t(
                '表格列出每個國家的國內碳價（USD）、CBAM 淨成本（EUR）和合計（USD），並按合計金額排序。越南因無碳價抵扣，CBAM 成本最高。',
                'The table lists each country\'s domestic carbon cost (USD), CBAM net cost (EUR), and total (USD), sorted by total. Vietnam faces the highest CBAM cost due to zero domestic deduction.'
              )}
            </p>
            <div className="rounded-lg border overflow-hidden">
              <Image src={`/guide/${imgPrefix}-compare-table.png`} alt={t('跨國比較表格', 'Compare table')} width={1280} height={900} className="w-full h-auto" />
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {t(
            '🔴 越南因無正式碳價，出口商將面臨最高的 CBAM 淨成本（無法抵扣任何國內碳價）。比較頁面會突出顯示此風險。',
            '🔴 Vietnam has no formal carbon price, so exporters face the highest net CBAM cost (zero domestic deduction). The comparison page highlights this risk.'
          )}
        </div>
      </section>

      <Separator />

      {/* ============ 5. LANGUAGE TOGGLE ============ */}
      <section id="language" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {t('5. 中英文切換', '5. Language Toggle')}
        </h2>
        <Card>
          <CardContent className="py-4 space-y-2">
            <p className="text-sm text-gray-600">
              {t(
                '點擊右上角的「EN」或「中文」按鈕，即可即時切換全站語言。所有標籤、選項、結果說明均支援雙語。',
                'Click the "EN" or "中文" button in the top-right corner to instantly switch the entire site language. All labels, options, and result descriptions support both languages.'
              )}
            </p>
            <div className="flex items-center gap-3 justify-center">
              <div className="px-3 py-1 border rounded text-xs font-medium text-gray-700 bg-white">EN</div>
              <span className="text-gray-400">⇄</span>
              <div className="px-3 py-1 border rounded text-xs font-medium text-gray-700 bg-white">中文</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ============ 6. CBAM DEDUCTION CONFIDENCE ============ */}
      <section id="confidence" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {t('6. CBAM 抵扣確定性等級', '6. CBAM Deduction Confidence Levels')}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {t(
            '各國碳價能否被歐盟認定為有效抵扣 CBAM 費用，確定性不同。工具在每個國家的計算結果下方和首頁底部顯示確定性等級：',
            'Whether each country\'s carbon price qualifies as a valid CBAM deduction varies in certainty. The tool displays confidence levels below each country\'s results and at the bottom of the homepage:'
          )}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-lg">🟢</span>
            <div>
              <p className="text-sm font-medium">{t('高確定性 — 新加坡、韓國', 'High Confidence — Singapore, South Korea')}</p>
              <p className="text-xs text-gray-500">{t('明確碳稅/ETS 配額購買成本，直接符合 CBAM 定義', 'Clear carbon tax / ETS allowance costs, directly meet CBAM definition')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-lg">🟡</span>
            <div>
              <p className="text-sm font-medium">{t('中等確定性 — 台灣、日本', 'Medium Confidence — Taiwan, Japan')}</p>
              <p className="text-xs text-gray-500">{t('台灣 Scope 2 折算待協商；日本碳稅定義模糊', 'Taiwan Scope 2 conversion pending; Japan carbon tax definition unclear')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <span className="text-lg">🔴</span>
            <div>
              <p className="text-sm font-medium">{t('低確定性 — 泰國', 'Low Confidence — Thailand')}</p>
              <p className="text-xs text-gray-500">{t('碳稅嵌入消費稅且不影響價格，歐盟認定存疑', 'Carbon tax embedded in excise with no price impact')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
            <span className="text-lg">⚫</span>
            <div>
              <p className="text-sm font-medium">{t('無法抵扣 — 越南', 'No Deduction — Vietnam')}</p>
              <p className="text-xs text-gray-500">{t('無正式碳價，進口商須全額負擔 CBAM 成本', 'No formal carbon price — EU importer bears full CBAM cost')}</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <p className="text-lg font-medium text-gray-700">
          {t('準備好了嗎？', 'Ready to start?')}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/tw">
            <Button className="bg-[#89B56C] hover:bg-[#6E9156] text-white px-6">
              {t('開始試算', 'Get Started')}
            </Button>
          </Link>
          <Link href="/cbam">
            <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 px-6">
              {t('CBAM 試算', 'CBAM Calculator')}
            </Button>
          </Link>
          <Link href="/compare">
            <Button variant="outline" className="border-[#89B56C] text-[#89B56C] hover:bg-[#89B56C]/10 px-6">
              {t('跨國比較', 'Compare Countries')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
