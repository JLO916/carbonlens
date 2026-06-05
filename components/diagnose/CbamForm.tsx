'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { CBAM_PRODUCTS, CBAM_ORIGIN_COUNTRIES } from '@/lib/diagnose/data/cbam';
import type { BilingualText, CbamInput, CbamProductKey, EmissionsSource } from '@/lib/diagnose/types';

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

export default function CbamForm({ onSubmit }: { onSubmit: (input: CbamInput) => void }) {
  const { t, tObj } = useI18n();
  const [exportsToEU, setExportsToEU] = useState(true);
  const [product, setProduct] = useState<CbamProductKey>('steel');
  const [originCountry, setOriginCountry] = useState('tw');
  const [volume, setVolume] = useState(5000);
  const [year, setYear] = useState(2026);
  const [emissionsSource, setEmissionsSource] = useState<EmissionsSource>('actual');
  const [specificEmissions, setSpecificEmissions] = useState(0);
  const [etsPrice, setEtsPrice] = useState(0);

  const productLabel = CBAM_PRODUCTS.find((p) => p.key === product)?.label;
  const countryLabel = CBAM_ORIGIN_COUNTRIES.find((c) => c.value === originCountry)?.label;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('輸入出口與排放條件', 'Your export & emissions profile')}</CardTitle>
        <p className="mt-1 text-xs text-gray-400">
          {t(
            '用「實際排放數據＋當前 ETS 價」即可算指示性暴露區間；官方預設值路徑目前鎖定（待驗證同步）。',
            'Use “actual emissions + current ETS price” for an indicative range; the official-default path is locked (pending verified sync).',
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('是否出口歐盟？', 'Do you export to the EU?')}</Label>
          <ToggleRow<boolean>
            value={exportsToEU}
            onChange={setExportsToEU}
            options={[
              { value: true, label: { zhTW: '是', en: 'Yes' } },
              { value: false, label: { zhTW: '否', en: 'No' } },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('產品類別', 'Product category')}</Label>
          <Select value={product} onValueChange={(v) => v && setProduct(v as CbamProductKey)}>
            <SelectTrigger className="w-full">
              <SelectValue>{() => (productLabel ? tObj(productLabel) : '')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CBAM_PRODUCTS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {tObj(p.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('出口來源國', 'Origin country')}</Label>
            <Select value={originCountry} onValueChange={(v) => v && setOriginCountry(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>{() => (countryLabel ? tObj(countryLabel) : '')}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CBAM_ORIGIN_COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {tObj(c.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('年出口量（噸）', 'Annual volume (t)')}</Label>
            <Input type="number" value={volume || ''} min={0} placeholder="5000" onChange={(e) => setVolume(Number(e.target.value))} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('計算年度', 'Year')}</Label>
          <Select value={String(year)} onValueChange={(v) => v && setYear(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue>{() => String(year)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[2026, 2027, 2028].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('排放數據來源', 'Emissions data source')}</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={emissionsSource === 'actual' ? 'default' : 'outline'}
              onClick={() => setEmissionsSource('actual')}
              className={emissionsSource === 'actual' ? 'bg-[#89B56C] text-white hover:bg-[#6E9156]' : ''}
            >
              {t('實際數據', 'Actual data')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={emissionsSource === 'official_default' ? 'default' : 'outline'}
              onClick={() => setEmissionsSource('official_default')}
              className={emissionsSource === 'official_default' ? 'bg-gray-500 text-white hover:bg-gray-600' : ''}
            >
              🔒 {t('官方預設值（鎖定）', 'Official default (locked)')}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            {t('官方預設值待驗證同步後開放；現可用實際數據計算。', 'Official defaults open after a verified sync; use actual data for now.')}
          </p>
        </div>

        {emissionsSource === 'actual' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('單位內含排放（tCO₂e/噸，您的實際數據）', 'Specific embedded emissions (tCO₂e/t, your actual)')}</Label>
            <Input type="number" value={specificEmissions || ''} min={0} step={0.01} placeholder={t('輸入您的實際數據', 'enter your actual value')} onChange={(e) => setSpecificEmissions(Number(e.target.value))} />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('當前 EU ETS 價（€/tCO₂e）', 'Current EU ETS price (€/tCO₂e)')}</Label>
          <Input type="number" value={etsPrice || ''} min={0} placeholder={t('輸入當前 ETS 價', 'enter current ETS price')} onChange={(e) => setEtsPrice(Number(e.target.value))} />
          <p className="text-xs text-gray-400">{t('條件式：暴露＝排放量 × 您輸入的 ETS 價（每日變動，無內建數值）。', 'Conditional: exposure = emissions × your ETS price (changes daily; no built-in value).')}</p>
        </div>

        <Button
          onClick={() =>
            onSubmit({
              exportsToEU,
              product,
              originCountry,
              annualVolumeTonnes: volume,
              year,
              emissionsSource,
              actualSpecificEmissions: specificEmissions || undefined,
              etsPrice: etsPrice || undefined,
            })
          }
          className="h-11 w-full bg-[#89B56C] text-base text-white hover:bg-[#6E9156]"
        >
          {t('評估我的 CBAM 暴露', 'Assess my CBAM exposure')}
        </Button>
        <p className="text-center text-xs text-gray-400">{t('免費・即時計算・不需註冊', 'Free · instant · no signup')}</p>
      </CardContent>
    </Card>
  );
}
