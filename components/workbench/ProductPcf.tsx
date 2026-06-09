'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/context';
import { productFootprints, PCF_BASIS_LABEL, PCF_BOUNDARY_LABEL, PCF_DISCLAIMER } from '@/lib/workbench/pcf';
import InfoHint from '@/components/ui/InfoHint';
import type { CompanyProfile } from '@/lib/workbench/profile';

const fmt = (n: number) => n.toLocaleString('en-US');

/** S3 — per-SKU product carbon footprint table: org footprint allocated across products by the chosen
 *  key, with per-unit kgCO₂e. Screening allocation (ISO 14067-aligned), not a verified LCA. */
export default function ProductPcf({ profile }: { profile: CompanyProfile }) {
  const { t, tObj } = useI18n();
  const res = productFootprints(profile);
  if (!res) return null;

  return (
    <Card className="border-[#89B56C]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">🏷️ <InfoHint termKey="pcf" label={t('產品碳足跡（每料號）', 'Product carbon footprint (per SKU)')} /></CardTitle>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
          {t('邊界', 'Boundary')}: {tObj(PCF_BOUNDARY_LABEL[res.boundary])} · {fmt(res.footprintTonnes)} tCO₂e · {t('分攤', 'Basis')}: {tObj(PCF_BASIS_LABEL[res.basis])}。{t('用上方「⬇ 產品碳足跡聲明」匯出一頁給客戶。', 'Export a one-page declaration via “PCF declaration” above.')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1.5 pr-2 font-medium">{t('產品／料號', 'Product / SKU')}</th>
                <th className="py-1.5 px-2 text-right font-medium">{t('年產量', 'Units')}</th>
                <th className="py-1.5 px-2 text-right font-medium">{t('占比', 'Share')}</th>
                <th className="py-1.5 px-2 text-right font-medium">{t('分攤 tCO₂e', 'Alloc. tCO₂e')}</th>
                <th className="py-1.5 pl-2 text-right font-medium">kgCO₂e/{t('單位', 'unit')}</th>
              </tr>
            </thead>
            <tbody>
              {res.products.map((r) => (
                <tr key={r.product.id} className="border-b border-dashed border-gray-100">
                  <td className="py-1.5 pr-2 text-gray-800">{r.product.name || '—'}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-gray-600">{fmt(r.product.annualUnits)}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-gray-600">{r.sharePct}%</td>
                  <td className="py-1.5 px-2 text-right font-mono text-gray-700">{fmt(r.allocatedTonnes)}</td>
                  <td className="py-1.5 pl-2 text-right font-mono font-semibold text-[#5d7d44]">{r.pcfPerUnit != null ? fmt(r.pcfPerUnit) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {res.basis !== 'equal' && res.products.every((r) => !r.allocationWeight) && (
          <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-700">{t('已選依質量／營收分攤,但各產品的每單位質量／售價尚未填,目前無法分攤。請在 ⑨ 填入。', 'Mass/revenue basis selected but per-unit weight/price is blank — fill it in ⑨ to allocate.')}</p>
        )}
        <p className="text-[11px] leading-relaxed text-gray-400">{tObj(PCF_DISCLAIMER)}</p>
      </CardContent>
    </Card>
  );
}
