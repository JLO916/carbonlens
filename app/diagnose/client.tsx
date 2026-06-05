'use client';

import { useI18n } from '@/lib/i18n/context';
import ModuleCard, { type ModuleCardProps } from '@/components/diagnose/ModuleCard';
import Disclaimer from '@/components/diagnose/Disclaimer';

const MODULES: ModuleCardProps[] = [
  {
    icon: '🏛️',
    title: { zhTW: '上市櫃揭露', en: 'Listed-company disclosure' },
    description: {
      zhTW: '依上市櫃別、資本額與是否已編報告書，判定永續報告書與 IFRS S1/S2 接軌的義務與時程。',
      en: 'Determine your sustainability-report and IFRS S1/S2 obligations and timeline from listing type, capital, and report status.',
    },
    dataNature: { zhTW: '最扎實：金管會官方、已公告', en: 'Most solid: official FSC, published' },
    outputForm: { zhTW: '精準判定', en: 'Precise determination' },
    status: 'active',
    href: '/diagnose/listed',
  },
  {
    icon: '🔗',
    title: { zhTW: '供應鏈碳要求', en: 'Supply-chain carbon demands' },
    description: {
      zhTW: '依品牌客戶的公開承諾（RE100／SBTi／CDP），側寫您「預期被要求」的供應鏈碳壓力。',
      en: 'Profile the carbon demands you are likely to face, based on brand customers’ public commitments (RE100/SBTi/CDP).',
    },
    dataNature: { zhTW: '偏定性：框架公開', en: 'Qualitative: public frameworks' },
    outputForm: { zhTW: '風險側寫', en: 'Risk profile' },
    status: 'active',
    href: '/diagnose/supply-chain',
  },
  {
    icon: '🇪🇺',
    title: { zhTW: 'CBAM 暴露', en: 'CBAM exposure' },
    description: {
      zhTW: '出口歐盟的碳邊境調整暴露評估；碳排量讀自定期同步快取，通過異常檢查前以占位呈現。',
      en: 'EU carbon border exposure; emission values read from a synced cache, shown as placeholders until anomaly checks pass.',
    },
    dataNature: { zhTW: '機制明確；數值定期同步', en: 'Clear mechanism; values synced' },
    outputForm: { zhTW: '條件式區間', en: 'Conditional range' },
    status: 'active',
    href: '/diagnose/cbam',
  },
];

export default function DiagnoseLandingClient() {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="text-sm font-medium text-[#5d7d44]">{t('RECCESSARY · 碳合規暴露診斷', 'RECCESSARY · Carbon compliance exposure')}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
          {t('選產業、勾條件，看清你的碳合規暴露', 'Pick your profile, see your carbon-compliance exposure')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
          {t(
            '免費的個人化診斷與急迫度分數，附初步因應清單。每個數字都標來源與同步日期。',
            'A free, personalized diagnosis with an urgency score and an action checklist. Every figure carries its source and sync date.',
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {MODULES.map((m) => (
          <ModuleCard key={m.title.en} {...m} />
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
