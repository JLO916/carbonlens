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
    { year: '2023-25', label: t('過渡期（僅申報）', 'Transition (reporting only)'), active: false },
    { year: '2026', label: t('正式期開始', 'Definitive phase begins'), active: true },
    { year: '2027/2', label: t('憑證購買開始', 'Certificate sales begin'), active: false },
    { year: '2027-33', label: t('配額遞減', 'Free allocation phase-out'), active: false },
    { year: '2034', label: t('全額徵收', 'Full CBAM'), active: false },
  ];

  return (
    <main className="flex-1">
      {/* Hero — COPY.md Section 2 */}
      <section className="bg-gradient-to-br from-[#89B56C]/10 via-white to-[#89B56C]/5 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t(
              '亞太碳成本分析工具 — 30 秒掌握碳定價對你的生意影響',
              'Asia-Pacific Carbon Cost Analyzer — See how carbon pricing affects your business'
            )}
          </h1>
          <p className="text-lg text-[#6E9156] font-medium mb-4">
            {t(
              '你的產品出口歐盟，碳成本曝險有多大？',
              'How much carbon cost exposure do your EU exports carry?'
            )}
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t(
              '2026 年起，歐盟碳邊境調整機制（CBAM）正式對進口鋼鐵、鋁、水泥等產品課徵碳關稅，同時台灣碳費、新加坡碳稅、韓國 K-ETS 等亞太碳定價制度也陸續上路。企業同時面對國內碳價與國際碳關稅的雙重成本壓力，卻缺乏工具一次算清楚。CarbonLens 是專為亞太出口企業設計的碳成本分析工具，幫你在一個頁面評估國內碳價曝險、歐盟客戶面臨的 CBAM 成本、以及各國碳價可供抵扣的可能性。',
              'Starting 2026, the EU Carbon Border Adjustment Mechanism (CBAM) charges real money on imported steel, aluminum, cement, and more. At the same time, carbon pricing is ramping up across Asia — Taiwan\'s carbon fee, Singapore\'s carbon tax, Korea\'s K-ETS, and Japan\'s GX-ETS are all in effect. Exporters face a double cost squeeze, yet no tool calculates both sides together. CarbonLens helps you see three things in one place: your domestic carbon cost, how much carbon border tax your EU buyer faces, and how likely your country\'s carbon price is to qualify for a CBAM deduction. Free, no signup, results in 30 seconds.'
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
            {t('三個問題，一次看清楚', 'Three questions, one clear picture')}
          </h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('你的國內碳成本曝險有多大？', 'How big is your domestic carbon cost exposure?')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(
                    '選擇你的國家，輸入排放量和產業別，工具自動套用該國最新的碳費率和免徵門檻。台灣企業可以比較三種費率方案（一般費率 NT$300、優惠 B NT$100、優惠 A NT$50），看十年下來每種方案各花多少錢。其他五國也各有對應的計算邏輯。',
                    'Select your country, enter your emissions and industry, and the tool applies the latest carbon rates and thresholds. Taiwan users can compare three fee rate options (Standard NT$300, Preferential B NT$100, Preferential A NT$50) to see how much each costs over ten years. Each of the other five countries has its own calculation logic.'
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('你的歐盟客戶面臨多少 CBAM 成本？', 'How much CBAM cost does your EU buyer face?')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(
                    '如果你的產品出口歐盟，這裡幫你估算歐盟進口商面臨的 CBAM 碳關稅成本。重點功能是「有數據 vs 沒數據」的比較——如果你能提供產品的實際排放數據，客戶的碳關稅可能比被套預設值低 20-40%。這個差距就是你建立碳盤查能力的投資價值。',
                    'If you export to the EU, this estimates the CBAM cost your European importer will face. The key feature is the "actual data vs. defaults" comparison — if you can provide real emissions data for your products, your buyer\'s carbon border tax could be 20-40% lower than with default values. That gap is what your investment in carbon data management is worth.'
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{t('各國碳價的 CBAM 抵扣可能性有多大？', 'How likely is your carbon price to qualify for CBAM deduction?')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(
                    '你在國內繳的碳費或碳稅，有多少可以被歐盟認定為可抵扣的金額？這個答案因國家而異，差距很大：新加坡和韓國的碳價幾乎確定可以抵扣，台灣和日本部分規則還在跟歐盟談，泰國的碳稅設計特殊所以有疑問，越南則因為沒有正式碳價而完全無法抵扣。工具會標示每個國家的可能性等級，幫你判斷。',
                    'How much of the carbon fee or tax you pay domestically can the EU recognize as deductible? The answer varies dramatically by country: Singapore and Korea\'s carbon prices almost certainly qualify, Taiwan and Japan\'s are partly under negotiation with the EU, Thailand\'s tax design raises questions, and Vietnam has no formal carbon price at all — meaning zero deduction. The tool flags the likelihood level for each country.'
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
            {t('用實際案例看碳成本的影響', 'See carbon costs through real examples')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <Link href="/tw" className="block">
              <Card className="h-full hover:shadow-lg hover:border-[#89B56C] transition-all cursor-pointer">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {t(
                      '選優惠費率到底能省多少？算上 CBAM 的連動效果',
                      'How much does choosing a preferential rate really save — including the CBAM effect?'
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(
                      '一家台灣鋼鐵廠，年排放 10 萬噸，出口 5,000 噸鋼鐵到歐盟。選一般費率要繳 NT$600 萬碳費，但國內繳越多，歐盟客戶能申請抵扣的碳關稅也越多；選優惠 A 只繳 NT$100 萬，抵扣的空間也跟著縮小。把兩邊加起來算——優惠 A 的總成本仍然比一般費率低約 NT$240 萬。國內碳費和歐盟碳關稅之間有連動關係，值得一起看。',
                      'A Taiwan steel plant, 100K tonnes annual emissions, exporting 5,000 tonnes to the EU. The standard rate means NT$6M in domestic carbon fees, but paying more domestically also means the EU buyer can claim a larger CBAM deduction. Preferential A means only NT$1M, but less deduction room. Add both sides up — Preferential A still saves about NT$2.4M total. Domestic fees and EU carbon border tax are linked, and worth looking at together.'
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
                      '同一批鋼鐵從不同國家出口，歐盟客戶的碳關稅差多少？',
                      'Same steel from different countries — how much does your EU buyer\'s carbon border tax differ?'
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(
                      '5,000 噸鋼鐵出口歐盟。歐盟進口商從越南買，CBAM 成本約 €338,000；從台灣買約 €321,000。差距目前不大，但背後原因是結構性的：越南沒有正式碳價，進口商無法申請任何抵扣，等於全額負擔碳關稅。2034 年歐盟免費配額歸零後，這個差距會越拉越大。',
                      '5,000 tonnes of steel exported to the EU. The importer\'s CBAM cost from Vietnam: ~€338,000. From Taiwan: ~€321,000. The gap is modest for now, but structural: Vietnam has no carbon price, so the importer gets zero deduction — full carbon border tax. By 2034 when EU free allowances hit zero, this gap widens significantly.'
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
                      '越南沒有碳價——歐盟客戶的額外負擔',
                      'Vietnam has no carbon price — the extra cost for EU buyers'
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(
                      '越南是亞洲第三大 CBAM 涵蓋產品對歐出口國。但因為沒有正式碳定價機制，歐盟進口商從越南採購時無法申請任何碳價抵扣——同樣的鋼鐵，從越南進口就是全額碳關稅。對正在評估供應鏈佈局的企業來說，供應商所在國的碳定價狀態，已經直接影響到歐盟端的採購成本。',
                      'Vietnam is Asia\'s third-largest exporter of CBAM-covered goods to the EU. But without formal carbon pricing, EU importers sourcing from Vietnam cannot claim any carbon price deduction — the same steel means full carbon border tax. For companies planning supply chain shifts, a supplier\'s country-level carbon pricing status now directly affects EU procurement costs.'
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
                      '台灣碳費預計從 NT$300 逐步調升至 NT$1,200-1,800。加上高碳洩漏風險的 CL 係數從 0.2 升至 0.6，雙重疊加之下，高碳排企業的碳費可能在 2030 年達到現在的 12 倍。歐盟端也一樣：CBAM 免費配額從 97.5% 遞減到 0%，2034 年的碳關稅是 2026 年的約 2.5 倍。國內和國際碳成本同步攀升——用情境模擬看看你的十年成本曲線。',
                      'Taiwan\'s carbon fee is projected to rise from NT$300 to NT$1,200-1,800. Combined with the carbon leakage CL coefficient increasing from 0.2 to 0.6, high-emission manufacturers could see domestic carbon fees reach 12× their 2025 level by 2030. On the EU side, CBAM free allowances drop from 97.5% to zero, pushing carbon border tax to ~2.5× its 2026 level by 2034. Run the scenario simulator to see your 10-year cost curve.'
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
            {t('亞太碳定價正在快速改變，但資訊還沒跟上', 'Carbon pricing in Asia-Pacific is changing fast — the tools haven\'t kept up')}
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
                '然而，市場上的工具跟不上這個變化。現有的碳關稅計算器大多從歐盟進口商的角度設計，計算的是「進口商要買多少憑證」，而不是「亞洲出口企業的實際碳成本是多少」。更關鍵的問題 — 國內繳的碳費能折抵多少 CBAM？不同國家的抵扣規則差異有多大？選擇優惠費率和一般費率的長期成本差異是什麼？ — 把這些問題整合在一起回答的公開工具還很少。',
                'But the tools haven\'t kept up. Most CBAM calculators on the market are built from the EU importer\'s perspective — calculating how many certificates an importer needs to buy, not what the actual carbon cost is for an Asian exporter. The more critical questions — how much of your domestic carbon payments can offset CBAM? How do deduction rules differ across countries? What\'s the long-term cost difference between preferential and standard fee rates? — few public tools bring these together.'
              )}
            </p>
            <p className="font-medium text-gray-800">
              {t('CarbonLens 就是為了補上這個缺口。', 'CarbonLens was built to close that gap.')}
            </p>
            <p>
              {t(
                '這是一個免費工具，因為碳成本的透明度不應該有門檻。無論是台灣的鋼鐵廠主管、新加坡的煉油廠財務、泰國的水泥出口商、還是越南的工廠供應鏈經理，都應該能在 30 秒內掌握碳定價的影響量級 — 作為進一步評估和規劃的起點。',
                'It\'s free because carbon cost transparency shouldn\'t have a paywall. Whether it\'s a steel plant executive in Taiwan, a finance director at a Singapore refinery, a cement exporter in Thailand, or a supply chain manager at a factory in Vietnam — anyone should be able to gauge the magnitude of carbon pricing impact in 30 seconds, as a starting point for further evaluation and planning.'
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
