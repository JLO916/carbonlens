'use client';

import { useI18n } from '@/lib/i18n/context';
import { footprintSummary } from '@/lib/workbench/scope3';
import InfoHint from '@/components/ui/InfoHint';
import type { CompanyProfile } from '@/lib/workbench/profile';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

/** G3 — leads with the WHOLE footprint (Scope 1+2+3) + per-unit PCF, so a near-zero carbon fee
 *  doesn't mislead a business whose real carbon stakes are Scope 3 + customer demands. */
export default function FootprintSummary({ profile }: { profile: CompanyProfile }) {
  const { t } = useI18n();
  const fp = footprintSummary(profile);
  const unit = profile.unitLabel || t('單位', 'unit');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-gray-700">{t('總碳足跡（Scope 1+2+3）', 'Total footprint (Scope 1+2+3)')}</p>
        <p className="text-2xl font-bold text-gray-900">{fmt(fp.total)} <span className="text-sm font-normal text-gray-500">tCO₂e</span></p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[11px] text-gray-500">{t('Scope 1+2（營運）', 'Scope 1+2 (ops)')}</p>
          <p className="font-mono text-sm font-semibold text-gray-900">{fmt(fp.scope12)}</p>
        </div>
        <div className="rounded-lg bg-[#89B56C]/10 p-2">
          <p className="flex items-center justify-center text-[11px] text-[#5d7d44]"><InfoHint termKey="scope3" label={t('Scope 3（價值鏈）', 'Scope 3 (value chain)')} /></p>
          <p className="font-mono text-sm font-semibold text-[#5d7d44]">{fmt(fp.scope3)}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[11px] text-gray-500">{t('Scope 3 占比', 'Scope 3 share')}</p>
          <p className="font-mono text-sm font-semibold text-gray-900">{fp.scope3Pct}%</p>
        </div>
      </div>

      {fp.pcfPerUnit !== undefined && (
        <p className="mt-3 flex flex-wrap items-center rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          {t('每', 'Per ')}{unit}{' '}<InfoHint termKey="pcf" label={t('產品碳足跡（PCF）', 'PCF')} />{' ≈ '}
          <span className="font-mono font-semibold">{fmt(fp.pcfPerUnit)} kgCO₂e</span>
          <span className="text-blue-500">（{fmt(fp.units)} {unit}／{t('年,組織分攤、非完整 LCA', 'yr · org allocation, not full LCA')}）</span>
        </p>
      )}

      {fp.scope3 === 0 && (
        <p className="mt-3 text-[11px] leading-relaxed text-amber-700">
          ⚠️ {t('Scope 3 目前為 0。對代工/組裝業,這通常代表「最大一塊還沒盤」——在 ⑦ 填類別1(採購零件)與類別11(售出產品使用)。', 'Scope 3 is currently 0. For assembly/ODM this usually means “the biggest piece isn’t counted yet” — fill Cat 1 (purchased parts) and Cat 11 (use of sold products) in ⑦.')}
        </p>
      )}
    </div>
  );
}
