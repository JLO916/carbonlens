'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CBAMInput, CBAMResult } from '@/lib/types';
import { CBAM_PRODUCT_TYPES, DEFAULT_EMBEDDED_EMISSIONS } from '@/lib/data/cbam-defaults';
import { calculateCBAM } from '@/lib/calculators/cbam';
import { formatCurrency } from '@/lib/data/exchange-rates';
import { useI18n } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency/context';
import InfoTip from '@/components/ui/info-tip';
import DataVsDefaultPanel from './DataVsDefaultPanel';
import RecommendationsPanel from './RecommendationsPanel';
import { DEFAULT_EMBEDDED_EMISSIONS as DEF_EMISSIONS } from '@/lib/data/cbam-defaults';
import { DEFAULT_EMISSION_SURCHARGES } from '@/lib/data/cbam-defaults';

const STEP_LABELS: Record<string, { zhTW: string; en: string }> = {
  cbam_step_import_volume: { zhTW: '進口量', en: 'Import Volume' },
  cbam_step_specific_emissions: { zhTW: '單位內含排放', en: 'Specific Embedded Emissions' },
  cbam_step_gross_emissions: { zhTW: '總內含排放', en: 'Gross Embedded Emissions' },
  cbam_step_phase_out_factor: { zhTW: '免費配額遞減比例', en: 'Free Allocation Phase-out Factor' },
  cbam_step_eu_benchmark: { zhTW: 'EU ETS 基準值', en: 'EU ETS Benchmark' },
  cbam_step_free_allocation: { zhTW: '免費配額', en: 'Free Allocation' },
  cbam_step_net_emissions: { zhTW: 'CBAM 應繳排放量', en: 'Net CBAM Emissions' },
  cbam_step_certificate_price: { zhTW: 'CBAM 憑證價格', en: 'CBAM Certificate Price' },
  cbam_step_gross_cost: { zhTW: 'CBAM 總成本', en: 'Gross CBAM Cost' },
  cbam_step_domestic_deduction: { zhTW: '原產國碳價抵扣', en: 'Domestic Carbon Price Deduction' },
  cbam_step_net_cost: { zhTW: 'CBAM 淨成本', en: 'Net CBAM Cost' },
  cbam_de_minimis: { zhTW: '豁免（進口量 ≤ 50t）', en: 'De minimis Exemption' },
};

