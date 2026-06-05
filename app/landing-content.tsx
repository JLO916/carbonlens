'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import CountrySelector from '@/components/calculator/CountrySelector';
import { COUNTRIES } from '@/lib/data/countries';
import { Button } from '@/components/ui/button';
import { AllCountriesDeductionTable } from '@/components/calculator/CrossDeductionPanel';
import type { BilingualText } from '@/lib/types';

const AVAILABLE_COUNTRIES = ['tw', 'sg', 'kr', 'jp', 'th', 'vn'] as const;

interface Tool {
  icon: string;
  pain: BilingualText; // the user's own question / pain — the hook
  desc: BilingualText; // short validation / context
  tool: BilingualText; // the tool that answers it
  href: string;
  badge?: BilingualText;
}

// Compliance — "what are you on the hook for, and how urgent?"
const COMPLIANCE_PAINS: Tool[] = [
  {
    icon: '🏛️',
    pain: { zhTW: '「我們公司哪一年要編 IFRS 永續報告？Scope 3 怎麼辦？」', en: '“Which year do we file IFRS sustainability reports — and what about Scope 3?”' },
    desc: { zhTW: '上市櫃依資本額分三階段接軌，申報年度與揭露範圍各不同，Scope 3 是最大難點。', en: 'Listed firms align in three phases by capital; filing year and scope differ, and Scope 3 is the hardest part.' },
    tool: { zhTW: '上市櫃揭露診斷', en: 'Listed-disclosure diagnosis' },
    href: '/diagnose/listed',
    badge: { zhTW: '可立即診斷', en: 'Available' },
  },
  {
    icon: '🔗',
    pain: { zhTW: '「品牌客戶開始要 CDP、要 Scope 3 數據——不配合會失單嗎？」', en: '“Brand customers want CDP and Scope 3 data — will we lose the account if we can’t?”' },
    desc: { zhTW: '有淨零承諾的品牌把碳要求往供應鏈下壓；但中小供應商有 CSRD 保護，不必過度恐慌。', en: 'Net-zero brands push carbon demands down the chain — but smaller suppliers have CSRD protection; no need to over-panic.' },
    tool: { zhTW: '供應鏈碳要求側寫', en: 'Supply-chain demand profile' },
    href: '/diagnose/supply-chain',
    badge: { zhTW: '可立即診斷', en: 'Available' },
  },
  {
    icon: '🇪🇺',
    pain: { zhTW: '「產品出口歐盟，CBAM 到底會讓我暴露多少？」', en: '“We export to the EU — how big is our CBAM exposure?”' },
    desc: { zhTW: '2026 定義期已上路、2027 開始繳憑證。用你的實際排放與當前 ETS 價，先看條件式暴露區間。', en: 'The 2026 definitive period is live; certificates start 2027. Use your actual emissions and current ETS price to see a conditional range.' },
    tool: { zhTW: 'CBAM 暴露評估', en: 'CBAM exposure assessment' },
    href: '/diagnose/cbam',
    badge: { zhTW: '可立即診斷', en: 'Available' },
  },
];

// Cost — "how much will you owe?"
const COST_PAINS: Tool[] = [
  {
    icon: '🧮',
    pain: { zhTW: '「國內碳費／碳稅，我一年要繳多少？哪個方案省？」', en: '“How much carbon fee/tax do we owe a year — and which option is cheaper?”' },
    desc: { zhTW: '台灣碳費三種費率、亞太六國碳價，輸入排放量即時算清。', en: 'Taiwan’s three fee rates and six APAC countries’ prices — enter your emissions for an instant figure.' },
    tool: { zhTW: '國別碳費試算', en: 'Domestic carbon cost' },
    href: '/tw',
  },
  {
    icon: '💶',
    pain: { zhTW: '「我的歐盟客戶要付多少 CBAM？我能幫他抵扣多少？」', en: '“How much CBAM will our EU buyer pay — and how much can we offset?”' },
    desc: { zhTW: '估算進口商的 CBAM 憑證成本，以及原產國碳價可抵扣的金額。', en: 'Estimate the importer’s CBAM certificate cost and the deduction your origin-country carbon price allows.' },
    tool: { zhTW: 'CBAM 成本試算', en: 'CBAM calculator' },
    href: '/cbam',
  },
  {
    icon: '📊',
    pain: { zhTW: '「同樣的產品，從不同國家出口差多少？」', en: '“Same product, different countries — how much does it differ?”' },
    desc: { zhTW: '同一排放假設下，六國碳成本並排比較，看出供應鏈布局的成本差異。', en: 'Compare six countries’ carbon cost side by side under one assumption to see the sourcing-location gap.' },
    tool: { zhTW: '跨國比較', en: 'Cross-country compare' },
    href: '/compare',
  },
];

