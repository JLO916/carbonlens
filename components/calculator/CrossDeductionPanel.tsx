'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryCode } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

interface DeductionInfo {
  level: 'high' | 'medium' | 'low' | 'none';
  icon: string;
  reason: { zhTW: string; en: string };
}

const DEDUCTION_CONFIDENCE: Record<CountryCode, DeductionInfo> = {
  sg: {
    level: 'high',
    icon: '🟢',
    reason: { zhTW: '明確碳稅，直接適用 CBAM 抵扣', en: 'Clear carbon tax, directly applicable for CBAM deduction' },
  },
  kr: {
    level: 'high',
    icon: '🟢',
    reason: { zhTW: 'K-ETS 配額購買成本符合 CBAM 定義', en: 'K-ETS allowance purchase costs meet CBAM definition' },
  },
  tw: {
    level: 'medium',
    icon: '🟡',
    reason: { zhTW: '碳費可抵，但 Scope 2 折算規則待與歐盟協商', en: 'Carbon fee deductible, but Scope 2 conversion rules pending EU negotiation' },
  },
  jp: {
    level: 'medium',
    icon: '🟡',
    reason: { zhTW: '碳稅 ¥289 定義模糊；GX-ETS 配額較明確可抵扣', en: 'Carbon tax ¥289 definition unclear; GX-ETS allowances more clearly deductible' },
  },
  th: {
    level: 'low',
    icon: '🔴',
    reason: { zhTW: '碳稅嵌入消費稅且不影響價格，歐盟認定存疑', en: 'Carbon tax embedded in excise with no price impact — EU recognition uncertain' },
  },
  vn: {
    level: 'none',
    icon: '⚫',
    reason: { zhTW: '無正式碳價，無法抵扣 — 出口商面臨全額 CBAM 負擔', en: 'No formal carbon price — exporters face full CBAM cost exposure' },
  },
};

const LEVEL_LABELS: Record<string, { zhTW: string; en: string }> = {
  high: { zhTW: '高確定性', en: 'High Confidence' },
  medium: { zhTW: '中等確定性', en: 'Medium Confidence' },
  low: { zhTW: '低確定性', en: 'Low Confidence' },
  none: { zhTW: '無法抵扣', en: 'No Deduction' },
};

const LEVEL_COLORS: Record<string, string> = {
  high: 'bg-green-50 border-green-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-red-50 border-red-200',
  none: 'bg-gray-100 border-gray-300',
};

export default function CrossDeductionPanel({ countryCode }: { countryCode: CountryCode }) {
  const { t, tObj } = useI18n();
  const info = DEDUCTION_CONFIDENCE[countryCode];

  return (
    <Card className={`border ${LEVEL_COLORS[info.level]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {info.icon} {t('CBAM 抵扣確定性', 'CBAM Deduction Confidence')}：{tObj(LEVEL_LABELS[info.level])}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-gray-600">{tObj(info.reason)}</p>
        <p className="text-xs text-gray-400">
          {t(
            '歐盟僅認可符合其定義的「碳價」用於 CBAM 抵扣。碳稅、ETS 配額購買成本通常符合；但嵌入式碳稅或無正式碳價的國家可能無法抵扣。',
            'The EU only recognizes carbon prices meeting its definition for CBAM deduction. Carbon taxes and ETS allowance costs typically qualify; embedded excise taxes or countries without formal carbon pricing may not.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export function AllCountriesDeductionTable() {
  const { t, tObj } = useI18n();
  const codes: CountryCode[] = ['sg', 'kr', 'tw', 'jp', 'th', 'vn'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('各國 CBAM 抵扣確定性', 'CBAM Deduction Confidence by Country')}</CardTitle>
        <p className="text-xs text-gray-400 mt-1">
          {t(
            '下表依歐盟認定的確定性排序。🟢 表示該國碳價機制明確符合 CBAM 抵扣條件；⚫ 表示無正式碳價，出口商須全額負擔 CBAM 成本。',
            'Ranked below by EU recognition certainty. 🟢 indicates the country\'s carbon pricing clearly qualifies for CBAM deduction; ⚫ means no formal carbon price — exporters bear the full CBAM cost.'
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {codes.map((code) => {
            const info = DEDUCTION_CONFIDENCE[code];
            return (
              <div key={code} className={`flex items-center gap-3 p-3 rounded border ${LEVEL_COLORS[info.level]}`}>
                <span className="text-lg">{info.icon}</span>
                <span className="font-medium text-sm w-16">{code.toUpperCase()}</span>
                <span className="text-sm text-gray-500">{tObj(LEVEL_LABELS[info.level])}</span>
                <span className="text-xs text-gray-400 ml-auto hidden sm:block">{tObj(info.reason)}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
