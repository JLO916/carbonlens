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
            {t('CarbonLens 是一個免費的亞太碳成本分析工具，由', 'CarbonLens is a free carbon cost analysis tool for Asia-Pacific, independently built and maintained by')}{' '}
            <a href="https://www.linkedin.com/in/jimmylo1979/" target="_blank" rel="noopener noreferrer" className="text-[#89B56C] hover:underline font-medium">Jimmy Lo</a>
            {t(' 獨立開發與維護。', '.')}
          </p>
          <p>
            {t(
              '亞太地區正進入碳定價的加速期。台灣、新加坡、韓國、日本、泰國、越南——六個經濟體的碳費、碳稅或碳交易制度在 2025-2026 年間密集上路或大幅調整。企業需要理解碳定價對營運成本的影響，但要搞清楚各國制度的差異和交互關係並不容易。',
              'Asia-Pacific is entering an acceleration phase of carbon pricing. Taiwan, Singapore, South Korea, Japan, Thailand, and Vietnam — six economies are launching or significantly adjusting their carbon fees, taxes, and emissions trading systems in 2025-2026. Businesses need to understand how carbon pricing affects their operating costs, but figuring out the differences and interactions across country systems isn\'t easy.'
            )}
          </p>
          <p>
            {t(
              'CarbonLens 的目標是讓碳成本的估算變得透明、直覺、所有人都能使用。工具目前涵蓋六國國內碳定價機制和歐盟碳關稅（CBAM），未來將視法規變化和使用者回饋持續更新。',
              'CarbonLens aims to make carbon cost estimation transparent, intuitive, and accessible to everyone. The tool currently covers six countries\' domestic carbon pricing mechanisms plus the EU carbon border tax (CBAM), and will be updated as regulations evolve and users provide feedback.'
            )}
          </p>
          <p className="text-xs text-gray-400">
            {t(
              '本工具提供概略估算，不構成法律或稅務建議。',
              'This tool provides approximate estimates and does not constitute legal or tax advice.'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
