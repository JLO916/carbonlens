'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

const LINKEDIN_URL = 'https://www.linkedin.com/in/jimmylo1979/';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#89B56C] flex items-center justify-center text-white font-bold text-[10px]">C</div>
            <span className="text-sm font-semibold text-gray-700">CarbonLens</span>
            <Link href="/about" className="text-xs text-gray-400 hover:text-gray-600 ml-2">
              {t('關於', 'About')}
            </Link>
            <Link href="/methodology" className="text-xs text-gray-400 hover:text-gray-600">
              {t('方法論與來源', 'Methodology & sources')}
            </Link>
            <Link href="/guide" className="text-xs text-gray-400 hover:text-gray-600">
              {t('指南', 'Guide')}
            </Link>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl sm:text-right leading-relaxed">
            {t('CarbonLens 由', 'CarbonLens is built and maintained by')}{' '}
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-[#89B56C] hover:underline font-medium">
              Jimmy Lo
            </a>
            {t(
              ' 製作與維護。本工具提供碳成本估算參考，不構成法律或稅務建議。各國碳定價與歐盟 CBAM 規則持續更新，實際義務請以各國主管機關公告為準。CBAM 繳費義務由歐盟進口商承擔。',
              '. This tool provides carbon cost estimates for reference only and does not constitute legal or tax advice. Carbon pricing rules and EU CBAM regulations are subject to change — verify with relevant authorities. CBAM payment obligations are borne by EU importers.'
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
