'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CountryCode } from '@/lib/types';
import { COUNTRIES } from '@/lib/data/countries';
import { getCalculator } from '@/lib/calculators/domestic';
import { calculateCBAM } from '@/lib/calculators/cbam';
import { formatCurrency } from '@/lib/data/exchange-rates';
import { useI18n } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency/context';

const COUNTRY_COLORS: Record<CountryCode, string> = {
  tw: '#89B56C', sg: '#E53E3E', kr: '#3182CE',
  jp: '#D53F8C', th: '#DD6B20', vn: '#38A169',
};

interface CompareRow {
  code: CountryCode;
  flag: string;
  name: string;
  domesticCost: number;
  domesticCostUSD: number;
  cbamNetCost: number;
  cbamNetCostUSD: number;
  totalUSD: number;
}

export default function CompareClient() {
  const { t, tObj } = useI18n();
  const { convert, formatConverted, symbol, displayCurrency } = useCurrency();
  const [emissions, setEmissions] = useState(100000);
  const [importVolume, setImportVolume] = useState(5000);
  const [results, setResults] = useState<CompareRow[] | null>(null);

  const handleCompare = () => {
    const codes: CountryCode[] = ['tw', 'sg', 'kr', 'jp', 'th', 'vn'];
    const rows: CompareRow[] = codes.map(code => {
      const calc = getCalculator(code);
      const country = COUNTRIES[code];
      const domestic = calc.calculate({
        annualEmissions: emissions,
        industryType: 'steel',
        year: 2025,
        countrySpecific: calc.getDefaultParams(),
      });

      const cbam = calculateCBAM({
        productType: 'steel_bof',
        importVolume,
        specificEmbeddedEmissions: 2.1,
        useDefaultEmissions: false,
        year: 2026,
        euEtsPrice: 80,
        domesticCarbonPricePaid: domestic.deductibleForCBAM * 0.3,
        originCountry: code,
      });

      const domesticConverted = convert(domestic.totalCarbonCost, country.currency);
      const cbamConverted = convert(cbam.netCBAMCost, 'EUR');

      return {
        code,
        flag: country.flag,
        name: tObj(country.name),
        domesticCost: domestic.totalCarbonCost,
        domesticCostUSD: domesticConverted,
        cbamNetCost: cbam.netCBAMCost,
        cbamNetCostUSD: cbamConverted,
        totalUSD: domesticConverted + cbamConverted,
      };
    });
    setResults(rows.sort((a, b) => b.totalUSD - a.totalUSD));
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.map(r => ({
      name: `${r.flag} ${r.name}`,
      [t('國內碳價', 'Domestic')]: Math.round(r.domesticCostUSD),
      ['CBAM']: Math.round(r.cbamNetCostUSD),
    }));
  }, [results, t]);

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-[#89B56C]">
        <CardHeader>
          <CardTitle className="text-xl">{t('跨國碳成本比較', 'Cross-Country Carbon Cost Comparison')}</CardTitle>
          <p className="text-sm text-gray-500">
            {t('以相同排放假設，比較六國碳成本 + CBAM 淨成本', 'Compare carbon costs across six APAC countries under identical assumptions')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t(
              '若貴企業正在評估亞太區生產基地選址，或需要比較不同出口國的碳合規成本差異，此工具可幫助量化各國「國內碳價 + CBAM 出口成本」的總碳負擔。',
              'If your company is evaluating APAC production site locations or needs to compare carbon compliance costs across export origins, this tool quantifies each country\'s total carbon burden — domestic carbon price + CBAM export cost.'
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('年排放量 (tCO₂e)', 'Annual Emissions (tCO₂e)')}</Label>
              <Input type="number" value={emissions} onChange={e => setEmissions(Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('出口歐盟鋼鐵量（噸）', 'Steel Export to EU (tonnes)')}</Label>
              <Input type="number" value={importVolume} onChange={e => setImportVolume(Number(e.target.value))} min={0} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {t('假設：鋼鐵 BF-BOF 2.1 tCO₂e/t、EU ETS €80、2026年、出口佔比 30%、各國使用預設參數', 'Assumptions: Steel BF-BOF 2.1 tCO₂e/t, EU ETS €80, 2026, 30% EU export share, default country params')}
          </p>
          <Button onClick={handleCompare} className="w-full bg-[#89B56C] hover:bg-[#6E9156] text-white h-11">
            {t('開始比較', 'Compare')}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('碳成本總覽', 'Carbon Cost Overview')} ({displayCurrency})</CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                {t(
                  '長條越長代表碳成本越高。綠色為國內碳費/碳稅，藍色為 CBAM 淨成本。注意越南因無國內碳價，CBAM 部分佔比最大。',
                  'Longer bars indicate higher carbon costs. Green represents domestic carbon fee/tax; blue represents net CBAM cost. Note that Vietnam\'s CBAM portion is largest due to zero domestic carbon price.'
                )}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={v => `${symbol()}${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${symbol()}${Number(v).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey={t('國內碳價', 'Domestic')} stackId="a" fill="#89B56C" />
                  <Bar dataKey="CBAM" stackId="a" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('詳細比較', 'Detailed Comparison')}</CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                {t(
                  '表格依合計碳成本由高至低排序。CBAM 欄位始終以歐元顯示（CBAM 原生幣別），其餘欄位依您選擇的顯示幣別換算。',
                  'Table sorted by total carbon cost from highest to lowest. The CBAM column is always in EUR (CBAM\'s native currency); other columns are converted to your selected display currency.'
                )}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 pr-4">{t('國家', 'Country')}</th>
                      <th className="py-2 pr-4 text-right">{t('國內碳價', 'Domestic')} ({displayCurrency})</th>
                      <th className="py-2 pr-4 text-right">CBAM (EUR)</th>
                      <th className="py-2 text-right font-semibold">{t('合計', 'Total')} ({displayCurrency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.code} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4">{r.flag} {r.name}</td>
                        <td className="py-3 pr-4 text-right font-mono">{symbol()}{formatCurrency(r.domesticCostUSD)}</td>
                        <td className="py-3 pr-4 text-right font-mono">€{formatCurrency(r.cbamNetCost)}</td>
                        <td className="py-3 text-right font-mono font-semibold">{symbol()}{formatCurrency(r.totalUSD)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                {t(
                  '⚠️ 越南因無正式碳價，CBAM 成本無法抵扣 — 出口商面臨最高 CBAM 淨成本。',
                  '⚠️ Vietnam has no formal carbon price — exporters face the highest net CBAM cost with zero deduction.'
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
