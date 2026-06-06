'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { computeInventory, type ActivityLine } from '@/lib/workbench/inventory';
import { EMISSION_FACTORS, FACTOR_BY_KEY, CITATION_EMISSION_FACTORS, GWP_NOTE } from '@/lib/workbench/emission-factors';
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
                    <SelectContent>{EMISSION_FACTORS.map((x) => <SelectItem key={x.key} value={x.key}>S{x.scope} · {tObj(x.label)}</SelectItem>)}</SelectContent>
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
                  </>
                )}
              </p>
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
