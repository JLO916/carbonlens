'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import CountrySelector from '@/components/calculator/CountrySelector';
import { COUNTRIES } from '@/lib/data/countries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AllCountriesDeductionTable } from '@/components/calculator/CrossDeductionPanel';

const AVAILABLE_COUNTRIES = ['tw', 'sg', 'kr', 'jp', 'th', 'vn'] as const;

export default function LandingContent() {
  const { t } = useI18n();

  const CBAM_TIMELINE = [
    { year: '2023-25', label: t('過渡期', 'Transition'), active: false },
    { year: '2026', label: t('正式實施', 'Enforcement'), active: true },
    { year: '2027-33', label: t('配額遞減', 'Phase-out'), active: false },
    { year: '2034', label: t('全額徵收', 'Full CBAM'), active: false },
  ];

  return (
    <main className="flex-1">
      {/* Hero — COPY.md Section 2 */}
      <section className="bg-gradient-to-br from-[#89B56C]/10 via-white to-[#89B56C]/5 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t(
              '亞太六國碳費與歐盟 CBAM 雙軌試算器 — 30 秒算出合規成本',
              'Carbon pricing & EU CBAM calculator for Asia-Pacific exporters — get your numbers in 30 seconds'
            )}
          </h1>
          <p className="text-lg text-[#6E9156] font-medium mb-4">
            {t(
              '你的產品出口歐盟，碳成本到底是多少？',
              'How much will carbon cost your exports to Europe?'
            )}
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t(
              '2026 年起，歐盟碳邊境調整機制（CBAM）正式對進口鋼鐵、鋁、水泥等產品課徵碳關稅，同時台灣碳費、新加坡碳稅、韓國 K-ETS 等亞太碳定價制度也陸續上路。企業同時面對國內碳價與國際碳關稅的雙重成本壓力，卻缺乏工具一次算清楚。CarbonLens 是第一個專為亞太出口企業設計的碳成本計算器，幫你在一個頁面完成國內碳價試算、CBAM 成本估算，以及兩者之間的交叉抵扣分析。',
              'Starting 2026, the EU Carbon Border Adjustment Mechanism (CBAM) charges real money on imported steel, aluminum, cement, and more. At the same time, carbon pricing is ramping up across Asia — Taiwan\'s carbon fee, Singapore\'s carbon tax, Korea\'s K-ETS, and Japan\'s GX-ETS are all in effect. Exporters face a double cost squeeze, yet no tool calculates both sides together. CarbonLens is the first calculator built for Asia-Pacific exporters: estimate your domestic carbon costs, EU CBAM exposure, and cross-border deductions — all in one place, for free.'
            )}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/tw">
              <Button className="bg-[#89B56C] hover:bg-[#6E9156] text-white px-8 h-12 text-lg">
                {t('開始試算', 'Get Started')}
              </Button>
            </Link>
            <Link href="/cbam">
              <Button variant="outline" className="px-8 h-12 text-lg border-[#89B56C] text-[#89B56C] hover:bg-[#89B56C]/10">
                {t('CBAM 試算', 'CBAM Calculator')}
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="outline" className="px-8 h-12 text-lg border-gray-300 text-gray-600 hover:bg-gray-100">
                {t('使用說明', 'User Guide')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Country cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            {t('選擇國家', 'Select Country')}
          </h2>
          <p className="text-center text-gray-500 mb-10">
            {t('點擊任一國家進入碳費/碳稅試算', 'Click a country to start carbon cost calculation')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(COUNTRIES) as Array<keyof typeof COUNTRIES>).map((code) => (
              <CountrySelector
                key={code}
                country={COUNTRIES[code]}
                available={AVAILABLE_COUNTRIES.includes(code as any)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 三件事，一次算清楚 — COPY.md Section 3 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">
            {t('三件事，一次算清楚', 'Three questions, one calculator')}
          </h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('算你的國內碳成本', 'What\'s your domestic carbon cost?')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(
                    '選擇你的所在國 — 台灣、新加坡、韓國、日本、泰國或越南 — 輸入排放量和產業別，系統自動套用該國最新碳費率、免徵門檻、優惠機制，算出你今年要繳多少碳費或碳稅。台灣企業還能比較一般費率和兩種優惠費率方案，找到最省的申報策略。',
                    'Select your country — Taiwan, Singapore, South Korea, Japan, Thailand, or Vietnam — enter your emissions and industry, and the tool applies your country\'s latest carbon rates, thresholds, and preferential schemes. Taiwan users can compare all three fee rate options to find the most cost-effective filing strategy.'
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('算你的 CBAM 碳關稅', 'What\'s your CBAM exposure?')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(
                    '如果你的產品出口歐盟，輸入出口量和產品類型，系統根據 EU ETS 碳價、CBAM 因子和產品排放強度，估算你的歐盟碳邊境調整成本。支援實際排放數據和預設值兩種模式，直接看到「有數據 vs 沒數據」的成本差異。',
                    'If you export to the EU, enter your shipment volume and product type. The tool estimates your Carbon Border Adjustment costs based on the EU ETS price, CBAM phase-in factors, and product emission intensity. Toggle between actual emissions data and default values to see how much accurate data can save you.'
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('算你能省多少', 'How much can you deduct?')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(
                    '這是其他工具做不到的：你在國內繳的碳價，有多少可以折抵歐盟 CBAM？系統自動計算交叉抵扣金額，並標示抵扣的確定性等級 — 從新加坡的高確定性到越南的零抵扣，一目了然。',
                    'This is what no other tool does: how much of your domestic carbon price can offset your EU CBAM obligation? The calculator maps cross-border deductions automatically and flags the confidence level — from Singapore\'s high-certainty deduction to Vietnam\'s zero offset — so you know exactly where you stand.'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 用數字看碳成本的真實面貌 — COPY.md Section 3.5 */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">
            {t('用數字看碳成本的真實面貌', 'See the real shape of carbon costs')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <Link href="/tw" className="block">
              <Card className="h-full hover:shadow-lg hover:border-[#89B56C] transition-all cursor-pointer">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {t(
                      '選優惠費率到底能省多少？不只是國內碳費的差別',
                      'How much does choosing the preferential rate actually save? It\'s not just about domestic fees.'
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(
                      '台灣鋼鐵廠，年排放 10 萬噸，出口歐盟 5,000 噸。選一般費率繳 NT$600 萬碳費，但能折抵較多 CBAM；選優惠 A 只繳 NT$100 萬，但 CBAM 折抵也少了。算上兩邊的總成本——優惠 A 方案仍然省下約 NT$240 萬，比一般費率低 17%。',
                      'A Taiwan steel plant, 100K tonnes annual emissions, exporting 5,000 tonnes to the EU. The standard rate means NT$6M in domestic fees with a larger CBAM deduction. Preferential A means only NT$1M — but less CBAM offset too. Total cost under Preferential A is still ~NT$2.4M lower, a 17% saving.'
                    )}
                  </p>
                  <span className="text-xs font-medium text-[#89B56C]">{t('→ 點擊試算', '→ Try it')}</span>
                </CardContent>
              </Card>
            </Link>

            {/* Card 2 */}
            <Link href="/compare" className="block">
              <Card className="h-full hover:shadow-lg hover:border-[#89B56C] transition-all cursor-pointer">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {t(
                      '同一批鋼鐵，從台灣、韓國、越南出口——碳成本差在哪？',
                      'Same steel, shipped from Taiwan, Korea, or Vietnam — where does carbon cost differ?'
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(
                      '5,000 噸高爐鋼鐵出口歐盟，越南淨 CBAM 成本約 €338,000，台灣約 €321,000，差距約 €18,000。金額差距看似不大，但背後是結構性差異：越南沒有正式碳價，每一分 CBAM 都得自己扛。隨著 CBAM 免費配額在 2034 年歸零，這個差距只會擴大。',
                      '5,000 tonnes of BF-BOF steel exported to the EU. Vietnam\'s net CBAM cost: ~€338,000. Taiwan\'s: ~€321,000. The gap is about €18,000 — modest today, but it reflects a structural difference: Vietnam has no formal carbon price, meaning zero CBAM deduction. As free allowances phase out by 2034, this gap will only widen.'
                    )}
                  </p>
                  <span className="text-xs font-medium text-[#89B56C]">{t('→ 點擊比較', '→ Compare')}</span>
                </CardContent>
              </Card>
            </Link>

            {/* Card 3 */}
            <Link href="/vn" className="block">
              <Card className="h-full hover:shadow-lg hover:border-red-300 transition-all cursor-pointer border-red-100">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {t(
                      '越南沒有碳價——出口歐盟的隱形代價',
                      'Vietnam has no carbon price — the hidden cost of exporting to Europe'
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(
                      '越南是亞洲第三大 CBAM 涵蓋產品對歐出口國，年出口額約 30 億美元。但因為沒有正式碳定價機制，出口商無法折抵任何 CBAM 費用——同一批鋼鐵，從越南出口就是全額負擔。這不是小比例的差異，而是「有折抵」和「零折抵」的結構性鴻溝。',
                      'Vietnam is Asia\'s third-largest exporter of CBAM-covered goods to the EU, with ~$3B in annual exports. But without a formal carbon pricing mechanism, exporters cannot deduct any domestic payments — the same steel shipped from Vietnam means full CBAM exposure. This isn\'t a marginal difference; it\'s the structural gap between "some offset" and "zero offset."'
                    )}
                  </p>
                  <span className="text-xs font-medium text-red-500">{t('→ 點擊試算', '→ Calculate')}</span>
                </CardContent>
              </Card>
            </Link>

            {/* Card 4 */}
            <Link href="/tw" className="block">
              <Card className="h-full hover:shadow-lg hover:border-[#89B56C] transition-all cursor-pointer">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {t(
                      '2030 年，碳成本會是現在的幾倍？',
                      'By 2030, how many times will your carbon cost multiply?'
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(
                      '台灣碳費預計從 NT$300 逐步調升至 NT$1,200-1,800，加上高碳洩漏風險的 CL 係數從 0.2 升至 0.6，高碳排企業的碳費可能在 2030 年達到現在的 12 倍。同時，歐盟 CBAM 免費配額從 97.5% 遞減到 0%，出口碳成本在 2034 年將是 2026 年的 2.5 倍。',
                      'Taiwan\'s carbon fee is projected to rise from NT$300 to NT$1,200-1,800, and the carbon leakage factor climbs from 0.2 to 0.6. For high-emission manufacturers, domestic fees alone could reach 12× their 2025 level by 2030. Meanwhile, EU CBAM free allowances decrease from 97.5% to zero, pushing export carbon costs to 2.5× their 2026 level by 2034.'
                    )}
                  </p>
                  <span className="text-xs font-medium text-[#89B56C]">{t('→ 點擊模擬', '→ Simulate')}</span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CBAM Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            {t('EU CBAM 時間軸', 'EU CBAM Timeline')}
          </h2>
          <p className="text-center text-xs text-gray-400 max-w-2xl mx-auto mb-10">
            {t(
              'CBAM（碳邊境調整機制）是歐盟為防止「碳洩漏」而設的進口碳關稅。2026 年起正式實施，免費配額將逐年減少，至 2034 年完全取消。',
              'CBAM is the EU\'s import carbon tariff to prevent "carbon leakage." Enforcement begins 2026, with free allowances phasing out until full elimination in 2034.'
            )}
          </p>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
            {CBAM_TIMELINE.map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${item.active ? 'bg-[#89B56C] text-white' : 'bg-white border-2 border-gray-300 text-gray-500'}`}>
                  {i + 1}
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-700">{item.year}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CBAM Deduction Confidence */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AllCountriesDeductionTable />
        </div>
      </section>

      {/* 亞太碳定價的資訊斷層 — COPY.md Section 4 */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-6">
            {t('亞太碳定價的資訊斷層', 'The information gap in Asia-Pacific carbon pricing')}
          </h2>
          <div className="prose prose-sm prose-gray max-w-none space-y-4 text-gray-600 leading-relaxed">
            <p>
              {t(
                '2025-2026 年是亞太碳定價的轉折期。台灣碳費已開徵、新加坡碳稅調升至 SGD 45、日本 GX-ETS 從自願轉為強制、泰國通過首部碳稅立法 — 六個主要經濟體幾乎同時啟動或加速碳定價。與此同時，歐盟 CBAM 於 2026 年正式進入實質階段，亞洲出口企業首次面臨「國內碳價 + 國際碳關稅」的雙重成本結構。',
                '2025-2026 marked a turning point for carbon pricing in Asia-Pacific. Taiwan launched its carbon fee, Singapore raised its carbon tax to SGD 45, Japan\'s GX-ETS shifted from voluntary to mandatory, and Thailand passed its first carbon tax legislation — six major economies activating or accelerating carbon pricing almost simultaneously. The EU CBAM has now entered its definitive phase in 2026, creating a first-of-its-kind "domestic carbon price + international carbon tariff" dual cost structure for Asian exporters.'
              )}
            </p>
            <p>
              {t(
                '然而，市場上的工具跟不上這個變化。現有的 CBAM 計算器清一色為歐盟進口商設計，計算的是「進口商要買多少憑證」，而不是「亞洲出口企業的實際碳成本是多少」。更關鍵的問題 — 國內繳的碳費能折抵多少 CBAM？不同國家的抵扣規則差異有多大？選擇優惠費率和一般費率的長期成本差異是什麼？ — 這些問題沒有任何公開工具能回答。',
                'But the tools haven\'t kept up. Every CBAM calculator on the market is built for EU importers — calculating how many certificates an importer needs to buy, not what the actual carbon cost is for an Asian exporter. The more critical questions — how much of your domestic carbon payments can offset CBAM? How do deduction rules differ across countries? What\'s the long-term cost difference between preferential and standard fee rates? — no public tool answers these.'
              )}
            </p>
            <p className="font-medium text-gray-800">
              {t('CarbonLens 的設計就是為了補上這個資訊斷層。', 'CarbonLens was built to close that gap.')}
            </p>
            <p>
              {t(
                '這是一個免費工具，因為碳成本的透明度不應該有門檻。無論是台灣的鋼鐵廠主管、新加坡的煉油廠財務、泰國的水泥出口商、還是越南的工廠供應鏈經理，都應該能在 30 秒內知道碳定價對營運意味著什麼 — 而不是花幾十萬請顧問才能得到一個數字。',
                'It\'s free because carbon cost transparency shouldn\'t have a paywall. Whether it\'s a steel plant executive in Taiwan, a finance director at a Singapore refinery, a cement exporter in Thailand, or a supply chain manager at a factory in Vietnam — anyone should be able to see what carbon pricing means for their bottom line in 30 seconds, without paying a consultant a six-figure fee.'
              )}
            </p>
            <p className="text-xs text-gray-400">
              {t(
                '這個工具服務三類使用者：正在評估碳費申報方案的企業財務與永續部門、需要快速估算客戶碳成本的 ESG 顧問、以及研究各國碳定價差異的產業分析師與記者。歡迎回饋任何計算問題或新增國家的需求。',
                'This tool serves three types of users: corporate finance and sustainability teams evaluating carbon fee filing strategies, ESG consultants who need quick cost estimates for clients, and industry analysts and journalists researching carbon pricing differences across the region. Feedback on calculation issues or requests for additional countries are always welcome.'
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
