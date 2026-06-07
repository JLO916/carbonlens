'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
import InfoHint from '@/components/ui/InfoHint';
import { JOURNEY } from '@/lib/content/journey';
import { GLOSSARY } from '@/lib/content/glossary';
import type { BilingualText } from '@/lib/types';

interface Tool {
  icon: string;
  pain: BilingualText;
  tool: BilingualText;
  href: string;
}

// "Just one question?" — the single-purpose spokes (they roll up into the workbench).
const COMPLIANCE_PAINS: Tool[] = [
  { icon: '🏛️', pain: { zhTW: '哪一年要編 IFRS 永續報告？Scope 3 怎麼辦？', en: 'Which year do we file IFRS reports — and Scope 3?' }, tool: { zhTW: '上市櫃揭露診斷', en: 'Listed-disclosure diagnosis' }, href: '/diagnose/listed' },
  { icon: '🔗', pain: { zhTW: '品牌客戶要 CDP、要 Scope 3——不配合會失單嗎？', en: 'Customers want CDP & Scope 3 — will we lose the account?' }, tool: { zhTW: '供應鏈碳要求側寫', en: 'Supply-chain demand profile' }, href: '/diagnose/supply-chain' },
  { icon: '🇪🇺', pain: { zhTW: '產品出口歐盟，CBAM 會讓我暴露多少？', en: 'We export to the EU — how big is our CBAM exposure?' }, tool: { zhTW: 'CBAM 暴露評估', en: 'CBAM exposure assessment' }, href: '/diagnose/cbam' },
];
const COST_PAINS: Tool[] = [
  { icon: '🧮', pain: { zhTW: '國內碳費／碳稅一年要繳多少？', en: 'How much carbon fee/tax do we owe a year?' }, tool: { zhTW: '國別碳費試算', en: 'Domestic carbon cost' }, href: '/tw' },
  { icon: '💶', pain: { zhTW: '歐盟客戶要付多少 CBAM？能抵扣多少？', en: 'How much CBAM will our EU buyer pay?' }, tool: { zhTW: 'CBAM 成本試算', en: 'CBAM calculator' }, href: '/cbam' },
  { icon: '📊', pain: { zhTW: '同樣產品，從不同國家出口差多少？', en: 'Same product, different countries — how much differ?' }, tool: { zhTW: '跨國比較', en: 'Cross-country compare' }, href: '/compare' },
];

