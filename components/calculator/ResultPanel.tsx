'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DomesticResult } from '@/lib/calculators/domestic/types';
import { CountryConfig } from '@/lib/types';
import { formatCurrency } from '@/lib/data/exchange-rates';
import { useI18n } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency/context';
import InfoTip from '@/components/ui/info-tip';

interface Props {
  result: DomesticResult;
  country: CountryConfig;
}

const STEP_LABELS: Record<string, { zhTW: string; en: string }> = {
  tw_step_annual_emissions: { zhTW: '年排放量', en: 'Annual Emissions' },
  tw_step_k_value: { zhTW: 'K 值（免徵額）', en: 'K-value (Exemption)' },
  tw_step_emissions_after_k: { zhTW: '扣除 K 值後排放量', en: 'Emissions after K-value' },
  tw_step_cl_coefficient: { zhTW: 'CL 係數', en: 'CL Coefficient' },
  tw_step_chargeable_emissions: { zhTW: '收費排放量', en: 'Chargeable Emissions' },
  tw_step_carbon_credit_offset: { zhTW: '碳權扣抵', en: 'Carbon Credit Offset' },
  tw_step_rate: { zhTW: '適用費率', en: 'Applicable Rate' },
  tw_step_total_cost: { zhTW: '碳費總額', en: 'Total Carbon Fee' },
  sg_step_annual_emissions: { zhTW: '年排放量', en: 'Annual Emissions' },
  sg_step_rate: { zhTW: '適用碳稅率', en: 'Carbon Tax Rate' },
  sg_step_carbon_credits: { zhTW: '國際碳權抵扣', en: 'Carbon Credit Offset' },
  sg_step_chargeable: { zhTW: '應稅排放量', en: 'Taxable Emissions' },
  sg_step_total_cost: { zhTW: '碳稅總額', en: 'Total Carbon Tax' },
  sg_step_below_threshold: { zhTW: '低於門檻', en: 'Below Threshold' },
  kr_step_annual_emissions: { zhTW: '年排放量', en: 'Annual Emissions' },
  kr_step_free_allowance: { zhTW: '免費配額', en: 'Free Allowance' },
  kr_step_shortfall: { zhTW: '需購配額量', en: 'Allowance Shortfall' },
  kr_step_kau_price: { zhTW: 'KAU 市場價格', en: 'KAU Market Price' },
  kr_step_total_cost: { zhTW: '碳成本總額', en: 'Total Carbon Cost' },
  jp_step_annual_emissions: { zhTW: '年排放量', en: 'Annual Emissions' },
  jp_step_carbon_tax_rate: { zhTW: '碳稅率', en: 'Carbon Tax Rate' },
  jp_step_carbon_tax_cost: { zhTW: '碳稅成本', en: 'Carbon Tax Cost' },
  jp_step_gx_ets_free: { zhTW: 'GX-ETS 免費配額', en: 'GX-ETS Free Allowance' },
  jp_step_gx_ets_shortfall: { zhTW: 'GX-ETS 需購配額', en: 'GX-ETS Shortfall' },
  jp_step_gx_ets_price: { zhTW: 'GX-ETS 配額價格', en: 'GX-ETS Allowance Price' },
  jp_step_gx_ets_cost: { zhTW: 'GX-ETS 成本', en: 'GX-ETS Cost' },
  jp_step_total_cost: { zhTW: '碳成本總額', en: 'Total Carbon Cost' },
  th_step_emissions: { zhTW: '排放量', en: 'Emissions' },
  th_step_rate: { zhTW: '碳稅率', en: 'Carbon Tax Rate' },
  th_step_total_cost: { zhTW: '碳稅總額', en: 'Total Carbon Tax' },
  vn_step_annual_emissions: { zhTW: '年排放量', en: 'Annual Emissions' },
  vn_step_carbon_price: { zhTW: '碳價（情境）', en: 'Carbon Price (Scenario)' },
  vn_step_total_cost: { zhTW: '碳成本總額', en: 'Total Carbon Cost' },
};

