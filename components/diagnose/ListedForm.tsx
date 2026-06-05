'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import type { BilingualText, CapitalTier, ListedInput, ListingType } from '@/lib/diagnose/types';
import { INDUSTRIES } from '@/lib/diagnose/data/industries';

const CAPITAL_TIERS: { value: CapitalTier; label: BilingualText }[] = [
  { value: 'over100', label: { zhTW: '逾 100 億', en: 'Over NT$10bn' } },
  { value: 'from50to100', label: { zhTW: '50–100 億', en: 'NT$5bn – 10bn' } },
  { value: 'under50', label: { zhTW: '未滿 50 億', en: 'Under NT$5bn' } },
];

function ToggleRow<T extends string | boolean>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: BilingualText }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { tObj } = useI18n();
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Button
            key={String(o.value)}
            type="button"
            size="sm"
            variant={selected ? 'default' : 'outline'}
            onClick={() => onChange(o.value)}
            className={selected ? 'bg-[#89B56C] text-white hover:bg-[#6E9156]' : ''}
          >
            {tObj(o.label)}
          </Button>
        );
      })}
    </div>
  );
}

export default function ListedForm({ onSubmit }: { onSubmit: (input: ListedInput) => void }) {
  const { t, tObj } = useI18n();
  const [listingType, setListingType] = useState<ListingType>('listed');
  const [capitalTier, setCapitalTier] = useState<CapitalTier>('over100');
  const [hasReport, setHasReport] = useState(false);
  const [industry, setIndustry] = useState('electronics');

  const capitalLabel = CAPITAL_TIERS.find((c) => c.value === capitalTier)?.label;
  const industryLabel = INDUSTRIES.find((i) => i.value === industry)?.label;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('輸入公司條件', 'Your company')}</CardTitle>
        <p className="mt-1 text-xs text-gray-400">
          {t('四個條件即可判定揭露義務與時程，計算在前端即時完成。', 'Four inputs determine your disclosure obligations and timeline — computed instantly in your browser.')}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('上市／上櫃別', 'Listing type')}</Label>
          <ToggleRow<ListingType>
            value={listingType}
            onChange={setListingType}
            options={[
              { value: 'listed', label: { zhTW: '上市', en: 'Listed (TWSE)' } },
              { value: 'otc', label: { zhTW: '上櫃', en: 'OTC (TPEx)' } },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('實收資本額級距', 'Paid-in capital tier')}</Label>
          <Select value={capitalTier} onValueChange={(v) => v && setCapitalTier(v as CapitalTier)}>
            <SelectTrigger className="w-full">
              <SelectValue>{() => (capitalLabel ? tObj(capitalLabel) : '')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CAPITAL_TIERS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {tObj(c.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">{t('決定 IFRS S1/S2 接軌的第幾階段（§6A-2）。', 'Determines your IFRS S1/S2 adoption phase (§6A-2).')}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('是否已編永續報告書？', 'Already prepared a sustainability report?')}</Label>
          <ToggleRow<boolean>
            value={hasReport}
            onChange={setHasReport}
            options={[
              { value: true, label: { zhTW: '是', en: 'Yes' } },
              { value: false, label: { zhTW: '否', en: 'No' } },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('產業別', 'Industry')}</Label>
          <Select value={industry} onValueChange={(v) => v && setIndustry(v)}>
            <SelectTrigger className="w-full">
              <SelectValue>{() => (industryLabel ? tObj(industryLabel) : '')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {tObj(i.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => onSubmit({ listingType, capitalTier, hasSustainabilityReport: hasReport, industry })}
          className="h-11 w-full bg-[#89B56C] text-base text-white hover:bg-[#6E9156]"
        >
          {t('診斷我的合規暴露', 'Diagnose my exposure')}
        </Button>
      </CardContent>
    </Card>
  );
}
