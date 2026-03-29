'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DomesticResult } from '@/lib/calculators/domestic/types';
import { CBAMResult, CountryCode } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

interface Props {
  countryCode: CountryCode | 'other';
  domesticResult?: DomesticResult;
  cbamResult?: CBAMResult;
  dataVsDefaultSavings?: number;
}

export default function RecommendationsPanel({ countryCode, domesticResult, cbamResult, dataVsDefaultSavings }: Props) {
  const { t } = useI18n();
  const recommendations: { icon: string; text: string }[] = [];

  if (countryCode === 'vn') {
    recommendations.push({
      icon: '⚠️',
      text: t(
        '越南目前沒有正式的碳定價機制，這意味著你的歐盟客戶從越南進口時，無法申請任何碳價抵扣——碳關稅必須全額負擔。建議關注越南碳交易試行進度，並考慮提前建立碳排放數據的管理能力（例如 ISO 14064 碳盤查），這樣至少能幫客戶用實際數據申報，避免被套用更貴的預設值。',
        "Vietnam currently has no formal carbon pricing mechanism. This means your EU buyer cannot claim any carbon price deduction when importing from Vietnam — they pay full carbon border tax. We recommend monitoring Vietnam's ETS pilot progress and considering building carbon data management capability (e.g., ISO 14064 inventory). At minimum, this lets your buyer report with actual data instead of the more expensive default values."
      ),
    });
  }

  if (dataVsDefaultSavings && dataVsDefaultSavings > 50000) {
    recommendations.push({
      icon: '💡',
      text: t(
        `提供實際排放數據可幫歐盟客戶減少約 €${Math.round(dataVsDefaultSavings).toLocaleString()} 的 CBAM 成本。建議優先建立產品碳排放數據管理能力。`,
        `Providing actual emissions data could reduce your EU buyer's CBAM cost by ~€${Math.round(dataVsDefaultSavings).toLocaleString()}. Consider prioritizing product carbon data management.`
      ),
    });
  }

  if (cbamResult) {
    recommendations.push({
      icon: '📋',
      text: t(
        '提醒：CBAM 的繳費義務由歐盟進口商承擔，不是出口商。本工具估算的碳關稅是你的歐盟客戶面臨的成本。這個成本會不會影響到你——比如客戶要求你分攤、或轉向碳排更低的競爭對手——取決於你和客戶之間的商業關係。',
        "Reminder: CBAM payment obligations fall on the EU importer, not the exporter. The carbon border tax shown here is what your EU buyer faces. Whether this cost affects you — through cost-sharing requests or buyers switching to lower-carbon competitors — depends on your commercial relationship."
      ),
    });
  }

  if (recommendations.length === 0) return null;

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t('這些數字對你意味著什麼', 'What these numbers mean for you')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg text-sm">
            <span>{rec.icon}</span>
            <p className="text-gray-700">{rec.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
