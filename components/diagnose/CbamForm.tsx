'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { CBAM_PRODUCTS, CBAM_ORIGIN_COUNTRIES } from '@/lib/diagnose/data/cbam';
import type { BilingualText, CbamInput, CbamProductKey, EmissionsSource } from '@/lib/diagnose/types';

const UNKNOWN_CN = '__unknown__';
const shortDesc = (d: string) => (d.length > 56 ? `${d.slice(0, 56)}…` : d);

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
  const [cnCode, setCnCode] = useState<string>(UNKNOWN_CN);
  const [cnOptions, setCnOptions] = useState<{ cnCode: string; description: string }[]>([]);
  const [passThroughPct, setPassThroughPct] = useState(0);

  const productLabel = CBAM_PRODUCTS.find((p) => p.key === product)?.label;
  const countryLabel = CBAM_ORIGIN_COUNTRIES.find((c) => c.value === originCountry)?.label;
  const usingDefault = emissionsSource === 'official_default';

  // Load CN-code options for the chosen (country, product) when on the official-default path.
  useEffect(() => {
    if (!usingDefault) return;
    let alive = true;
    setCnCode(UNKNOWN_CN);
    setCnOptions([]);
    fetch(`/api/cbam-cn?country=${encodeURIComponent(originCountry)}&product=${encodeURIComponent(product)}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.options)) setCnOptions(d.options);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [usingDefault, originCountry, product]);

  const selectedCn = cnOptions.find((o) => o.cnCode === cnCode);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('輸入出口與排放條件', 'Your export & emissions profile')}</CardTitle>
        <p className="mt-1 text-xs text-gray-400">
          {t(
            '用「實際排放數據＋當前 ETS 價」算指示性暴露；或用「官方預設值」依你的 CN 碼回那一筆官方值。',
            'Use “actual emissions + current ETS price” for an indicative range, or “official default” to return the exact official value for your CN code.',
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
              variant={usingDefault ? 'default' : 'outline'}
              onClick={() => setEmissionsSource('official_default')}
              className={usingDefault ? 'bg-[#89B56C] text-white hover:bg-[#6E9156]' : ''}
            >
              {t('官方預設值（依 CN 碼）', 'Official default (by CN code)')}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            {t('實際數據優於官方預設值（後者含加成、通常較高）；官方預設值依你的 CN 碼回傳那一筆官方值。', 'Actual data beats the official default (the latter carries a mark-up and is usually higher); the official default returns the exact value for your CN code.')}
          </p>
        </div>

        {emissionsSource === 'actual' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('單位內含排放（tCO₂e/噸，您的實際數據）', 'Specific embedded emissions (tCO₂e/t, your actual)')}</Label>
            <Input type="number" value={specificEmissions || ''} min={0} step={0.01} placeholder={t('輸入您的實際數據', 'enter your actual value')} onChange={(e) => setSpecificEmissions(Number(e.target.value))} />
          </div>
        )}

        {usingDefault && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('你的 CN 碼', 'Your CN code')}</Label>
            <Select value={cnCode} onValueChange={(v) => v && setCnCode(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {() =>
                    cnCode === UNKNOWN_CN
                      ? t('不確定 / 不在清單（顯示類別範圍）', 'Unsure / not listed (show category range)')
                      : selectedCn
                        ? `${selectedCn.cnCode} · ${shortDesc(selectedCn.description)}`
                        : cnCode
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNKNOWN_CN}>{t('不確定 / 不在清單（顯示類別範圍）', 'Unsure / not listed (show category range)')}</SelectItem>
                {cnOptions.map((o) => (
                  <SelectItem key={o.cnCode} value={o.cnCode}>
                    {o.cnCode} · {shortDesc(o.description)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              {cnOptions.length > 0
                ? t(`此類別有 ${cnOptions.length} 個官方 CN 碼；選你的那筆得精確值，不確定則顯示範圍。`, `${cnOptions.length} official CN codes in this category; pick yours for the exact value, or see the range.`)
                : t('解鎖後將載入此類別的官方 CN 碼清單。', 'CN-code options load for this category once unlocked.')}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('當前 EU ETS 價（€/tCO₂e）', 'Current EU ETS price (€/tCO₂e)')}</Label>
          <Input type="number" value={etsPrice || ''} min={0} placeholder={t('輸入當前 ETS 價', 'enter current ETS price')} onChange={(e) => setEtsPrice(Number(e.target.value))} />
          <p className="text-xs text-gray-400">{t('條件式：暴露＝排放量 × 您輸入的 ETS 價（每日變動，無內建數值）。', 'Conditional: exposure = emissions × your ETS price (changes daily; no built-in value).')}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('預估轉嫁比例（%，選填）', 'Expected pass-through to you (%, optional)')}</Label>
          <Input type="number" value={passThroughPct || ''} min={0} max={100} placeholder={t('例如 50', 'e.g. 50')} onChange={(e) => setPassThroughPct(Number(e.target.value))} />
          <p className="text-xs text-gray-400">{t('進口商的 CBAM 成本你預估會被轉嫁多少回來；用來估「落到出口商」的金額（非預測）。', 'How much of the importer’s CBAM cost you expect passed back — to size the share that lands on you (not a forecast).')}</p>
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
              cnCode: usingDefault && cnCode !== UNKNOWN_CN ? cnCode : undefined,
              passThroughPct: passThroughPct || undefined,
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
