'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { computeInventory, DATA_QUALITY_LABEL, type ActivityLine, type DataQuality } from '@/lib/workbench/inventory';
import { EMISSION_FACTORS, FACTOR_BY_KEY, FACTOR_CATEGORY_LABEL, CITATION_EMISSION_FACTORS, GWP_NOTE, type FactorCategory } from '@/lib/workbench/emission-factors';

const FACTOR_CATEGORY_ORDER: FactorCategory[] = ['electricity', 'steam', 'fuel', 'fugitive', 'process'];
import CitationTag from '@/components/diagnose/CitationTag';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);

/** Activity-data inventory builder — each line: amount × factor = tCO₂e, with traceable factor +
 *  source (audit lineage) and an editable factor (override to your verified/latest value). */
export default function InventoryBuilder({ activities, onChange }: { activities: ActivityLine[]; onChange: (a: ActivityLine[]) => void }) {
  const { t, tObj } = useI18n();
  const inv = computeInventory(activities);

  const setLine = (id: string, patch: Partial<ActivityLine>) => onChange(activities.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const addLine = () => onChange([...activities, { id: crypto.randomUUID(), factorKey: 'electricity', amount: 0 }]);
  const delLine = (id: string) => onChange(activities.filter((a) => a.id !== id));

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {activities.map((a, i) => {
          const f = FACTOR_BY_KEY[a.factorKey];
          const res = inv.lines[i];
          const factorVal = a.customFactor ?? f?.kgco2ePerUnit ?? 0;
          return (
            <div key={a.id} className="rounded-lg border border-gray-200 p-2.5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <Label className="text-[11px] text-gray-500">{t('排放源', 'Source')}</Label>
                  <Select value={a.factorKey} onValueChange={(v) => v && setLine(a.id, { factorKey: v, customFactor: undefined })}>
                    <SelectTrigger className="h-9 w-full text-sm"><SelectValue>{() => (f ? `${tObj(f.label)}` : '')}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {FACTOR_CATEGORY_ORDER.map((cat) => {
                        const items = EMISSION_FACTORS.filter((x) => x.category === cat);
                        if (!items.length) return null;
                        return (
                          <SelectGroup key={cat}>
                            <SelectLabel>{tObj(FACTOR_CATEGORY_LABEL[cat])}</SelectLabel>
                            {items.map((x) => <SelectItem key={x.key} value={x.key}>S{x.scope} · {tObj(x.label)}</SelectItem>)}
                          </SelectGroup>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-[11px] text-gray-500">{t('活動量', 'Amount')}{f && ` (${tObj(f.unit)})`}</Label>
                  <Input type="number" className="h-9" value={a.amount || ''} onChange={(e) => setLine(a.id, { amount: Math.max(0, Number(e.target.value) || 0) })} />
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-[11px] text-gray-500">{t('係數 kgCO₂e/單位', 'Factor kgCO₂e/unit')}</Label>
                  <Input type="number" step="0.0001" className="h-9" value={factorVal} onChange={(e) => setLine(a.id, { customFactor: Math.max(0, Number(e.target.value) || 0) })} />
                </div>
                <div className="flex items-end justify-between gap-2 sm:col-span-2">
                  <div>
                    <Label className="text-[11px] text-gray-500">tCO₂e</Label>
                    <p className="font-mono text-sm font-semibold text-gray-900">{fmt(res?.tonnes ?? 0)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => delLine(a.id)} className="text-gray-400">🗑</Button>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                {f && (
                  <>
                    {fmt(a.amount || 0)} {tObj(f.unit)} × {factorVal} = {fmt(res?.tonnes ?? 0)} t · {t('Scope', 'Scope')} {res?.scope} · {t('來源', 'Source')} {tObj(f.source)}
                    {res?.isOverride && <span className="text-amber-600"> · {t('已覆寫', 'overridden')}</span>}
                    {f.userSupplied && !(factorVal > 0) && <span className="font-medium text-amber-600"> · {t('請填入你的係數', 'enter your factor')}</span>}
                  </>
                )}
              </p>
              {/* P1b — assurance metadata: data quality + evidence + uncertainty (audit trail) */}
              <div className="mt-1.5 grid grid-cols-2 gap-2 border-t border-dashed border-gray-100 pt-1.5 sm:grid-cols-12">
                <div className="sm:col-span-3">
                  <Label className="text-[10px] text-gray-400">{t('數據品質', 'Data quality')}</Label>
                  <Select value={a.dataQuality ?? ''} onValueChange={(v) => v && setLine(a.id, { dataQuality: v as DataQuality })}>
                    <SelectTrigger className="h-8 w-full text-xs"><SelectValue placeholder={t('選填', '—')}>{() => (a.dataQuality ? tObj(DATA_QUALITY_LABEL[a.dataQuality]) : t('選填', '—'))}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DATA_QUALITY_LABEL) as DataQuality[]).map((q) => <SelectItem key={q} value={q}>{tObj(DATA_QUALITY_LABEL[q])}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-7">
                  <Label className="text-[10px] text-gray-400">{t('佐證來源', 'Evidence')}</Label>
                  <Input className="h-8 text-xs" placeholder={t('如 台電電費單 2025/01–12、加油發票', 'e.g. utility bills 2025, fuel receipts')} value={a.evidenceNote ?? ''} onChange={(e) => setLine(a.id, { evidenceNote: e.target.value || undefined })} />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[10px] text-gray-400">{t('不確定性 ±%', 'Uncert. ±%')}</Label>
                  <Input type="number" className="h-8 text-xs" placeholder={t('選填', 'opt')} value={a.uncertaintyPct ?? ''} onChange={(e) => setLine(a.id, { uncertaintyPct: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0) })} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={addLine}>＋ {t('新增排放源', 'Add source')}</Button>
        <div className="text-right text-xs text-gray-600">
          <span className="mr-3">Scope 1: <span className="font-semibold">{fmt(inv.scope1Tonnes)}</span></span>
          <span className="mr-3">Scope 2: <span className="font-semibold">{fmt(inv.scope2Tonnes)}</span></span>
          <span className="font-semibold text-gray-900">{t('合計', 'Total')} {fmt(inv.totalTonnes)} tCO₂e</span>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-gray-400">{tObj(GWP_NOTE)}</p>
      <CitationTag citation={CITATION_EMISSION_FACTORS} />
    </div>
  );
}