function ToolCard({ t: tool }: { t: Tool }) {
  const { tObj } = useI18n();
  return (
    <Link href={tool.href} className="group block">
      <div className="flex h-full items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all group-hover:border-[#89B56C] group-hover:shadow-sm">
        <span className="text-2xl">{tool.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-gray-800">{tObj(tool.pain)}</p>
          <p className="mt-1.5 text-xs font-medium text-[#5d7d44] group-hover:underline">{tObj(tool.tool)} →</p>
        </div>
      </div>
    </Link>
  );
}

export default function LandingContent() {
  const { t, tObj } = useI18n();

  return (
    <main className="flex-1">
      {/* Hero — the full cycle, not a single calculator */}
      <section className="bg-gradient-to-br from-[#89B56C]/10 via-white to-[#89B56C]/5 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-medium text-[#5d7d44]">{t('CarbonLens · RECCESSARY ｜ 企業碳合規與管理工作台', 'CarbonLens · RECCESSARY · corporate carbon-management workbench')}</p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 lg:text-[2.75rem]">
            <span className="block">{t('從碳盤查到揭露', 'From carbon inventory to disclosure')}</span>
            <span className="block">{t('全程可查證的企業碳管理工作平台', 'a fully auditable corporate carbon-management platform')}</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-600">
            {t(
              '為出口歐盟、面對品牌客戶碳要求、或須依 IFRS 編製永續資訊的台灣及 APAC 製造業而設計。填一份公司側寫,即完成 Scope 1／2／3 盤查、國內碳費與 CBAM 試算、減量目標與查證管理、義務行事曆與報告匯出——每筆數字標註一手法源、可追溯查核。資料僅存於你的瀏覽器,免註冊。',
              'Built for Taiwan & APAC manufacturers that export to the EU, face brand-customer carbon demands, or file IFRS sustainability information. One company profile completes Scope 1/2/3 inventory, domestic carbon-fee and CBAM estimates, reduction targets and assurance, an obligation calendar and report exports — every figure cites primary law and is traceable for audit. Data stays in your browser, no signup.',
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/workbench">
              <Button className="h-12 bg-[#89B56C] px-8 text-base text-white hover:bg-[#6E9156]">
                {t('進入工作台 →', 'Open the workbench →')}
              </Button>
            </Link>
            <a href="#one-question">
              <Button variant="outline" className="h-12 border-gray-300 px-8 text-base text-gray-600 hover:bg-gray-100">
                {t('只想算一件事？', 'Just one question?')}
              </Button>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><span className="text-[#89B56C]">✓</span>{t('一份側寫・全週期到位', 'One profile · whole cycle')}</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-[#89B56C]">✓</span>{t('每筆數字標一手法源、可追溯', 'Every figure cites primary law, traceable')}</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-[#89B56C]">✓</span>{t('免費・免註冊・資料僅存本機', 'Free · no signup · local only')}</span>
          </div>
        </div>
      </section>

      {/* THE CYCLE — the visual journey (centerpiece) */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('你的碳管理週期,看得見', 'Your carbon-management cycle, visualized')}</h2>
          <p className="mx-auto mt-2 mb-10 max-w-2xl text-center text-gray-500">{t('一個會循環的年度流程。每一站都說明「實際要做什麼」並標出對應的標準與工具,點任一站即可開始。', 'A recurring annual flow. Each stop explains what to do and maps to the relevant standard and tool — click any stop to start.')}</p>

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map((s) => (
              <li key={s.id}>
                <Link href={s.href} className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#89B56C] hover:shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#89B56C] text-sm font-bold text-white">{s.num}</span>
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-semibold text-gray-900">{tObj(s.title)}</span>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-gray-700">{tObj(s.plain)}</p>
                  <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-gray-400">{tObj(s.pro)}</p>
                  <span className="mt-3 inline-flex w-fit items-center rounded-full bg-[#89B56C]/10 px-2 py-0.5 text-[11px] font-medium text-[#5d7d44] group-hover:underline">{tObj(s.tool)} →</span>
                </Link>
              </li>
            ))}
            {/* loop-back marker */}
            <li className="flex items-center justify-center">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#89B56C]/40 bg-[#89B56C]/5 p-4 text-center">
                <span className="text-2xl">↻</span>
                <p className="mt-2 text-sm font-medium text-[#5d7d44]">{t('滾到明年,再走一輪', 'Roll into next year, repeat')}</p>
                <p className="mt-1 text-[11px] text-gray-400">{t('結轉沿用邊界與係數', 'Carry forward boundaries & factors')}</p>
              </div>
            </li>
          </ol>

          <div className="mt-10 text-center">
            <Link href="/workbench"><Button className="h-11 bg-[#89B56C] px-8 text-white hover:bg-[#6E9156]">{t('從第 1 站開始(盤查) →', 'Start at step 1 (inventory) →')}</Button></Link>
          </div>
        </div>
      </section>

      {/* Just one question? — the single-purpose spokes */}
      <section id="one-question" className="scroll-mt-16 bg-gray-50 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('或,只想單獨問一件事？', 'Or, just one question?')}</h2>
          <p className="mx-auto mt-2 mb-10 max-w-2xl text-center text-gray-500">{t('這些是單一用途的快速工具;算完都可一鍵把結果帶進工作台、接回完整週期。', 'Single-purpose quick tools; each can carry its result into the workbench and rejoin the full cycle.')}</p>
          <div className="mb-3 text-sm font-semibold text-gray-700">{t('合規：你被要求什麼？', 'Compliance: what are you on the hook for?')}</div>
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {COMPLIANCE_PAINS.map((tool) => <ToolCard key={tool.href} t={tool} />)}
          </div>
          <div className="mb-3 text-sm font-semibold text-gray-700">{t('成本：你要繳多少？', 'Cost: how much will you owe?')}</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {COST_PAINS.map((tool) => <ToolCard key={tool.href} t={tool} />)}
          </div>
        </div>
      </section>

      {/* Dual-level glossary — newcomers and experts read the same card */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('術語不熟？每個都附說明與標準出處', 'New to the terms? Each one is explained, with its source')}</h2>
          <p className="mx-auto mt-2 mb-8 max-w-2xl text-center text-gray-500">{t('工具全站的術語旁都有 ⓘ:先一句說明,再附精確定義與標準出處。', 'Across the tool, terms carry an ⓘ: a one-line explanation, then the precise definition and source.')}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GLOSSARY.slice(0, 8).map((g) => (
              <div key={g.key} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">{tObj(g.term)}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-700">{tObj(g.plain)}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">{tObj(g.pro)}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/methodology" className="text-sm font-medium text-[#5d7d44] underline-offset-2 hover:underline">{t('看完整方法論與一手法源 →', 'Full methodology & primary sources →')}</Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-gradient-to-br from-[#89B56C]/15 via-[#89B56C]/5 to-white py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('從盤查到揭露,一條龍走完', 'Inventory to disclosure, end to end')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600">{t('填一份側寫,工作台帶你走完七步週期、年年滾動;說明清楚、數字有據,免費、免註冊。', 'Fill one profile; the workbench walks you through all seven steps, year after year — clearly explained, every figure sourced. Free, no signup.')}</p>
          <div className="mt-6">
            <Link href="/workbench"><Button className="h-12 bg-[#89B56C] px-8 text-base text-white hover:bg-[#6E9156]">{t('進入工作台 →', 'Open the workbench →')}</Button></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
