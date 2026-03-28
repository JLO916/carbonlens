'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CountryCode } from '@/lib/types';
import { CARBON_PRICE_PROJECTIONS, CBAM_EFFECTIVE_RATE } from '@/lib/calculators/scenario';
import { COUNTRIES } from '@/lib/data/countries';
import { useI18n } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency/context';

interface Props {
  countryCode: CountryCode;
  annualEmissions: number;
}

export default function ScenarioChart({ countryCode, annualEmissions }: Props) {
  const { t } = useI18n();
  const { convert, symbol, displayCurrency } = useCurrency();
  const country = COUNTRIES[countryCode];

  const data = useMemo(() => {
    const projections = CARBON_PRICE_PROJECTIONS[countryCode];
    return Object.entries(projections).map(([yearStr, localRate]) => {
      const year = Number(yearStr);
      const domesticLocal = annualEmissions * localRate;
      const domesticConverted = convert(domesticLocal, country.currency);
      const cbamRate = CBAM_EFFECTIVE_RATE[year] ?? 0;
      const cbamEUR = annualEmissions * 80 * cbamRate;
      const cbamConverted = convert(cbamEUR, 'EUR');
      return {
        year,
        domestic: Math.round(domesticConverted),
        cbam: Math.round(cbamConverted),
        total: Math.round(domesticConverted + cbamConverted),
      };
    });
  }, [countryCode, annualEmissions, country.currency, convert]);

  const sym = symbol();
  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}K`;
    return `${sym}${v}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t('碳成本預測 2025-2034', 'Carbon Cost Projection 2025-2034')}
        </CardTitle>
        <p className="text-xs text-gray-400 mt-1">
          {t(
            '下方圖表模擬未來 10 年的碳成本趨勢。隨著各國碳價預計調升、CBAM 免費配額逐年減少，企業碳合規成本將持續攀升 — 及早規劃減排策略至關重要。',
            'The chart below projects carbon cost trends over the next 10 years. As domestic carbon prices are expected to rise and CBAM free allowances phase out annually, corporate carbon compliance costs will continue to climb — making early decarbonization planning essential.'
          )}
        </p>
        <p className="text-xs text-gray-500">
          {t(
            `假設年排放 ${annualEmissions.toLocaleString()} tCO₂e 不變，EU ETS €80/tCO₂e`,
            `Assuming constant ${annualEmissions.toLocaleString()} tCO₂e/yr, EU ETS €80/tCO₂e`
          )}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatValue} tick={{ fontSize: 11 }} width={65} />
            <Tooltip
              formatter={(value, name) => [
                `${sym}${Number(value).toLocaleString()}`,
                name === 'domestic' ? t('國內碳價', 'Domestic Carbon Cost')
                  : name === 'cbam' ? 'CBAM'
                  : t('合計', 'Total'),
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend
              formatter={(value) =>
                value === 'domestic' ? `${t('國內碳價', 'Domestic')} (${displayCurrency})`
                  : value === 'cbam' ? `CBAM (${displayCurrency})`
                  : `${t('合計', 'Total')} (${displayCurrency})`
              }
            />
            <Line type="monotone" dataKey="domestic" stroke="#89B56C" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="cbam" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
