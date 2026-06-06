'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Button } from '@/components/ui/button';
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

function WorkbenchFeature({ icon, title, desc }: { icon: string; title: BilingualText; desc: BilingualText }) {
  const { tObj } = useI18n();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 text-sm font-semibold text-gray-900">{tObj(title)}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{tObj(desc)}</p>
    </div>
  );
}

export default function LandingContent() {
  const { t } = useI18n();

  const CBAM_TIMELINE = [
    { year: '2023-25', label: t('過渡期（僅申報）', 'Transition (reporting)'), active: false },
    { year: '2026', label: t('正式期開始', 'Definitive begins'), active: true },
    { year: '2027/2', label: t('憑證購買開始', 'Certificates begin'), active: false },
    { year: '2027-33', label: t('配額遞減', 'Allowances phase out'), active: false },
    { year: '2034', label: t('全額徵收', 'Full CBAM'), active: false },
  ];

  return (
    <main className="flex-1">
      {/* Hero — workbench-first */}
      <section className="bg-gradient-to-br from-[#89B56C]/10 via-white to-[#89B56C]/5 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-medium text-[#5d7d44]">CarbonLens · RECCESSARY</p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 lg:text-[2.75rem]">
            {t('碳費、CBAM、揭露、供應鏈——一個畫面看清全貌', 'Carbon fee, CBAM, disclosure, supply chain — one clear picture')}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-600">
            {t(
              '不必在四個工具間跳來跳去。填一次公司側寫,工作台一次算出你的國內碳費、CBAM 逐年暴露、IFRS 揭露階段與供應鏈壓力,並告訴你「先做哪件」。資料只存在你的瀏覽器、免註冊、每筆數字標一手法源。',
              'Stop hopping between four tools. Fill one company profile and the workbench computes your domestic carbon fee, CBAM ramp, IFRS phase and supply-chain pressure together — and tells you what to do first. Data stays in your browser, no signup, every figure cites primary law.',
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/workbench">
              <Button className="h-12 bg-[#89B56C] px-8 text-base text-white hover:bg-[#6E9156]">
                {t('一次看清我的全貌 →', 'See my whole picture →')}
              </Button>
            </Link>
            <a href="#one-question">
              <Button variant="outline" className="h-12 border-gray-300 px-8 text-base text-gray-600 hover:bg-gray-100">
                {t('只想問一件事？', 'Just one question?')}
              </Button>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><span className="text-[#89B56C]">✓</span>{t('填一次・四件事一起算', 'Fill once · four answers')}</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-[#89B56C]">✓</span>{t('每筆數字標一手法源', 'Every figure cites primary law')}</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-[#89B56C]">✓</span>{t('免費・免註冊・資料留在本機', 'Free · no signup · local')}</span>
          </div>
        </div>
      </section>

      {/* Workbench value — what one profile gives you */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('一份側寫,四件事一次到位', 'One profile, four answers at once')}</h2>
          <p className="mx-auto mt-2 mb-10 max-w-2xl text-center text-gray-500">{t('工作台把原本分散的工具收斂成一個畫面,加上跨義務的「先做哪件」與本機記憶。', 'The workbench unifies the separate tools into one view, with a cross-obligation “do this first” and local memory.')}</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <WorkbenchFeature icon="🧮" title={{ zhTW: '國內碳費', en: 'Domestic carbon fee' }} desc={{ zhTW: '多廠區,含優惠費率把關與「給查核員看」的算式。', en: 'Multi-site, with preferential-rate gating and an auditor-ready breakdown.' }} />
            <WorkbenchFeature icon="🇪🇺" title={{ zhTW: 'CBAM 逐年暴露', en: 'CBAM ramp' }} desc={{ zhTW: '2026→2034 爬升曲線、CN 碼級官方值、ETS 敏感度區間。', en: '2026→2034 ramp, CN-code defaults, ETS sensitivity band.' }} />
            <WorkbenchFeature icon="🏛️" title={{ zhTW: 'IFRS 揭露階段', en: 'IFRS phase' }} desc={{ zhTW: '由資本額自動推階段與死線。', en: 'Phase & deadline derived from your capital tier.' }} />
            <WorkbenchFeature icon="🔗" title={{ zhTW: '供應鏈壓力', en: 'Supply-chain pressure' }} desc={{ zhTW: '依商業模式判定,並標出你的 Scope 3 重點類別。', en: 'By business model, flagging your material Scope 3 categories.' }} />
          </div>
          <div className="mt-8 text-center">
            <Link href="/workbench"><Button className="h-11 bg-[#89B56C] px-8 text-white hover:bg-[#6E9156]">{t('開始填側寫 →', 'Start your profile →')}</Button></Link>
          </div>
        </div>
      </section>

      {/* Just one question? — the single-purpose spokes */}
      <section id="one-question" className="scroll-mt-16 bg-gray-50 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">{t('或,只想單獨問一件事？', 'Or, just one question?')}</h2>
          <p className="mx-auto mt-2 mb-10 max-w-2xl text-center text-gray-500">{t('這些是單一用途的快速工具;算完都可一鍵把結果帶進工作台看全貌。', 'Single-purpose quick tools; each can carry its result into the workbench for the full picture.')}</p>
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

      {/* Timeline — urgency */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-2 text-center text-2xl font-bold">{t('你還剩多少時間？EU CBAM 時程', 'How much time? EU CBAM timeline')}</h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-xs text-gray-400">{t('CBAM 2026 起正式實施,免費配額逐年減少至 2034 年完全取消——拖越久、暴露越大。', 'CBAM enforcement begins 2026; free allowances phase out to zero by 2034 — the longer you wait, the larger the exposure.')}</p>
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200" />
            {CBAM_TIMELINE.map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${item.active ? 'bg-[#89B56C] text-white' : 'border-2 border-gray-300 bg-white text-gray-500'}`}>{i + 1}</div>
                <p className="mt-2 text-sm font-semibold text-gray-700">{item.year}</p>
                <p className="text-center text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-gradient-to-br from-[#89B56C]/15 via-[#89B56C]/5 to-white py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('別再猜、也別再跳工具', 'Stop guessing, stop tool-hopping')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600">{t('填一次側寫,一個畫面看清碳費、CBAM、揭露與供應鏈——免費、不需註冊。', 'Fill one profile, see carbon fee, CBAM, disclosure & supply chain in one view — free, no signup.')}</p>
          <div className="mt-6">
            <Link href="/workbench"><Button className="h-12 bg-[#89B56C] px-8 text-base text-white hover:bg-[#6E9156]">{t('進入工作台 →', 'Open the workbench →')}</Button></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
