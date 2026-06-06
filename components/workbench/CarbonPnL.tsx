'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import type { WorkbenchResult } from '@/lib/workbench/aggregate';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

/** The unified "carbon P&L" — domestic fee + CBAM obligation + disclosure + supply-chain, on one row. */
export default function CarbonPnL({ result }: { result: WorkbenchResult }) {
  const { t, tObj } = useI18n();
  const { domestic, cbam, listed, supplyChain } = result;
  const pressure = supplyChain.pressureLevel;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* Domestic carbon fee — cash now */}
      <Card className="border-l-4 border-l-[#89B56C]">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-gray-500">{t('國內碳費（現在）', 'Domestic carbon fee (now)')}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">NT${fmt(domestic.totalFeeTWD)}</p>
          <p className="text-xs text-gray-400">≈ US${fmt(domestic.totalFeeUSD)}／{t('年', 'yr')} · {domestic.facilities.length} {t('廠區', 'sites')}</p>
        </CardContent>
      </Card>

      {/* CBAM obligation — year obligation, ramps */}
      <Card className="border-l-4 border-l-blue-400">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-gray-500">{t(`CBAM 義務（${result.year}）`, `CBAM obligation (${result.year})`)}</p>
          {cbam.totalObligationEUR !== undefined ? (
            <>
              <p className="mt-1 text-2xl font-bold text-gray-900">≈ €{fmt(cbam.totalObligationEUR)}</p>
              <p className="text-xs text-gray-400">
                {cbam.totalGrossEUR !== undefined && t(`2034 全額 ≈ €${fmt(cbam.totalGrossEUR)}`, `full by 2034 ≈ €${fmt(cbam.totalGrossEUR)}`)}
                {cbam.lockedLines > 0 && t(` · ${cbam.lockedLines} 筆待解鎖`, ` · ${cbam.lockedLines} pending`)}
              </p>
            </>
          ) : cbam.lockedLines > 0 ? (
            <>
              <p className="mt-1 text-lg font-bold text-gray-400">🔒 {t('待官方預設值', 'pending defaults')}</p>
              <p className="text-xs text-gray-400">{t(`${cbam.lockedLines} 筆官方預設值路徑待解鎖（或填實際數據/ETS 價）`, `${cbam.lockedLines} line(s) await default unlock (or enter actual data/ETS price)`)}</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-lg font-bold text-gray-400">—</p>
              <p className="text-xs text-gray-400">{t('未出口歐盟或未填 ETS 價', 'no EU export / no ETS price')}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Disclosure */}
      <Card className="border-l-4 border-l-amber-400">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-gray-500">{t('IFRS S1/S2 揭露', 'IFRS S1/S2 disclosure')}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{t(`第 ${listed.ifrs.phase} 階段`, `Phase ${listed.ifrs.phase}`)}</p>
          <p className="text-xs text-gray-400">{tObj(listed.ifrs.fileLabel)}</p>
        </CardContent>
      </Card>

      {/* Supply-chain pressure */}
      <Card className="border-l-4 border-l-rose-400">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-gray-500">{t('供應鏈壓力', 'Supply-chain pressure')}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{pressure === 'high' ? t('高', 'High') : pressure === 'medium' ? t('中', 'Medium') : t('低', 'Low')}</p>
          <p className="text-xs text-gray-400">{t('定性・非金額', 'qualitative · not an amount')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
