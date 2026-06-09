'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { cbamCrossDeduction, DEDUCTION_CONFIDENCE_LABEL, CBAM_DEDUCTION_NOTE, CITATION_CBAM_DEDUCTION, type DeductionConfidence } from '@/lib/workbench/cbam-deduction';
import CitationTag from '@/components/diagnose/CitationTag';
import InfoHint from '@/components/ui/InfoHint';
import type { CompanyProfile } from '@/lib/workbench/profile';
import type { WorkbenchResult } from '@/lib/workbench/aggregate';

const eur = (n: number) => '€' + Math.round(n).toLocaleString('en-US');
const CONF_COLOR: Record<DeductionConfidence, string> = { high: 'text-[#3a9e4a]', medium: 'text-amber-600', low: 'text-orange-600', none: 'text-gray-400' };

/** D2 — net the origin carbon price paid against the CBAM obligation (Reg 2023/956 §9). */
export default function CbamDeduction({ profile, result }: { profile: CompanyProfile; result: WorkbenchResult }) {
  const { t, tObj } = useI18n();
  const d = cbamCrossDeduction(profile, result);

  if (!d) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3"><CardTitle className="text-base">💶 <InfoHint termKey="crossDeduction" label={t('碳費 × CBAM 交叉抵扣', 'Carbon fee × CBAM deduction')} /></CardTitle></CardHeader>
        <CardContent><p className="text-xs leading-relaxed text-gray-500">{t('填入 ④ 的 EU ETS 價,並有「可定價」的 CBAM 出口品項(實際數據或已解鎖官方值),即可看到原產國已付碳價如何抵扣 CBAM。', 'Set the EU ETS price in ④ and add a priced CBAM line (actual data or an unlocked default) to see how the origin carbon price already paid offsets CBAM.')}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3"><CardTitle className="text-base">💶 <InfoHint termKey="crossDeduction" label={t('碳費 × CBAM 交叉抵扣', 'Carbon fee × CBAM deduction')} /></CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-gray-50 p-2"><p className="text-[11px] text-gray-500">{t('CBAM 義務(毛)', 'CBAM (gross)')}</p><p className="font-mono text-sm font-semibold">{eur(d.totalObligationEUR)}</p></div>
          <div className="rounded-lg bg-[#89B56C]/10 p-2"><p className="text-[11px] text-[#5d7d44]">{t('− 已付碳價抵扣', '− origin price')}</p><p className="font-mono text-sm font-semibold text-[#5d7d44]">−{eur(d.totalDeductibleEUR)}</p></div>
          <div className="rounded-lg bg-blue-50 p-2"><p className="text-[11px] text-blue-600">{t('= 淨 CBAM', '= net CBAM')}</p><p className="font-mono text-sm font-semibold text-blue-800">{eur(d.totalNetEUR)}</p></div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 text-left text-gray-400">
              <th className="py-1.5 pr-2 font-medium">{t('品項', 'Line')}</th>
              <th className="py-1.5 pr-2 font-medium">{t('原產國', 'Origin')}</th>
              <th className="py-1.5 pr-2 text-right font-medium">{t('CBAM 義務', 'CBAM')}</th>
              <th className="py-1.5 pr-2 text-right font-medium">{t('已付碳價/t', 'Paid/t')}</th>
              <th className="py-1.5 pr-2 text-right font-medium">{t('可抵扣', 'Deduct')}</th>
              <th className="py-1.5 pr-2 text-right font-medium">{t('淨 CBAM', 'Net')}</th>
              <th className="py-1.5 font-medium">{t('認定信心', 'Confidence')}</th>
            </tr></thead>
            <tbody>
              {d.lines.map((l, i) => (
                <tr key={i} className="border-b border-gray-50 text-gray-700">
                  <td className="py-1.5 pr-2 font-medium">{l.label}</td>
                  <td className="py-1.5 pr-2">{l.originCountry.toUpperCase()}</td>
                  <td className="py-1.5 pr-2 text-right font-mono">{eur(l.obligationEUR)}</td>
                  <td className="py-1.5 pr-2 text-right font-mono">{eur(l.originPriceEUR)}</td>
                  <td className="py-1.5 pr-2 text-right font-mono text-[#5d7d44]">−{eur(l.deductibleEUR)}</td>
                  <td className="py-1.5 pr-2 text-right font-mono font-semibold">{eur(l.netEUR)}</td>
                  <td className={`py-1.5 ${CONF_COLOR[l.confidence]}`}>{tObj(DEDUCTION_CONFIDENCE_LABEL[l.confidence])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] leading-relaxed text-gray-400">{tObj(CBAM_DEDUCTION_NOTE)}</p>
        <CitationTag citation={CITATION_CBAM_DEDUCTION} />
      </CardContent>
    </Card>
  );
}