export default function ResultPanel({ result, country }: Props) {
  const { t, tObj } = useI18n();
  const { formatConverted, displayCurrency } = useCurrency();

  return (
    <Card className="border-2 border-[#89B56C]/30">
      <CardHeader className="bg-[#89B56C]/5">
        <CardTitle className="text-lg flex items-center gap-2">
          Step 3: {t('計算結果', 'Results')}
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {tObj(country.name)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <p className="text-xs text-gray-400 text-center">
          {t(
            '以下為依據您輸入參數估算的年度碳成本。此金額為概略估算，供內部評估和初步規劃使用，實際碳費義務以主管機關核定為準。',
            'Below is the estimated annual carbon cost based on your inputs. This is an approximate figure for internal assessment and preliminary planning. Actual obligations are subject to regulatory determination.'
          )}
        </p>
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">{t('碳成本曝險', 'Carbon Cost Exposure')}</p>
          <p className="text-4xl font-bold text-gray-900">
            {country.currencySymbol}{formatCurrency(result.totalCarbonCost)}
          </p>
          <p className="text-lg text-gray-500">
            ≈ {formatConverted(result.totalCarbonCost, country.currency)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">{t('收費排放量', 'Chargeable Emissions')}
              <InfoTip zhTW="收費排放量是扣除免徵額（K 值）並套用碳洩漏係數（CL）後，實際需要繳費的排放量。此數值 × 費率 = 碳費總額。" en="Chargeable emissions are the emissions actually subject to the carbon fee, after deducting the exemption threshold (K-value) and applying the carbon leakage coefficient (CL). This value × rate = total carbon cost." />
            </p>
            <p className="text-lg font-semibold">{formatCurrency(result.chargeableEmissions, 1)} tCO₂e</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">{t('有效費率', 'Effective Rate')}
              <InfoTip zhTW="有效費率 = 碳費總額 ÷ 年排放量。代表每排放一噸 CO₂e 的實際平均成本，考慮了免徵額與 CL 係數折減後的真實負擔。" en="Effective rate = total carbon cost ÷ annual emissions. It represents the actual average cost per tCO₂e emitted, reflecting the true burden after exemption thresholds and CL coefficient discounts." />
            </p>
            <p className="text-lg font-semibold">{country.currencySymbol}{formatCurrency(result.effectiveRate, 1)}/tCO₂e</p>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-semibold mb-1">{t('計算步驟拆解', 'Calculation Breakdown')}</h4>
          <p className="text-xs text-gray-400 mb-3">
            {t(
              '下方展示從年排放量到最終碳成本的逐步推導過程，幫助您理解費用的組成與計算依據。',
              'The step-by-step derivation below shows how your annual emissions translate into the final carbon cost, helping you understand the fee structure and calculation basis.'
            )}
          </p>
          <div className="space-y-2">
            {result.breakdown.map((step, i) => {
              const label = STEP_LABELS[step.step];
              return (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600">
                    {label ? tObj(label) : step.step}
                  </span>
                  <span className="font-mono font-medium">
                    {typeof step.value === 'number' && step.value >= 1
                      ? formatCurrency(step.value, step.unit === '' ? 2 : 0)
                      : step.value}
                    {step.unit && <span className="text-gray-400 ml-1">{step.unit}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-900">
            {t('可供歐盟進口商申請 CBAM 抵扣的金額', "Amount your EU importer may claim for CBAM deduction")}
          </p>
          <p className="text-xs text-blue-600 mb-1">
            {t(
              '如果你的產品出口到歐盟，你在國內繳的碳費可以作為歐盟進口商申請抵扣碳關稅的依據——也就是幫你的客戶降低他的 CBAM 成本。但這筆抵扣的受益者是進口商，是否反映在給你的採購價格上，取決於你們之間的商業談判。',
              "If you export to the EU, the carbon fee you pay domestically can serve as the basis for your EU buyer to claim a CBAM deduction — helping them reduce their carbon border tax. However, the beneficiary of this deduction is the importer. Whether it's reflected in your purchase price depends on your commercial arrangement."
            )}
          </p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            €{formatCurrency(result.deductibleForCBAM)}
            {displayCurrency !== 'EUR' && (
              <span className="text-base font-normal text-blue-600 ml-2">
                ≈ {formatConverted(result.deductibleForCBAM, 'EUR')}
              </span>
            )}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {t('此抵扣可能性為分析判斷，非歐盟官方認定。實際認定以歐盟公告為準。', 'This deduction likelihood is an analytical assessment, not an official EU determination. Actual eligibility is subject to EU ruling.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
