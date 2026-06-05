'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { INDUSTRIES } from '@/lib/diagnose/data/industries';
import type { BilingualText, EmployeeBand, FrameworkKey, SupplyChainInput } from '@/lib/diagnose/types';

const FRAMEWORK_OPTIONS: { value: FrameworkKey; label: BilingualText }[] = [
  { value: 're100', label: { zhTW: 'RE100', en: 'RE100' } },
  { value: 'sbti', label: { zhTW: 'SBTi', en: 'SBTi' } },
  { value: 'cdp', label: { zhTW: 'CDP', en: 'CDP' } },
  { value: 'unsure', label: { zhTW: '不確定', en: 'Not sure' } },
];

const EMPLOYEE_BANDS: { value: EmployeeBand; label: BilingualText }[] = [
  { value: 'under250', label: { zhTW: '未滿 250 人', en: 'Under 250' } },
  { value: 'from250to999', label: { zhTW: '250–999 人', en: '250–999' } },
  { value: 'over1000', label: { zhTW: '1,000 人以上', en: '1,000+' } },
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
    <div className="flex flex-wrap gap-2">
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

export default function SupplyChainForm({ onSubmit }: { onSubmit: (input: SupplyChainInput) => void }) {
  const { t, tObj } = useI18n();
  const [frameworks, setFrameworks] = useState<FrameworkKey[]>(['sbti']);
  const [industry, setIndustry] = useState('electronics');
  const [exportSupplyChain, setExportSupplyChain] = useState(true);
  const [employeeBand, setEmployeeBand] = useState<EmployeeBand>('from250to999');

  const industryLabel = INDUSTRIES.find((i) => i.value === industry)?.label;
  const bandLabel = EMPLOYEE_BANDS.find((b) => b.value === employeeBand)?.label;

  function toggleFramework(k: FrameworkKey) {
    setFrameworks((prev) => {
      if (k === 'unsure') return prev.includes('unsure') ? prev.filter((x) => x !== 'unsure') : ['unsure'];
      const withoutUnsure = prev.filter((x) => x !== 'unsure');
      return withoutUnsure.includes(k) ? withoutUnsure.filter((x) => x !== k) : [...withoutUnsure, k];
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('輸入供應鏈條件', 'Your supply-chain profile')}</CardTitle>
        <p className="mt-1 text-xs text-gray-400">
          {t(
            '我們僅依品牌客戶的公開承諾推估「預期被要求」，不代表任何品牌對貴司的具體要求。',
            'We profile “expected demands” from brand customers’ public commitments only — not any brand’s specific demand on your company.',
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('主要品牌客戶已公開承諾的框架（可複選）', 'Frameworks your key brand customers have committed to (multi-select)')}</Label>
          <div className="flex flex-wrap gap-2">
            {FRAMEWORK_OPTIONS.map((o) => {
              const selected = frameworks.includes(o.value);
              return (
                <Button
                  key={o.value}
                  type="button"
                  size="sm"
                  variant={selected ? 'default' : 'outline'}
                  onClick={() => toggleFramework(o.value)}
                  className={selected ? 'bg-[#89B56C] text-white hover:bg-[#6E9156]' : ''}
                >
                  {tObj(o.label)}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">{t('依 RE100／SBTi／CDP 公開會員名單自行判斷；不確定可先選「不確定」。', 'Judge from the public RE100/SBTi/CDP member lists; pick “Not sure” if unsure.')}</p>
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

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('是否供應出口供應鏈？', 'Do you supply an export supply chain?')}</Label>
          <ToggleRow<boolean>
            value={exportSupplyChain}
            onChange={setExportSupplyChain}
            options={[
              { value: true, label: { zhTW: '是', en: 'Yes' } },
              { value: false, label: { zhTW: '否', en: 'No' } },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('員工規模', 'Employee size')}</Label>
          <Select value={employeeBand} onValueChange={(v) => v && setEmployeeBand(v as EmployeeBand)}>
            <SelectTrigger className="w-full">
              <SelectValue>{() => (bandLabel ? tObj(bandLabel) : '')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {EMPLOYEE_BANDS.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {tObj(b.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">{t('用於判斷 CSRD 價值鏈上限（員工 <1,000 人有保護）。', 'Used for the CSRD value-chain cap (<1,000 employees are protected).')}</p>
        </div>

        <Button
          onClick={() => onSubmit({ frameworks, industry, exportSupplyChain, employeeBand })}
          className="h-11 w-full bg-[#89B56C] text-base text-white hover:bg-[#6E9156]"
        >
          {t('側寫我的供應鏈碳壓力', 'Profile my supply-chain pressure')}
        </Button>
        <p className="text-center text-xs text-gray-400">{t('免費・即時計算・不需註冊', 'Free · instant · no signup')}</p>
      </CardContent>
    </Card>
  );
}
