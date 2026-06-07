'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { computeScope3, SCOPE3_CATEGORIES, SCOPE3_METHOD_LABEL, SCOPE3_NOTE, type Scope3Line, type Scope3Method } from '@/lib/workbench/scope3';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);

/** Scope 3 starter — each line: a category + a method (spend / supplier / use-phase / manual) with
 *  its inputs → tCO₂e + lineage. All factors user-supplied (no fabricated EEIO/use-phase numbers). */
export default function Scope3Builder({ lines, onChange }: { lines: Scope3Line[]; onChange: (l: Scope3Line[]) => void }) {
  const { t, tObj } = useI18n();
  const res = computeScope3(lines);

  const setLine = (id: string, patch: Partial<Scope3Line>) => onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const addLine = () => onChange([...lines, { id: crypto.randomUUID(), category: 1, label: '', method: 'spend' }]);
  const delLine = (id: string) => onChange(lines.filter((l) => l.id !== id));

  const numField = (label: string, value: number | undefined, onValue: (v: number | undefined) => void, ph?: string) => (
    <div className="space-y-0.5">
      <Label className="text-[10px] text-gray-400">{label}</Label>
      <Input type="number" className="h-8 text-xs" placeholder={ph} value={value ?? ''} onChange={(e) => onValue(e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0))} />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={l.id} className="rounded-lg border border-gray-200 p-2.5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <Label className="text-[11px] text-gray-500">{t('類別', 'Category')}</Label>
                <Select value={String(l.category)} onValueChange={(v) => v && setLine(l.id, { category: Number(v) })}>
                  <SelectTrigger className="h-9 w-full text-sm"><SelectValue>{() => tObj(SCOPE3_CATEGORIES.find((c) => c.value === l.category)?.label ?? { zhTW: '', en: '' })}</SelectValue></SelectTrigger>
                  <SelectContent>{SCOPE3_CATEGORIES.map((c) => <SelectItem key={c.value} value={String(c.value)}>{tObj(c.label)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-3">
                <Label className="text-[11px] text-gray-500">{t('項目名稱', 'Item')}</Label>
                <Input className="h-9 text-sm" placeholder={t('如 GPU 採購', 'e.g. GPU buy')} value={l.label} onChange={(e) => setLine(l.id, { label: e.target.value })} />
              </div>
              <div className="sm:col-span-3">
                <Label className="text-[11px] text-gray-500">{t('方法', 'Method')}</Label>
                <Select value={l.method} onValueChange={(v) => v && setLine(l.id, { method: v as Scope3Method })}>
                  <SelectTrigger className="h-9 w-full text-sm"><SelectValue>{() => tObj(SCOPE3_METHOD_LABEL[l.method])}</SelectValue></SelectTrigger>
                  <SelectContent>{(Object.keys(SCOPE3_METHOD_LABEL) as Scope3Method[]).map((m) => <SelectItem key={m} value={m}>{tObj(SCOPE3_METHOD_LABEL[m])}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end justify-between gap-2 sm:col-span-2">
                <div>
                  <Label className="text-[11px] text-gray-500">tCO₂e</Label>
                  <p className="font-mono text-sm font-semibold text-gray-900">{fmt(res.lines[i]?.tonnes ?? 0)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => delLine(l.id)} className="text-gray-400">🗑</Button>
              </div>
            </div>

            {/* method-specific inputs */}
            <div className="mt-1.5 grid grid-cols-2 gap-2 border-t border-dashed border-gray-100 pt-1.5 sm:grid-cols-12">
              {l.method === 'spend' && (
                <>
                  <div className="sm:col-span-4">{numField(t('支出金額', 'Spend'), l.spend, (v) => setLine(l.id, { spend: v }), t('如 50000000', 'e.g. 50000000'))}</div>
                  <div className="sm:col-span-4">{numField(t('係數 kgCO₂e/單位支出', 'Factor kgCO₂e/spend'), l.spendFactor, (v) => setLine(l.id, { spendFactor: v }), t('EEIO·自填', 'EEIO · enter'))}</div>
                </>
              )}
              {l.method === 'use_phase' && (
                <>
                  <div className="sm:col-span-2">{numField(t('台數', 'Units'), l.units, (v) => setLine(l.id, { units: v }), t('如 2000', 'e.g. 2000'))}</div>
                  <div className="sm:col-span-2">{numField(t('功耗 W', 'Watts'), l.watts, (v) => setLine(l.id, { watts: v }), t('如 800', 'e.g. 800'))}</div>
                  <div className="sm:col-span-3">{numField(t('時數/年', 'Hours/yr'), l.hoursPerYear, (v) => setLine(l.id, { hoursPerYear: v }), '8760')}</div>
                  <div className="sm:col-span-2">{numField(t('年限', 'Life yr'), l.lifetimeYears, (v) => setLine(l.id, { lifetimeYears: v }), t('如 4', 'e.g. 4'))}</div>
                  <div className="sm:col-span-3">{numField(t('電網係數 kgCO₂e/kWh', 'Grid kgCO₂e/kWh'), l.gridFactor, (v) => setLine(l.id, { gridFactor: v }), t('如 0.4(使用地)', 'e.g. 0.4'))}</div>
                </>
              )}
              {(l.method === 'supplier' || l.method === 'manual') && (
                <div className="sm:col-span-4">{numField(t('tCO₂e(直接輸入)', 'tCO₂e (direct)'), l.tonnesDirect, (v) => setLine(l.id, { tonnesDirect: v }), t('供應商/實際', 'supplier/actual'))}</div>
              )}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{tObj(res.lines[i]?.lineage ?? { zhTW: '', en: '' })}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={addLine}>＋ {t('新增 Scope 3 項目', 'Add Scope 3 line')}</Button>
        <span className="text-xs font-semibold text-gray-900">{t('Scope 3 合計', 'Scope 3 total')} {fmt(res.totalTonnes)} tCO₂e</span>
      </div>
      <p className="text-[11px] leading-relaxed text-amber-700">{tObj(SCOPE3_NOTE)}</p>
    </div>
  );
}
