'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import ModuleCard, { type ModuleCardProps } from '@/components/diagnose/ModuleCard';
import Disclaimer from '@/components/diagnose/Disclaimer';

const BADGE = { zhTW: '可立即診斷', en: 'Available' };

const MODULES: ModuleCardProps[] = [
  {
    icon: '🏛️',
    pain: { zhTW: '「我們公司哪一年要編 IFRS 永續報告？Scope 3 怎麼辦？」', en: '“Which year do we file IFRS sustainability reports — and what about Scope 3?”' },
    desc: { zhTW: '上市櫃依資本額分三階段接軌，申報年度與揭露範圍各不同，Scope 3 是最大難點。', en: 'Listed firms align in three phases by capital; filing year and scope differ, and Scope 3 is the hardest part.' },
    tool: { zhTW: '上市櫃揭露診斷', en: 'Listed-disclosure diagnosis' },
    href: '/diagnose/listed',
    badge: BADGE,
  },
  {
    icon: '🔗',
    pain: { zhTW: '「品牌客戶開始要 CDP、要 Scope 3 數據——不配合會失單嗎？」', en: '“Brand customers want CDP and Scope 3 data — will we lose the account if we can’t?”' },
    desc: { zhTW: '有淨零承諾的品牌把碳要求往供應鏈下壓；但中小供應商有 CSRD 保護，不必過度恐慌。', en: 'Net-zero brands push carbon demands down the chain — but smaller suppliers have CSRD protection; no need to over-panic.' },
    tool: { zhTW: '供應鏈碳要求側寫', en: 'Supply-chain demand profile' },
    href: '/diagnose/supply-chain',
    badge: BADGE,
  },
  {
    icon: '🇪🇺',
    pain: { zhTW: '「產品出口歐盟，CBAM 到底會讓我暴露多少？」', en: '“We export to the EU — how big is our CBAM exposure?”' },
    desc: { zhTW: '2026 定義期已上路、2027 開始繳憑證。用你的實際排放與當前 ETS 價，先看條件式暴露區間。', en: 'The 2026 definitive period is live; certificates start 2027. Use your actual emissions and current ETS price to see a conditional range.' },
    tool: { zhTW: 'CBAM 暴露評估', en: 'CBAM exposure assessment' },
    href: '/diagnose/cbam',
    badge: BADGE,
  },
];

export default function DiagnoseLandingClient() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="text-sm font-medium text-[#5d7d44]">{t('Carbon Lens 碳排鏡菱 · 碳合規暴露診斷', 'Carbon Lens · Carbon compliance exposure')}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          {t('你正卡在哪一個問題？', 'Which question are you stuck on?')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
          {t(
            '點進你正在煩惱的問題，30 秒得到個人化診斷與急迫度，附初步因應清單。每個數字都標來源與同步日期。',
            'Open the question on your mind for a 30-second personalized diagnosis and urgency score, with a starter checklist. Every figure carries its source and sync date.',
          )}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-gray-400">
          {t(
            '給決策者與初判用——快速掌握量級與時程；不取代你的合規排程或專業意見。',
            'For decision-makers and a first pass — gauge the magnitude and timeline fast; not a substitute for your compliance plan or professional advice.',
          )}
        </p>
      </header>

      <Link href="/workbench" className="block rounded-xl border-2 border-[#89B56C]/30 bg-[#89B56C]/5 p-4 transition-colors hover:bg-[#89B56C]/10">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm leading-relaxed text-gray-700">
            <span className="font-semibold text-[#5d7d44]">{t('想一次看全貌？', 'Want the whole picture?')}</span>{' '}
            {t('工作台填一次側寫,同時算碳費＋CBAM＋揭露＋供應鏈,並給「先做哪件」。', 'The workbench computes carbon fee + CBAM + disclosure + supply chain from one profile, with a “do this first”.')}
          </p>
          <span className="shrink-0 text-sm font-medium text-[#5d7d44]">{t('前往工作台 →', 'Go →')}</span>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {MODULES.map((m) => (
          <ModuleCard key={m.href} {...m} />
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
