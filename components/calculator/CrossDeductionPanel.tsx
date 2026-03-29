'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryCode } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

interface DeductionInfo {
  level: 'high' | 'medium' | 'low' | 'none';
  icon: string;
  reason: { zhTW: string; en: string };
}

const DEDUCTION_CONFIDENCE: Record<CountryCode, DeductionInfo> = {
  sg: {
    level: 'high',
    icon: '🟢',
    reason: { zhTW: '明確的碳稅制度，高度可能被歐盟認定為可抵扣', en: 'Clear carbon tax mechanism, highly likely to be recognized by the EU for deduction' },
  },
  kr: {
    level: 'high',
    icon: '🟢',
    reason: { zhTW: 'K-ETS 配額購買成本符合歐盟對「碳價」的定義，高度可能被認定', en: "K-ETS allowance purchase costs meet the EU's definition of \"carbon price,\" highly likely to be recognized" },
  },
  tw: {
    level: 'medium',
    icon: '🟡',
    reason: { zhTW: '碳費制度可抵扣，但碳費涵蓋的 Scope 2（間接排放）部分如何折算，仍待與歐盟協商', en: 'Carbon fee is deductible, but how to convert Scope 2 (indirect emissions) coverage is still under negotiation with the EU' },
  },
  jp: {
    level: 'medium',
    icon: '🟡',
    reason: { zhTW: '碳稅 ¥289 是否被歐盟視為「碳價」存在定義模糊；GX-ETS 配額購買成本較明確可抵', en: 'Whether the ¥289 carbon tax qualifies as a "carbon price" under EU rules is ambiguous; GX-ETS allowance costs are more clearly deductible' },
  },
  th: {
    level: 'low',
    icon: '🔴',
    reason: { zhTW: '碳稅嵌入消費稅結構，不額外增加終端價格，歐盟是否認定為有效「碳價」存在不確定性', en: "Carbon tax is embedded in excise tax structure with no additional price impact — whether the EU recognizes this as a valid \"carbon price\" is uncertain" },
  },
  vn: {
    level: 'none',
    icon: '⚫',
    reason: { zhTW: '目前沒有正式碳定價機制，歐盟進口商無法申請任何碳價抵扣', en: 'No formal carbon pricing mechanism currently in place — EU importers cannot claim any carbon price deduction' },
  },
};

const LEVEL_LABELS: Record<string, { zhTW: string; en: string }> = {
  high: { zhTW: '高度可能', en: 'Highly Likely' },
  medium: { zhTW: '部分待定', en: 'Partly Pending' },
  low: { zhTW: '不確定', en: 'Uncertain' },
  none: { zhTW: '無法抵扣', en: 'No Deduction' },
};

const LEVEL_COLORS: Record<string, string> = {
  high: 'bg-green-50 border-green-200',
  medium: 'bg-yellow-50 border-yellow-200',
  low: 'bg-red-50 border-red-200',
  none: 'bg-gray-100 border-gray-300',
};

export default function CrossDeductionPanel({ countryCode }: { countryCode: CountryCode }) {
  const { t, tObj } = useI18n();
  const info = DEDUCTION_CONFIDENCE[countryCode];

  return (
    <Card className={`border ${LEVEL_COLORS[info.level]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {info.icon} {t('CBAM 抵扣可能性評估', 'CBAM Deduction Likelihood Assessment')}：{tObj(LEVEL_LABELS[info.level])}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-gray-600">{tObj(info.reason)}</p>
        <p className="text-xs text-gray-400">
          {t(
            '歐盟只認可符合其定義的「碳價」用於 CBAM 抵扣。一般來說，碳稅和排放交易配額購買成本比較明確；嵌入其他稅制或沒有正式碳價的國家，認定上存在不確定性。抵扣的受益者是歐盟進口商，不是出口商。',
            "The EU only recognizes carbon prices meeting its specific definition for CBAM deduction. Generally, carbon taxes and emissions trading allowance costs are more clearly eligible; countries with embedded taxes or no formal carbon pricing face uncertainty. The deduction benefits the EU importer, not the exporter."
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export function AllCountriesDeductionTable() {
  const { t, tObj } = useI18n();
  const codes: CountryCode[] = ['sg', 'kr', 'tw', 'jp', 'th', 'vn'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('各國碳價被歐盟認定為可抵扣的可能性', 'Likelihood of EU Recognition for CBAM Carbon Price Deduction')}</CardTitle>
        <p className="text-xs text-gray-400 mt-1">
          {t(
            '下表依我們的分析判斷排序，不是歐盟官方認定結果。歐盟尚未公布各國碳價 CBAM 抵扣資格的正式清單。🟢 表示該國碳價機制高度可能符合 CBAM 抵扣條件；⚫ 表示無正式碳價，進口商須全額負擔 CBAM 成本。⚠️ 以下為基於現行法規的分析判斷，非歐盟官方認定。',
            "Ranked by our analytical assessment, not official EU determinations. The EU has not published a formal list of eligible carbon prices. 🟢 = highly likely to qualify for CBAM deduction; ⚫ = no formal carbon price, importer bears full CBAM cost. ⚠️ These assessments are analytical judgments based on current regulations, not official EU determinations."
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {codes.map((code) => {
            const info = DEDUCTION_CONFIDENCE[code];
            return (
              <div key={code} className={`flex items-center gap-3 p-3 rounded border ${LEVEL_COLORS[info.level]}`}>
                <span className="text-lg">{info.icon}</span>
                <span className="font-medium text-sm w-16">{code.toUpperCase()}</span>
                <span className="text-sm text-gray-500">{tObj(LEVEL_LABELS[info.level])}</span>
                <span className="text-xs text-gray-400 ml-auto hidden sm:block">{tObj(info.reason)}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