export default function CBAMForm() {
  const { t, tObj } = useI18n();
  const { formatConverted, displayCurrency } = useCurrency();
  const [productType, setProductType] = useState('steel_bof');
  const [importVolume, setImportVolume] = useState(5000);
  const [useDefaultEmissions, setUseDefaultEmissions] = useState(true);
  const [specificEmissions, setSpecificEmissions] = useState(2.1);
  const [year, setYear] = useState(2026);
  const [euEtsPrice, setEuEtsPrice] = useState(85);
  const [domesticPrice, setDomesticPrice] = useState(0);
  const [domesticFeeLocal, setDomesticFeeLocal] = useState(0);
  const [euExportShare, setEuExportShare] = useState(30);
  const [result, setResult] = useState<CBAMResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    if (importVolume < 0 || euEtsPrice < 0 || domesticPrice < 0) {
      setError(t('輸入值不可為負數', 'Input values cannot be negative'));
      setResult(null);
      return;
    }
    setError(null);
    const input: CBAMInput = {
      productType,
      importVolume,
      specificEmbeddedEmissions: useDefaultEmissions
        ? DEFAULT_EMBEDDED_EMISSIONS[productType] ?? 1.85
        : specificEmissions,
      useDefaultEmissions,
      year,
      euEtsPrice,
      domesticCarbonPricePaid: domesticPrice,
      originCountry: 'other',
    };
    setResult(calculateCBAM(input));
  }, [productType, importVolume, useDefaultEmissions, specificEmissions, year, euEtsPrice, domesticPrice, t]);

  return (
    <div className="space-y-6">
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇪🇺</span>
            <div>
              <CardTitle className="text-xl">
                {t('EU CBAM 碳邊境調整機制', 'EU CBAM — Carbon Border Adjustment Mechanism')}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto bg-blue-50 text-blue-700">
              {t('2026 正式實施', '2026 Enforcement')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            {t(
              'CBAM 適用於向歐盟出口鋼鐵、鋁、水泥、化肥、氫及電力的企業。進口商須根據產品「內含碳排放」（Embedded Emissions）購買 CBAM 憑證，價格與 EU ETS 碳價掛鉤。',
              'CBAM applies to companies exporting steel, aluminum, cement, fertilizer, hydrogen, and electricity to the EU. Importers must purchase CBAM certificates based on the "embedded emissions" of products, priced in line with the EU ETS carbon price.'
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('產品與排放資訊', 'Product & Emissions')}</CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {t(
              '「內含排放」是指生產每噸產品過程中直接排放的溫室氣體量（tCO₂e/噸）。您可使用歐盟預設值（含加成）或輸入實際排放數據。',
              '"Embedded emissions" refers to the greenhouse gases directly emitted per tonne of product during manufacturing (tCO₂e/t). You may use EU default values (with surcharge) or enter actual emission data.'
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('產品類別', 'Product Type')}
              <InfoTip zhTW="CBAM 目前涵蓋六大類產品：鋼鐵（含扣件等下游製品）、鋁、水泥、化肥、氫及電力。不同產品的預設排放因子和 EU ETS 基準值不同，直接影響 CBAM 成本計算。" en="CBAM currently covers six product categories: steel (including downstream products like fasteners), aluminum, cement, fertilizer, hydrogen, and electricity. Each product has different default emission factors and EU ETS benchmarks, directly affecting CBAM cost calculation." />
            </Label>
            <Select value={productType} onValueChange={(v) => v && setProductType(v)}>
              <SelectTrigger>
                <SelectValue>{() => tObj(CBAM_PRODUCT_TYPES.find(p => p.value === productType)?.label ?? { zhTW: productType, en: productType })}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CBAM_PRODUCT_TYPES.map((pt) => (
                  <SelectItem key={pt.value} value={pt.value}>{tObj(pt.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('進口量（噸）', 'Import Volume (tonnes)')}
              <InfoTip zhTW="年度出口至歐盟的產品總噸數。年進口量 ≤ 50 噸（氫和電力除外）可適用 de minimis 豁免，免除 CBAM 義務。" en="Total product tonnes exported to the EU per year. Annual imports ≤ 50 tonnes (except hydrogen and electricity) qualify for de minimis exemption, waiving CBAM obligations." />
            </Label>
            <Input type="number" value={importVolume} onChange={(e) => setImportVolume(Number(e.target.value))} min={0} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('排放數據來源', 'Emissions Data Source')}
              <InfoTip zhTW="歐盟要求進口商提供產品的實際排放數據。若無實際數據，可使用歐盟預設值，但 2026 年起預設值會加成 10-30% 作為懲罰性溢價，以激勵企業建立碳排放監測體系。" en="The EU requires importers to provide actual product emission data. If unavailable, EU default values can be used, but from 2026 a 10-30% surcharge is applied as a penalty premium, incentivizing companies to establish carbon emission monitoring systems." />
            </Label>
            <div className="flex gap-2">
              <Button type="button" variant={useDefaultEmissions ? 'default' : 'outline'} size="sm" onClick={() => setUseDefaultEmissions(true)} className={useDefaultEmissions ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                {t('使用預設值', 'Default Values')}
              </Button>
              <Button type="button" variant={!useDefaultEmissions ? 'default' : 'outline'} size="sm" onClick={() => setUseDefaultEmissions(false)} className={!useDefaultEmissions ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                {t('實際數據', 'Actual Data')}
              </Button>
            </div>
          </div>

          {!useDefaultEmissions && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('單位內含排放（tCO₂e/噸產品）', 'Specific Embedded Emissions (tCO₂e/t)')}</Label>
              <Input type="number" value={specificEmissions} onChange={(e) => setSpecificEmissions(Number(e.target.value))} step={0.1} min={0} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('CBAM 參數', 'CBAM Parameters')}</CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            {t(
              '計算年度決定免費配額遞減比例（2026 年 97.5% → 2034 年 0%）。CBAM 憑證購買自 2027 年 2 月開始，涵蓋 2026 年進口的碳排放。2026 年憑證價格按季度平均 EU ETS 拍賣價，2027 年起按週平均價。',
              'The year determines the free allocation phase-out rate (2026: 97.5% → 2034: 0%). CBAM certificate purchases begin February 2027, covering 2026 imports retroactively. 2026 prices use quarterly average EU ETS auction prices; from 2027, weekly averages.'
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('計算年度', 'Year')}
              <InfoTip zhTW="CBAM 免費配額逐年遞減：2026 年仍有 97.5% 免費配額（僅需為 2.5% 排放付費），至 2034 年完全取消免費配額（100% 付費）。年度選擇直接決定您需要為多少比例的排放量購買 CBAM 憑證。" en="CBAM free allowances decrease annually: 2026 still has 97.5% free allocation (only 2.5% of emissions require payment), decreasing to 0% in 2034 (100% payment). The selected year directly determines what proportion of your emissions require CBAM certificate purchases." />
            </Label>
            <Select value={String(year)} onValueChange={(v) => v && setYear(Number(v))}>
              <SelectTrigger><SelectValue>{() => String(year)}</SelectValue></SelectTrigger>
              <SelectContent>
                {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('EU ETS 價格（€/tCO₂e）', 'EU ETS Price (€/tCO₂e)')}
              <InfoTip zhTW="EU ETS（歐盟排放交易體系）是全球最大碳市場。CBAM 憑證價格以 EU ETS 每週平均拍賣價為基準。目前碳價約 €60-100/tCO₂e 區間波動，長期預測呈上升趨勢。" en="The EU ETS (Emissions Trading System) is the world's largest carbon market. CBAM certificate prices are based on the weekly average EU ETS auction price. Current prices fluctuate around €60-100/tCO₂e, with long-term forecasts trending upward." />
            </Label>
            <Input type="number" value={euEtsPrice} onChange={(e) => setEuEtsPrice(Number(e.target.value))} min={0} />
          </div>

          {/* Three-step guided domestic carbon price deduction */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs font-medium text-gray-700">{t('原產國碳價抵扣計算', 'Domestic Carbon Price Deduction')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t('① 國內碳費/碳稅總額（當地幣）', '① Domestic carbon fee/tax (local currency)')}</Label>
                <Input type="number" value={domesticFeeLocal || ''} placeholder="e.g. 2000000"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setDomesticFeeLocal(v);
                    if (v > 0 && euExportShare > 0) {
                      setDomesticPrice(Math.round(v * (euExportShare / 100) / 34 * 100) / 100);
                    }
                  }} min={0} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('② 出口歐盟佔比（%）', '② EU export share (%)')}</Label>
                <Input type="number" value={euExportShare} placeholder="30"
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setEuExportShare(v);
                    if (domesticFeeLocal > 0 && v > 0) {
                      setDomesticPrice(Math.round(domesticFeeLocal * (v / 100) / 34 * 100) / 100);
                    }
                  }} min={0} max={100} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('③ 可抵扣金額（€）— 自動計算或手動輸入', '③ Deductible amount (€) — auto-calculated or manual')}</Label>
              <Input type="number" value={domesticPrice} onChange={(e) => setDomesticPrice(Number(e.target.value))} min={0} />
              <p className="text-xs text-gray-400">
                {t('公式：國內碳費 × 出口佔比 ÷ 匯率（預設 EUR/TWD=34）', 'Formula: domestic fee × export share ÷ exchange rate (default EUR/TWD=34)')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleCalculate} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white">
        {t('計算 CBAM 成本', 'Calculate CBAM Cost')}
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {result && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg">{t('CBAM 計算結果', 'CBAM Results')}</CardTitle>
            <p className="text-xs text-gray-400 mt-1">
              {t(
                'CBAM 淨成本 = (總內含排放 − 免費配額) × EU ETS 憑證價格 − 原產國碳價抵扣。',
                'Net CBAM cost = (gross embedded emissions − free allocation) × EU ETS certificate price − domestic carbon price deduction.'
              )}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {result.isExempt ? (
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{t('豁免', 'Exempt')}</p>
                <p className="text-sm text-green-600 mt-2">
                  {t('進口量 ≤ 50 噸，符合 de minimis 豁免條件', 'Import volume ≤ 50 tonnes, de minimis exemption applies')}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">{t('歐盟進口商的 CBAM 淨成本', "EU Importer's Net CBAM Cost")}</p>
                  <p className="text-4xl font-bold text-gray-900">€{formatCurrency(result.netCBAMCost)}</p>
                  {displayCurrency !== 'EUR' && (
                    <p className="text-lg text-gray-500">≈ {formatConverted(result.netCBAMCost, 'EUR')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{t('總內含排放', 'Gross Emissions')}</p>
                    <p className="text-lg font-semibold">{formatCurrency(result.grossEmissions, 1)} tCO₂e</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">{t('原產國碳價可抵扣金額', 'Domestic Carbon Price Deductible')}</p>
                    <p className="text-lg font-semibold text-green-600">-€{formatCurrency(result.domesticCreditDeduction)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-3">{t('計算步驟', 'Breakdown')}</h4>
                  <div className="space-y-2">
                    {result.breakdown.map((step, i) => {
                      const label = STEP_LABELS[step.step];
                      return (
                        <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                          <span className="text-gray-600">{label ? tObj(label) : step.step}</span>
                          <span className="font-mono font-medium">
                            {typeof step.value === 'number' && Math.abs(step.value) >= 1
                              ? formatCurrency(step.value, step.unit === '' || step.unit === 'tCO₂e/t' ? 2 : 0)
                              : step.value}
                            {step.unit && <span className="text-gray-400 ml-1">{step.unit}</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
              <p className="text-xs text-amber-800">
                {t(
                  '提醒：CBAM 正式期自 2026 年 1 月起算，憑證購買自 2027 年 2 月開始。進口商須在次年 9 月 30 日前完成申報和繳交憑證。CBAM 的繳費義務由歐盟進口商承擔，對出口商的影響取決於雙方商業條件。各國碳價的 CBAM 抵扣資格以歐盟最終認定為準。',
                  'Note: CBAM definitive phase starts January 2026; certificate purchases begin February 2027. Importers must declare and surrender certificates by 30 September of the following year. CBAM obligations are borne by EU importers. Impact on exporters depends on commercial terms. Deduction eligibility subject to EU determination.'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data vs Default comparison */}
      {result && !result.isExempt && !useDefaultEmissions && specificEmissions > 0 && (
        <DataVsDefaultPanel
          actualEmissions={specificEmissions}
          defaultEmissions={DEF_EMISSIONS[productType] ?? 1.85}
          defaultMarkupPercent={year <= 2026 ? 10 : year <= 2027 ? 20 : 30}
          importVolume={importVolume}
          euEtsPrice={euEtsPrice}
          year={year}
        />
      )}

      {/* Recommendations */}
      {result && !result.isExempt && (
        <RecommendationsPanel
          countryCode="other"
          cbamResult={result}
        />
      )}
    </div>
  );
}
