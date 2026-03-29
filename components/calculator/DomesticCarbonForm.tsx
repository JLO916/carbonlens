'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DomesticCarbonPriceCalculator, DomesticInput, DomesticResult } from '@/lib/calculators/domestic/types';
import { FormFieldConfig } from '@/lib/types';
import { COUNTRIES } from '@/lib/data/countries';
import { useI18n } from '@/lib/i18n/context';
import ResultPanel from './ResultPanel';
import ScenarioChart from './ScenarioChart';
import CrossDeductionPanel from './CrossDeductionPanel';
import InfoTip from '@/components/ui/info-tip';
import RecommendationsPanel from './RecommendationsPanel';

interface Props {
  calculator: DomesticCarbonPriceCalculator;
}

const INDUSTRIES = [
  { value: 'steel', zhTW: '鋼鐵', en: 'Steel' },
  { value: 'aluminum', zhTW: '鋁', en: 'Aluminum' },
  { value: 'cement', zhTW: '水泥', en: 'Cement' },
  { value: 'petrochemicals', zhTW: '石化', en: 'Petrochemicals' },
  { value: 'power', zhTW: '電力', en: 'Power' },
  { value: 'manufacturing', zhTW: '製造業', en: 'Manufacturing' },
  { value: 'other', zhTW: '其他', en: 'Other' },
];

