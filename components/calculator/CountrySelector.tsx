'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountryConfig } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

interface Props {
  country: CountryConfig;
  available: boolean;
}

export default function CountrySelector({ country, available }: Props) {
  const { t, tObj } = useI18n();

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    pilot: 'bg-yellow-100 text-yellow-700',
    planned: 'bg-gray-100 text-gray-600',
  };

  const statusLabels = {
    active: t('已實施', 'Active'),
    pilot: t('試行中', 'Pilot'),
    planned: t('規劃中', 'Planned'),
  };

  const content = (
    <Card className={`group transition-all hover:shadow-lg hover:border-[#89B56C] cursor-pointer ${!available ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl">{country.flag}</span>
          <Badge className={statusColors[country.status]} variant="secondary">
            {statusLabels[country.status]}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {tObj(country.name)}
        </h3>
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            {tObj(country.mechanism)}
          </p>
          <p className="text-sm font-medium text-[#89B56C]">
            {country.currentRate.value > 0
              ? `${country.currencySymbol}${country.currentRate.value.toLocaleString()} / tCO₂e`
              : t('尚無正式碳價', 'No formal carbon price yet')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {country.mechanismType === 'carbon_fee' && t('依排放量乘以費率計算碳費', 'Carbon fee calculated by emissions × rate')}
            {country.mechanismType === 'carbon_tax' && t('依排放量或燃料消費量課徵碳稅', 'Carbon tax levied on emissions or fuel consumption')}
            {country.mechanismType === 'ets' && t('透過配額交易市場決定碳價', 'Carbon price determined through allowance trading market')}
            {country.mechanismType === 'hybrid' && t('碳稅與排放交易雙軌並行', 'Dual-track: carbon tax + emissions trading')}
          </p>
        </div>
        {!available && (
          <p className="text-xs text-gray-400 mt-3">{t('即將推出', 'Coming soon')}</p>
        )}
      </CardContent>
    </Card>
  );

  if (!available) return content;

  return (
    <Link href={`/${country.code}`}>
      {content}
    </Link>
  );
}
