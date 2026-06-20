'use client';

import { useI18n } from '@/lib/i18n/context';
import { feeBreakdown } from '@/lib/workbench/fee-breakdown';
import { TW_FEE_GATING_NOTE, TH_TAX_BASE_NOTE, TH_TAX_BASE_UNSPLIT_NOTE, CITATION_TW_CARBON_FEE } from '@/lib/workbench/data';
import { feeGated } from '@/lib/workbench/derive';
import { petroleumFuelTonnes, facilityEmissionsStatus } from '@/lib/workbench/inventory';
import CitationTag from '@/components/diagnose/CitationTag';
import type { WorkbenchResult } from '@/lib/workbench/aggregate';
import type { CompanyProfile } from '@/lib/workbench/profile';

/** "Show your work" on the headline carbon fee — the calculation steps a user can defend (V6 ②). */
export default function CarbonFeeBreakdown({ result, profile }: { result: WorkbenchResult; profile: CompanyProfile }) {
  const { t, tObj } = useI18n();
  const anyGated = profile.facilities.some(feeGated);

  // R4 #6 — facilities whose built inventory is materially below the earlier typed total. Surfaced
  // ABOVE the collapsed panel so a NT$0 headline never goes to a report unchecked.
  const underCounted = profile.facilities
    .map((f) => ({ f, st: facilityEmissionsStatus(f) }))
    .filter((x) => x.st.inventoryBelowTyped);

  return (
    <>
    {underCounted.length > 0 && (
      <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[12px] leading-relaxed text-amber-900">
        <p className="font-semibold">⚠️ {t('碳費可能偏低:盤查合計低於你原填的估計', 'Carbon fee may be understated: inventory total is below your typed estimate')}</p>
        <ul className="mt-1.5 space-y-1">
          {underCounted.map(({ f, st }) => (
            <li key={f.id}>
              <span className="font-medium">{f.label}</span>:{t('盤查', 'inventory')} {Math.round(st.inventoryTotalTonnes).toLocaleString('en-US')} t {t('比原填', 'vs typed')} {Math.round(st.typedTotalTonnes).toLocaleString('en-US')} t {t('少', 'lower by')} {Math.round(st.shortfallTonnes).toLocaleString('en-US')} t（−{st.shortfallPct}%）{st.crossesFeeThreshold && <span className="font-semibold text-amber-950">{t('・已跌破 2.5 萬噸碳費門檻(碳費 → NT$0)', '· now below the 25,000 t fee threshold (fee → NT$0)')}</span>}
            </li>
          ))}
        </ul>
        <p className="mt-1.5">{t('常見原因:製程／逸散排放源尚未填入(如鍛造、熱處理、含氟氣體)。完成這些來源後碳費可能改變——交報告前請先確認。', 'Common cause: process/fugitive sources not yet entered (e.g. forging, heat-treatment, F-gases). The fee may change once they are added — verify before filing.')}</p>
      </div>
    )}
    <details className="rounded-xl border border-gray-200 bg-white p-4">
      <summary className="cursor-pointer list-none text-sm font-medium text-gray-700">
        ▸ {t('碳費計算過程（可給 CFO／查核員）', 'Carbon fee — show your work (for CFO/auditor)')}
      </summary>
      <div className="mt-3 space-y-4">
        {result.domestic.facilities.map(({ facility, result: r }) => {
          const isTW = facility.countryCode === 'tw';
          const { steps, inventoryIncomplete } = feeBreakdown(facility, profile, r);
          return (
            <div key={facility.id} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-700">{facility.label}（{facility.countryCode.toUpperCase()}）</p>
              {inventoryIncomplete && <p className="mb-2 rounded bg-amber-50 px-2 py-1 text-[11px] leading-relaxed text-amber-800">⚠️ {t('此廠已開盤查但合計為 0,以下碳費暫用「直接填寫值」估算;完成盤查後會改用實算值。', 'Inventory started but totals 0 — this fee uses the typed fallback value; it will switch to the computed inventory once completed.')}</p>}
              {isTW ? (
                <table className="w-full text-xs">
                  <tbody>
                    {steps.map((s, i) => (
                      <tr key={i} className={i === steps.length - 1 ? 'border-t border-gray-200 font-semibold text-gray-900' : 'text-gray-600'}>
                        <td className="py-1 pr-3">{tObj(s.label)}</td>
                        <td className="py-1 text-right font-mono">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  <p className="text-xs text-gray-600">
                    {t('該國引擎估算(預設參數):', 'Country engine estimate (default params): ')}
                    <span className="font-mono font-semibold text-gray-900">{r.currency} {Math.round(r.totalCarbonCost).toLocaleString('en-US')}</span>
                    <span className="text-gray-400"> · ≈ US$ {Math.round(r.totalCarbonCostUSD).toLocaleString('en-US')}／yr</span>
                    {facility.countryCode === 'th' && petroleumFuelTonnes(facility) != null && (
                      <span className="text-gray-400"> · {t('稅基（油品燃燒）', 'tax base (oil combustion)')} {r.chargeableEmissions.toLocaleString('en-US')} tCO₂e</span>
                    )}
                  </p>
                  {facility.countryCode === 'th' && (
                    <p className="mt-1.5 rounded bg-amber-50 px-2 py-1 text-[11px] leading-relaxed text-amber-800">
                      {tObj(petroleumFuelTonnes(facility) == null ? TH_TAX_BASE_UNSPLIT_NOTE : TH_TAX_BASE_NOTE)}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
        {anyGated && <p className="rounded-lg bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">⚠️ {tObj(TW_FEE_GATING_NOTE)}</p>}
        <CitationTag citation={CITATION_TW_CARBON_FEE} />
      </div>
    </details>
    </>
  );
}
