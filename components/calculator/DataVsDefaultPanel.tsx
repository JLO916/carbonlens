'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/data/exchange-rates';
import { useI18n } from '@/lib/i18n/context';

interface Props {
  actualEmissions: number;
  defaultEmissions: number;
  defaultMarkupPercent: number;
  importVolume: number;
  euEtsPrice: number;
  year: number;
}

export default function DataVsDefaultPanel({
  actualEmissions, defaultEmissions, defaultMarkupPercent,
  importVolume, euEtsPrice
}: Props) {
  const { t } = useI18n();

  const defaultWithMarkup = defaultEmissions * (1 + defaultMarkupPercent / 100);
  const costWithActual = importVolume * actualEmissions * euEtsPrice;
  const costWithDefault = importVolume * defaultWithMarkup * euEtsPrice;
  const savings = costWithDefault - costWithActual;
  const savingsPercent = costWithDefault > 0 ? (savings / costWithDefault * 100) : 0;

  if (savings <= 0) return null;

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader className="bg-orange-50">
        <CardTitle className="text-lg">
          {t('有數據 vs 沒數據：你的歐盟客戶成本差多少？', 'Actual Data vs Defaults: How much can your EU buyer save?')}
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">
          {t(
            `預設值加成 ${defaultMarkupPercent}%。提供實際排放數據可降低歐盟進口商的 CBAM 成本。`,
            `Default markup: ${defaultMarkupPercent}%. Providing actual emissions data reduces your EU importer's CBAM cost.`
          )}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 mb-1">{t('提供實際數據', 'With Actual Data')}</p>
            <p className="text-xs text-gray-500">{actualEmissions.toFixed(2)} tCO₂e/t</p>
            <p className="text-2xl font-bold text-green-800">€{formatCurrency(costWithActual)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 mb-1">{t('用預設值申報', 'With Default Values')}</p>
            <p className="text-xs text-gray-500">{defaultWithMarkup.toFixed(2)} tCO₂e/t (+{defaultMarkupPercent}%)</p>
            <p className="text-2xl font-bold text-red-800">€{formatCurrency(costWithDefault)}</p>
          </div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg">
          <p className="text-sm font-semibold text-orange-900">
            {t('差額', 'Difference')}: €{formatCurrency(savings)} ({savingsPercent.toFixed(0)}%)
          </p>
          <p className="text-xs text-orange-700 mt-1">
            {t(
              '→ 這個差額代表你建立碳排放數據管理能力後，能幫歐盟客戶省下的碳關稅金額',
              '→ This gap represents how much carbon border tax your EU buyer saves when you provide actual emissions data'
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