function ToolCard({ t: tool }: { t: Tool }) {
  const { t, tObj } = useI18n();
  return (
    <Link href={tool.href} className="group block">
      <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all group-hover:border-[#89B56C] group-hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{tool.icon}</span>
          {tool.badge && (
            <span className="rounded-full bg-[#89B56C]/10 px-2.5 py-0.5 text-xs font-medium text-[#5d7d44]">{tObj(tool.badge)}</span>
          )}
        </div>
        <h3 className="mt-3 text-[15px] font-semibold leading-snug text-gray-900">{tObj(tool.pain)}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{tObj(tool.desc)}</p>
        <p className="mt-3 border-t border-gray-100 pt-3 text-sm font-medium text-[#5d7d44] group-hover:underline">
          {tObj(tool.tool)} →
        </p>
      </div>
    </Link>
  );
}

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
      {/* Hero — name the pressure */}
      <section className="bg-gradient-to-br from-[#89B56C]/10 via-white to-[#89B56C]/5 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-medium text-[#5d7d44]">CarbonLens · RECCESSARY</p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 lg:text-[2.75rem]">
            {t('碳合規壓力同時湧來——你到底被要求了什麼？', 'Carbon-compliance pressure is closing in — what are you actually on the hook for?')}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-600">
            {t(
              '金管會的永續揭露排程、品牌客戶的供應鏈碳要求、歐盟 CBAM 碳關稅——三股壓力同時到位，卻沒人告訴你：你屬於哪一階段、何時被要求、暴露有多大。先花 30 秒看清，再決定怎麼做。每個數字都標來源與同步日期；非法律意見、非永續簽證。',
              'The FSC’s disclosure schedule, brand customers’ supply-chain carbon demands, and the EU’s CBAM tariff are all landing at once — yet no one tells you which phase you’re in, when you’re on the hook, or how big your exposure is. Take 30 seconds to see it clearly, then decide what to do. Every figure carries its source and sync date; not legal advice, not a sustainability assurance.',
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/diagnose">
              <Button className="h-12 bg-[#89B56C] px-8 text-base text-white hover:bg-[#6E9156]">
                {t('看清我的暴露', 'See my exposure')}
              </Button>
            </Link>
            <Link href="/tw">
              <Button variant="outline" className="h-12 border-[#89B56C] px-8 text-base text-[#5d7d44] hover:bg-[#89B56C]/10">
                {t('試算碳成本', 'Calculate cost')}
              </Button>
            </Link>
            <Link href="/guide">
              <Button variant="outline" className="h-12 border-gray-300 px-8 text-base text-gray-600 hover:bg-gray-100">
                {t('使用說明', 'Guide')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain-led tool finder */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('這些壓力，你中了幾個？', 'How many of these are hitting you?')}</h2>
          <p className="mx-auto mt-2 mb-10 max-w-2xl text-center text-gray-500">
            {t('點進你正在煩惱的問題，30 秒拿到你的初步答案。', 'Open the question that’s on your mind — get a first answer in 30 seconds.')}
          </p>

          {/* Compliance */}
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold text-gray-900">{t('合規：你被要求了什麼？有多急？', 'Compliance: what are you on the hook for, and how urgent?')}</h3>
            <span className="text-xs text-gray-400">{t('免費判定義務、急迫度與暴露', 'Free: obligations, urgency, exposure')}</span>
            <Link href="/diagnose" className="ml-auto text-sm font-medium text-[#5d7d44] hover:underline">
              {t('診斷總覽 →', 'Overview →')}
            </Link>
          </div>
          <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {COMPLIANCE_PAINS.map((tool) => (
              <ToolCard key={tool.href} t={tool} />
            ))}
          </div>

          {/* Cost */}
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-semibold text-gray-900">{t('成本：你到底要繳多少？', 'Cost: how much will you owe?')}</h3>
            <span className="text-xs text-gray-400">{t('國內碳價 × 歐盟 CBAM', 'Domestic price × EU CBAM')}</span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {COST_PAINS.map((tool) => (
              <ToolCard key={tool.href} t={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Country quick-entry */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold">{t('想先快速估國內碳價？選你的國家', 'Want a quick domestic estimate? Pick your country')}</h2>
          <p className="mb-10 text-center text-gray-500">{t('點擊任一國家進入碳費／碳稅試算', 'Click a country to start its carbon cost calculation')}</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(COUNTRIES) as Array<keyof typeof COUNTRIES>).map((code) => (
              <CountrySelector key={code} country={COUNTRIES[code]} available={AVAILABLE_COUNTRIES.includes(code as (typeof AVAILABLE_COUNTRIES)[number])} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline — urgency framing */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold">{t('你還剩多少時間？EU CBAM 時程', 'How much time do you have? EU CBAM timeline')}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-xs text-gray-400">
            {t(
              'CBAM（碳邊境調整機制）是歐盟為防止「碳洩漏」而設的進口碳關稅。2026 年起正式實施，免費配額逐年減少，至 2034 年完全取消——拖越久、暴露越大。',
              'CBAM is the EU’s import carbon tariff to prevent “carbon leakage.” Enforcement begins 2026, with free allowances phasing out until full elimination in 2034 — the longer you wait, the larger the exposure.',
            )}
          </p>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-gray-200" />
            {CBAM_TIMELINE.map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${item.active ? 'bg-[#89B56C] text-white' : 'border-2 border-gray-300 bg-white text-gray-500'}`}>
                  {i + 1}
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-700">{item.year}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CBAM deduction confidence */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AllCountriesDeductionTable />
        </div>
      </section>

      {/* Why now — validate the pain */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold">{t('為什麼這件事，現在不能再拖', 'Why you can’t keep putting this off')}</h2>
          <div className="space-y-4 text-sm leading-relaxed text-gray-600">
            <p>
              {t(
                '壓力不是單一來源，而是同時湧來：上市櫃永續揭露與 IFRS S1/S2 接軌有明確死線、品牌客戶把 Scope 3 與 CDP 要求往供應鏈下壓、歐盟 CBAM 2026 上路且免費配額逐年歸零。每一個都「有時限」，而且彼此交疊——拖到最後一刻，準備時間最少、暴露最大。',
                'The pressure isn’t from one place — it arrives all at once: listed-company disclosure and IFRS S1/S2 alignment carry hard deadlines, brand customers push Scope 3 and CDP demands down the chain, and the EU CBAM is live for 2026 with free allowances phasing to zero. Each is time-bound, and they overlap — wait until the last minute and you have the least time and the largest exposure.',
              )}
            </p>
            <p>
              {t(
                'CarbonLens 免費幫你先看清：你屬於哪一階段、何時被要求、暴露多大、急迫度多高，並附初步因應清單。每個輸出都標來源與同步日期；本工具為初步診斷與情報參考，非法律意見、非永續簽證。',
                'CarbonLens helps you see it first, for free: which phase you’re in, when you’re on the hook, how big the exposure is, how urgent — with a starter action checklist. Every output carries its source and sync date. This is a preliminary diagnostic and intelligence reference — not legal advice, not a sustainability assurance.',
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
