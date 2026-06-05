'use client';

import { useI18n } from '@/lib/i18n/context';
import type { BilingualText, LeadRoutingResult } from '@/lib/diagnose/types';

// TODO(config): wire to the existing 14-day trial funnel and the HubSpot booking link.
// Left as placeholders until the URLs are provided (see "need from you" in the brief).
const TRIAL_URL = '#';
const BOOKING_URL = '#';

const DEFAULT_ENTERPRISE: { title: BilingualText; desc: BilingualText } = {
  title: { zhTW: '預約揭露數據與同業對標評估', en: 'Book a disclosure data & peer-benchmark assessment' },
  desc: {
    zhTW: '由 RECC 數據層協助盤點落差、對標同業，並對接申報執行夥伴。',
    en: 'RECC’s data layer helps map your gaps, benchmark peers, and connect to filing partners.',
  },
};

export default function DualCTA({
  routing,
  enterprise,
}: {
  routing: LeadRoutingResult;
  enterprise?: { title: BilingualText; desc: BilingualText };
}) {
  const { t, tObj } = useI18n();
  const isEnterprise = routing.recommendedPool === 'enterprise';
  const ent = enterprise ?? DEFAULT_ENTERPRISE;

  return (
    <div className="space-y-3">
      {routing.signals.length > 0 && (
        <p className="text-xs text-gray-500">
          {t('依您提供的訊號（', 'Based on your signals (')}
          {routing.signals.map((s) => tObj(s)).join(t('、', '; '))}
          {t('），建議路徑：', '), recommended path:')}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Enterprise → 預約評估 (BD) */}
        <a
          href={BOOKING_URL}
          data-todo="booking-url"
          className={`block rounded-xl border p-4 transition-all ${
            isEnterprise
              ? 'border-[#89B56C] bg-[#89B56C]/5 ring-1 ring-[#89B56C]/40'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">{t('企業', 'Enterprise')}</span>
            {isEnterprise && (
              <span className="rounded-full bg-[#89B56C] px-2 py-0.5 text-[11px] font-medium text-white">
                {t('建議', 'Recommended')}
              </span>
            )}
          </div>
          <p className="mt-2 text-base font-semibold text-gray-900">{tObj(ent.title)}</p>
          <p className="mt-1 text-sm text-gray-600">{tObj(ent.desc)}</p>
          <p className="mt-3 text-sm font-medium text-[#5d7d44]">{t('預約評估 →', 'Book assessment →')}</p>
        </a>

        {/* Individual → 試閱 */}
        <a
          href={TRIAL_URL}
          data-todo="trial-url"
          className={`block rounded-xl border p-4 transition-all ${
            !isEnterprise
              ? 'border-[#89B56C] bg-[#89B56C]/5 ring-1 ring-[#89B56C]/40'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">{t('個人專業者', 'Individual')}</span>
            {!isEnterprise && (
              <span className="rounded-full bg-[#89B56C] px-2 py-0.5 text-[11px] font-medium text-white">
                {t('建議', 'Recommended')}
              </span>
            )}
          </div>
          <p className="mt-2 text-base font-semibold text-gray-900">{t('開始 14 天免費試閱', 'Start a 14-day free trial')}</p>
          <p className="mt-1 text-sm text-gray-600">{t('追蹤法規時程與揭露情報，掌握第一手合規動態。', 'Track regulatory timelines and disclosure intelligence — stay ahead on compliance.')}</p>
          <p className="mt-3 text-sm font-medium text-[#5d7d44]">{t('開始試閱 →', 'Start trial →')}</p>
        </a>
      </div>
      <p className="text-[11px] text-gray-400">{t('（CTA 連結待接既有試閱漏斗與 HubSpot 預約頁。）', '(CTA links pending the existing trial funnel and HubSpot booking page.)')}</p>
    </div>
  );
}
