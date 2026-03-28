'use client';

import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutContent() {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {t('關於 CarbonLens', 'About CarbonLens')}
      </h1>

      <Card>
        <CardContent className="p-8 space-y-5 text-gray-600 leading-relaxed">
          <p>
            {t('CarbonLens 是一個免費的亞太碳成本計算工具，由', 'CarbonLens is a free carbon cost calculator for Asia-Pacific, independently built and maintained by')}{' '}
            <a href="https://www.linkedin.com/in/jimmylo1979/" target="_blank" rel="noopener noreferrer" className="text-[#89B56C] hover:underline font-medium">Jimmy Lo</a>
            {t(' 獨立開發與維護。', '.')}
          </p>
          <p>
            {t(
              '亞太地區正進入碳定價的加速期，六個主要經濟體的碳費、碳稅或排放交易制度在 2025-2026 年間密集上路，企業的碳合規成本計算需求急遽增加。CarbonLens 的目標是讓這些計算變得透明、簡單、對所有人開放。',
              'Asia-Pacific is entering an acceleration phase of carbon pricing, with six major economies launching or scaling up carbon fees, taxes, and emissions trading systems between 2025 and 2026. The demand for clear, accessible carbon compliance cost calculations has never been higher. CarbonLens exists to make those calculations transparent, simple, and open to everyone.'
            )}
          </p>
          <p>
            {t(
              '工具目前涵蓋台灣、新加坡、韓國、日本、泰國、越南六國的國內碳定價機制，以及歐盟 CBAM 碳邊境調整機制。未來將視法規發展與用戶回饋，陸續加入更多國家與功能。',
              'The tool currently covers domestic carbon pricing mechanisms in Taiwan, Singapore, South Korea, Japan, Thailand, and Vietnam, plus the EU Carbon Border Adjustment Mechanism (CBAM). More countries and features will be added based on regulatory developments and user feedback.'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