export default function DomesticCarbonForm({ calculator }: Props) {
  const { t, tObj } = useI18n();
  const country = COUNTRIES[calculator.countryCode];
  const formFields = calculator.getFormFields();
  const defaultParams = calculator.getDefaultParams();

  const [annualEmissions, setAnnualEmissions] = useState<number>(100000);
  const [industryType, setIndustryType] = useState<string>('steel');
  const [countrySpecific, setCountrySpecific] = useState<Record<string, any>>(defaultParams);
  const [result, setResult] = useState<DomesticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    if (annualEmissions < 0 || isNaN(annualEmissions)) {
      setError(t('排放量不可為負數', 'Emissions cannot be negative'));
      setResult(null);
      return;
    }
    setError(null);
    const input: DomesticInput = {
      annualEmissions,
      industryType,
      year: 2025,
      countrySpecific,
    };
    setResult(calculator.calculate(input));
  }, [annualEmissions, industryType, countrySpecific, calculator, t]);

  const updateField = (key: string, value: any) => {
    setCountrySpecific((prev) => ({ ...prev, [key]: value }));
  };

  const statusLabels = { active: t('已實施', 'Active'), pilot: t('試行中', 'Pilot'), planned: t('規劃中', 'Planned') };

  const renderField = (field: FormFieldConfig) => {
    const value = countrySpecific[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {tObj(field.label)}
              {field.tooltip && <InfoTip zhTW={field.tooltip.zhTW} en={field.tooltip.en} />}
            </Label>
            <Input id={field.key} type="number" value={value} onChange={(e) => updateField(field.key, Number(e.target.value))} min={0} />
          </div>
        );
      case 'select': {
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {tObj(field.label)}
              {field.tooltip && <InfoTip zhTW={field.tooltip.zhTW} en={field.tooltip.en} />}
            </Label>
            <Select value={value} onValueChange={(v) => v && updateField(field.key, v)}>
              <SelectTrigger>
                <SelectValue>
                  {() => {
                    const opt = field.options?.find(o => o.value === value);
                    return opt ? tObj(opt.label) : value;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{tObj(opt.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }
      case 'toggle':
        return (
          <div key={field.key} className="space-y-2">
            <Label className="text-sm font-medium">
              {tObj(field.label)}
              {field.tooltip && <InfoTip zhTW={field.tooltip.zhTW} en={field.tooltip.en} />}
            </Label>
            <div className="flex gap-2">
              <Button type="button" variant={value ? 'default' : 'outline'} size="sm" onClick={() => updateField(field.key, true)} className={value ? 'bg-[#89B56C] hover:bg-[#6E9156]' : ''}>
                {t('是', 'Yes')}
              </Button>
              <Button type="button" variant={!value ? 'default' : 'outline'} size="sm" onClick={() => updateField(field.key, false)} className={!value ? 'bg-gray-700' : ''}>
                {t('否', 'No')}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-t-4" style={{ borderTopColor: '#89B56C' }}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <CardTitle className="text-xl">{tObj(country.name)} {tObj(country.mechanism)}</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto bg-green-50 text-green-700">{statusLabels[country.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            {t('現行費率', 'Current Rate')}：{country.currencySymbol}{country.currentRate.value.toLocaleString()} / tCO₂e
          </p>
          <p className="text-xs text-gray-400">
            {t(
              '碳定價機制要求高排放設施為其溫室氣體排放支付費用，目的是將碳排放的外部成本內部化，激勵企業投資減排技術。',
              'Carbon pricing mechanisms require high-emission facilities to pay for their greenhouse gas emissions, internalizing the external cost of carbon and incentivizing investment in emission reduction technologies.'
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 1: {t('基本資訊', 'Basic Information')}</CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {t(
              '請輸入貴設施的年度溫室氣體排放量（範疇 1 直接排放 + 範疇 2 能源間接排放，單位 tCO₂e）。產業別會影響部分國家的費率優惠或配額分配。',
              'Enter your facility\'s annual greenhouse gas emissions (Scope 1 direct + Scope 2 energy indirect, in tCO₂e). Industry type affects preferential rates or allowance allocation in some countries.'
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emissions" className="text-sm font-medium">
              {t('年排放量 (tCO₂e)', 'Annual Emissions (tCO₂e)')}
              <InfoTip
                zhTW="tCO₂e 代表「公噸二氧化碳當量」，是將所有溫室氣體（CO₂、CH₄、N₂O 等）統一換算為 CO₂ 的標準化排放單位。此處應填入貴設施的範疇 1（直接排放，如燃料燃燒）加上範疇 2（間接排放，如外購電力）年度總排放量。"
                en="tCO₂e stands for 'tonnes of CO₂ equivalent' — a standardized unit converting all greenhouse gases (CO₂, CH₄, N₂O, etc.) into CO₂ terms. Enter your facility's Scope 1 (direct emissions, e.g., fuel combustion) plus Scope 2 (indirect emissions, e.g., purchased electricity) annual total."
              />
            </Label>
            <Input id="emissions" type="number" value={annualEmissions} onChange={(e) => setAnnualEmissions(Number(e.target.value))} min={0} />
            <details className="mt-2">
              <summary className="text-xs text-[#89B56C] cursor-pointer hover:underline">
                {t('不確定排放量？點這裡估算', 'Not sure about your emissions? Click here to estimate')}
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3 text-xs text-gray-600">
                <p>{t('最簡單的估算方式：用年度電費單推算用電的間接排放。', 'Simplest estimate: use your annual electricity bill for indirect emissions.')}</p>
                <div className="space-y-2">
                  <Label className="text-xs">{t('年用電量（度/kWh）', 'Annual electricity (kWh)')}</Label>
                  <Input type="number" placeholder={t('例如：5,000,000', 'e.g. 5,000,000')}
                    onChange={(e) => {
                      const kwh = Number(e.target.value);
                      if (kwh > 0) {
                        const cc = calculator.countryCode;
                        const factor = cc === 'tw' ? 0.495 : cc === 'sg' ? 0.408 : cc === 'kr' ? 0.459 : cc === 'jp' ? 0.457 : cc === 'th' ? 0.519 : 0.750;
                        setAnnualEmissions(Math.round(kwh * factor / 1000));
                      }
                    }}
                  />
                  <p className="text-xs text-gray-400">
                    {t(
                      '此估算僅含用電間接排放（Scope 2），不含燃料燃燒等直接排放（Scope 1）。實際碳盤查結果可能差異 30-100%。如需更準確數據，建議洽詢專業查驗機構。',
                      'Covers Scope 2 only (electricity), not Scope 1 (fuel combustion). Actual inventory results may differ by 30-100%. For accurate figures, consult a professional verification body.'
                    )}
                  </p>
                </div>
              </div>
            </details>
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-medium">
              {t('產業別', 'Industry Type')}
              <InfoTip
                zhTW="產業別決定碳費/碳稅的適用規則：部分國家對鋼鐵、水泥等高碳洩漏風險產業提供費率優惠或免費配額，以避免企業因碳成本過高而將生產外移至低碳價國家（即「碳洩漏」）。"
                en="Industry type determines applicable carbon pricing rules. Some countries offer preferential rates or free allowances for high carbon leakage risk industries (steel, cement, etc.) to prevent companies from relocating production to countries with lower carbon prices — a phenomenon known as 'carbon leakage.'"
              />
            </Label>
            <Select value={industryType} onValueChange={(v) => v && setIndustryType(v)}>
              <SelectTrigger>
                <SelectValue>
                  {() => {
                    const ind = INDUSTRIES.find(i => i.value === industryType);
                    return ind ? t(ind.zhTW, ind.en) : industryType;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.value} value={ind.value}>{t(ind.zhTW, ind.en)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 2: {t(`${tObj(country.name)}特定參數`, 'Country-specific Parameters')}</CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {t(
              '以下參數因國家制度設計而異，例如台灣的費率類型與碳洩漏係數、新加坡的碳權抵扣上限、韓國的免費配額等。這些參數直接影響最終碳成本。',
              'The parameters below vary by country\'s regulatory design — e.g., Taiwan\'s rate tiers and carbon leakage coefficients, Singapore\'s credit offset cap, Korea\'s free allowances. These directly determine your final carbon cost.'
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {formFields.map(renderField)}
        </CardContent>
      </Card>

      <Button onClick={handleCalculate} className="w-full h-12 text-lg bg-[#89B56C] hover:bg-[#6E9156] text-white">
        {t('計算碳費', 'Calculate Carbon Cost')}
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <>
          <ResultPanel result={result} country={country} />
          <CrossDeductionPanel countryCode={calculator.countryCode} />
          <RecommendationsPanel countryCode={calculator.countryCode} domesticResult={result} />
          <ScenarioChart countryCode={calculator.countryCode} annualEmissions={annualEmissions} />
        </>
      )}
    </div>
  );
}
