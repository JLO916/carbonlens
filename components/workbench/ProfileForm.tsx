'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { INDUSTRIES } from '@/lib/diagnose/data/industries';
import { CBAM_PRODUCTS, CBAM_ORIGIN_COUNTRIES } from '@/lib/diagnose/data/cbam';
import { ifrsPhaseFromCapital, FRAMEWORK_LOOKUP_HINT } from '@/lib/workbench/classify';
import { feeGated } from '@/lib/workbench/derive';
import { facilityEmissionsStatus } from '@/lib/workbench/inventory';
import { TW_FEE_GATING_NOTE } from '@/lib/workbench/data';
import InventoryBuilder from './InventoryBuilder';
import type { CompanyProfile, FacilityLine, CbamProductLine } from '@/lib/workbench/profile';
import type {
  BilingualText,
  CapitalTier,
  EmployeeBand,
  BusinessModel,
  FrameworkKey,
  ListingType,
  CbamProductKey,
  EmissionsSource,
} from '@/lib/diagnose/types';

const CAPITAL_TIERS: { value: CapitalTier; label: BilingualText }[] = [
  { value: 'over100', label: { zhTW: '逾 100 億', en: 'Over NT$10bn' } },
  { value: 'from50to100', label: { zhTW: '50–100 億', en: 'NT$5–10bn' } },
  { value: 'under50', label: { zhTW: '未滿 50 億', en: 'Under NT$5bn' } },
];
const EMPLOYEE_BANDS: { value: EmployeeBand; label: BilingualText }[] = [
  { value: 'under250', label: { zhTW: '未滿 250 人', en: 'Under 250' } },
  { value: 'from250to999', label: { zhTW: '250–999 人', en: '250–999' } },
  { value: 'over1000', label: { zhTW: '1,000 人以上', en: '1,000+' } },
];
const BUSINESS_MODELS: { value: BusinessModel; label: BilingualText }[] = [
  { value: 'brand', label: { zhTW: '品牌商', en: 'Brand' } },
  { value: 'odm_oem', label: { zhTW: 'ODM／OEM 代工', en: 'ODM/OEM' } },
  { value: 'component', label: { zhTW: '零組件供應商', en: 'Component' } },
];
const FRAMEWORKS: { value: FrameworkKey; label: BilingualText }[] = [
  { value: 're100', label: { zhTW: 'RE100', en: 'RE100' } },
  { value: 'sbti', label: { zhTW: 'SBTi', en: 'SBTi' } },
  { value: 'cdp', label: { zhTW: 'CDP', en: 'CDP' } },
  { value: 'unsure', label: { zhTW: '不確定', en: 'Not sure' } },
];
const RATE_TYPES: { value: FacilityLine['rateType']; label: BilingualText }[] = [
  { value: 'general', label: { zhTW: '一般 300', en: 'General 300' } },
  { value: 'preferA', label: { zhTW: '優惠A 50', en: 'Pref-A 50' } },
  { value: 'preferB', label: { zhTW: '優惠B 100', en: 'Pref-B 100' } },
];

function Toggle<T extends string | boolean>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: BilingualText }[] }) {
  const { tObj } = useI18n();
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button key={String(o.value)} type="button" size="sm" variant={o.value === value ? 'default' : 'outline'} onClick={() => onChange(o.value)} className={o.value === value ? 'bg-[#89B56C] text-white hover:bg-[#6E9156]' : ''}>
          {tObj(o.label)}
        </Button>
      ))}
    </div>
  );
}

function Picker<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: BilingualText }[] }) {
  const { tObj } = useI18n();
  const sel = options.find((o) => o.value === value)?.label;
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as T)}>
      <SelectTrigger className="w-full"><SelectValue>{() => (sel ? tObj(sel) : '')}</SelectValue></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{tObj(o.label)}</SelectItem>)}</SelectContent>
    </Select>
  );
}

const YES_NO: { value: boolean; label: BilingualText }[] = [
  { value: true, label: { zhTW: '是', en: 'Yes' } },
  { value: false, label: { zhTW: '否', en: 'No' } },
];

export default function ProfileForm({ profile, onChange }: { profile: CompanyProfile; onChange: (p: CompanyProfile) => void }) {
  const { t, tObj } = useI18n();
  const set = (patch: Partial<CompanyProfile>) => onChange({ ...profile, ...patch });
  const nn = (v: string) => Math.max(0, Number(v) || 0); // non-negative guard (input defensiveness)

  const setFacility = (id: string, patch: Partial<FacilityLine>) => set({ facilities: profile.facilities.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  const addFacility = () => set({ facilities: [...profile.facilities, { id: crypto.randomUUID(), label: `廠區 ${profile.facilities.length + 1}`, countryCode: 'tw', annualEmissionsTonnes: 25000, highCarbonLeakage: false, rateType: 'general', carbonCreditOffset: 0, hasApprovedReductionPlan: false }] });
  const delFacility = (id: string) => set({ facilities: profile.facilities.filter((f) => f.id !== id) });

  const setCbam = (id: string, patch: Partial<CbamProductLine>) => set({ cbamProducts: profile.cbamProducts.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCbam = () => set({ cbamProducts: [...profile.cbamProducts, { id: crypto.randomUUID(), label: `出口品項 ${profile.cbamProducts.length + 1}`, product: 'steel', originCountry: 'tw', annualVolumeTonnes: 1000, emissionsSource: 'official_default' }] });
  const delCbam = (id: string) => set({ cbamProducts: profile.cbamProducts.filter((c) => c.id !== id) });

  const toggleFramework = (k: FrameworkKey) => {
    const cur = profile.customerFrameworks;
    if (k === 'unsure') return set({ customerFrameworks: cur.includes('unsure') ? cur.filter((x) => x !== 'unsure') : ['unsure'] });
    const woUnsure = cur.filter((x) => x !== 'unsure');
    set({ customerFrameworks: woUnsure.includes(k) ? woUnsure.filter((x) => x !== k) : [...woUnsure, k] });
  };

  const phase = ifrsPhaseFromCapital(profile.capitalTier);

  return (
    <div className="space-y-5">
      {/* Company basics */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('① 公司基本', '① Company basics')}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label className="text-sm">{t('公司（選填）', 'Company (optional)')}</Label><Input value={profile.company ?? ''} onChange={(e) => set({ company: e.target.value })} /></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('產業別', 'Industry')}</Label><Picker value={profile.industry} onChange={(v) => set({ industry: v })} options={INDUSTRIES.map((i) => ({ value: i.value, label: i.label }))} /></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('分析年度', 'Analysis year')}</Label><Picker value={String(profile.year)} onChange={(v) => set({ year: Number(v) })} options={[2026, 2027, 2028].map((y) => ({ value: String(y), label: { zhTW: String(y), en: String(y) } }))} /></div>
        </CardContent>
      </Card>

      {/* Disclosure */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('② 揭露（上市櫃）', '② Disclosure (listed)')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-sm">{t('上市/上櫃', 'Listed/OTC')}</Label><Toggle value={profile.listingType} onChange={(v) => set({ listingType: v })} options={[{ value: 'listed' as ListingType, label: { zhTW: '上市', en: 'Listed' } }, { value: 'otc' as ListingType, label: { zhTW: '上櫃', en: 'OTC' } }]} /></div>
            <div className="space-y-1.5"><Label className="text-sm">{t('實收資本額', 'Paid-in capital')}</Label><Picker value={profile.capitalTier} onChange={(v) => set({ capitalTier: v })} options={CAPITAL_TIERS} /></div>
          </div>
          <p className="rounded-lg bg-blue-50 p-2.5 text-xs text-blue-800">{t(`→ 推得 IFRS 第 ${phase.phase} 階段：`, `→ IFRS Phase ${phase.phase}: `)}{tObj(phase.fileLabel)}</p>
          <div className="space-y-1.5"><Label className="text-sm">{t('已編永續報告書？', 'Have a sustainability report?')}</Label><Toggle value={profile.hasSustainabilityReport} onChange={(v) => set({ hasSustainabilityReport: v })} options={YES_NO} /></div>
        </CardContent>
      </Card>

      {/* Supply-chain */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('③ 供應鏈位置', '③ Supply-chain position')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label className="text-sm">{t('商業模式', 'Business model')}</Label><Toggle value={profile.businessModel} onChange={(v) => set({ businessModel: v })} options={BUSINESS_MODELS} /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-sm">{t('員工規模', 'Employee size')}</Label><Picker value={profile.employeeBand} onChange={(v) => set({ employeeBand: v })} options={EMPLOYEE_BANDS} /></div>
            <div className="space-y-1.5"><Label className="text-sm">{t('供應出口供應鏈？', 'Supply an export chain?')}</Label><Toggle value={profile.exportSupplyChain} onChange={(v) => set({ exportSupplyChain: v })} options={YES_NO} /></div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">{t('主要品牌客戶已承諾的框架（可複選）', 'Customer frameworks (multi)')}</Label>
            <div className="flex flex-wrap gap-2">
              {FRAMEWORKS.map((o) => <Button key={o.value} type="button" size="sm" variant={profile.customerFrameworks.includes(o.value) ? 'default' : 'outline'} onClick={() => toggleFramework(o.value)} className={profile.customerFrameworks.includes(o.value) ? 'bg-[#89B56C] text-white hover:bg-[#6E9156]' : ''}>{tObj(o.label)}</Button>)}
            </div>
            <p className="text-[11px] leading-relaxed text-gray-400">{tObj(FRAMEWORK_LOOKUP_HINT)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Export & assumptions */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('④ 出口與假設', '④ Export & assumptions')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5"><Label className="text-sm">{t('出口歐盟？', 'Export to EU?')}</Label><Toggle value={profile.exportsToEU} onChange={(v) => set({ exportsToEU: v })} options={YES_NO} /></div>
            <div className="space-y-1.5"><Label className="text-sm">{t('EU ETS 價·中（€/t）', 'EU ETS price·central (€/t)')}</Label><Input type="number" value={profile.etsPrice || ''} placeholder={t('如 80', 'e.g. 80')} onChange={(e) => set({ etsPrice: nn(e.target.value) || undefined })} /></div>
            <div className="space-y-1.5"><Label className="text-sm">{t('轉嫁情境（%，選填）', 'Pass-through (%, opt)')}</Label><Input type="number" value={profile.passThroughPct || ''} placeholder={t('如 50', 'e.g. 50')} onChange={(e) => set({ passThroughPct: Math.min(100, nn(e.target.value)) || undefined })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-sm">{t('ETS 低（選填,敏感度）', 'ETS low (opt)')}</Label><Input type="number" value={profile.etsPriceLow || ''} placeholder={t('如 60', 'e.g. 60')} onChange={(e) => set({ etsPriceLow: nn(e.target.value) || undefined })} /></div>
            <div className="space-y-1.5"><Label className="text-sm">{t('ETS 高（選填,敏感度）', 'ETS high (opt)')}</Label><Input type="number" value={profile.etsPriceHigh || ''} placeholder={t('如 120', 'e.g. 120')} onChange={(e) => set({ etsPriceHigh: nn(e.target.value) || undefined })} /></div>
          </div>
          <p className="text-xs text-gray-400">{t('ETS 價是 CBAM 最會動的變數;填低/高即可在 ramp 圖看到「進董事會」的暴露區間。', 'ETS price is CBAM’s biggest swing factor; set low/high to see a board-ready exposure band on the ramp chart.')}</p>
        </CardContent>
      </Card>

      {/* Facilities */}
      <Card>
        <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">{t('⑤ 廠區（碳費，台灣）', '⑤ Facilities (carbon fee, Taiwan)')}</CardTitle><Button size="sm" variant="outline" onClick={addFacility}>＋ {t('新增廠區', 'Add')}</Button></div></CardHeader>
        <CardContent className="space-y-3">
          {profile.facilities.map((f) => (
            <div key={f.id} className="rounded-lg border border-gray-200 p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2 space-y-1"><Label className="text-xs">{t('名稱', 'Name')}</Label><Input value={f.label} onChange={(e) => setFacility(f.id, { label: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('費率', 'Rate')}</Label><Picker value={f.rateType} onChange={(v) => setFacility(f.id, { rateType: v })} options={RATE_TYPES} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('高碳洩漏？', 'High leakage?')}</Label><Toggle value={f.highCarbonLeakage} onChange={(v) => setFacility(f.id, { highCarbonLeakage: v })} options={YES_NO} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('碳權扣抵 t', 'Credit offset t')}</Label><Input type="number" value={f.carbonCreditOffset || ''} onChange={(e) => setFacility(f.id, { carbonCreditOffset: nn(e.target.value) })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('已核定自主減量計畫?', 'Approved reduction plan?')}</Label><Toggle value={f.hasApprovedReductionPlan} onChange={(v) => setFacility(f.id, { hasApprovedReductionPlan: v })} options={YES_NO} /></div>
                {profile.facilities.length > 1 && <div className="flex items-end"><Button size="sm" variant="outline" onClick={() => delFacility(f.id)} className="text-gray-400">🗑</Button></div>}
              </div>

              {/* Emissions: build from activity data, or type a total */}
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-sm font-medium">{t('年排放量（Scope 1+2）', 'Annual emissions (Scope 1+2)')}</Label>
                  <Toggle
                    value={!!f.useInventory}
                    onChange={(v) => setFacility(f.id, { useInventory: v, activities: v && (!f.activities || f.activities.length === 0) ? [{ id: crypto.randomUUID(), factorKey: 'electricity', amount: 0 }] : f.activities })}
                    options={[{ value: false, label: { zhTW: '直接填總數', en: 'Type total' } }, { value: true, label: { zhTW: '從活動數據建模（盤查）', en: 'Build from activity data' } }]}
                  />
                </div>
                {f.useInventory ? (
                  <>
                    <InventoryBuilder activities={f.activities ?? []} onChange={(a) => setFacility(f.id, { activities: a })} />
                    {(() => {
                      const st = facilityEmissionsStatus(f);
                      const typed = st.typedTotalTonnes.toLocaleString('en-US');
                      return st.inventoryIncomplete ? (
                        <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">
                          ⚠️ {t(`盤查合計目前為 0 tCO₂e(尚未填活動量)。為避免碳費被誤歸零,目前暫以你原填的 ${typed} t 計算——請填入活動數據完成盤查,或切回「直接填總數」。`, `Inventory total is 0 tCO₂e (no activity data yet). To avoid silently zeroing the fee, it currently falls back to your typed ${typed} t — add activity data to complete the inventory, or switch back to “type total”.`)}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-[#5d7d44]">→ {t('本廠盤查合計', 'Facility total')} {st.inventoryTotalTonnes.toLocaleString('en-US', { maximumFractionDigits: 2 })} tCO₂e</p>
                      );
                    })()}
                  </>
                ) : (
                  <div className="max-w-xs">
                    <Input type="number" value={f.annualEmissionsTonnes || ''} placeholder={t('如 50000', 'e.g. 50000')} onChange={(e) => setFacility(f.id, { annualEmissionsTonnes: nn(e.target.value) })} />
                    <p className="mt-1 text-[11px] text-gray-400">{t('已有盤查總數可直接填;想用活動數據逐項算出可查證的值,切換到「盤查」。', 'Type your inventory total, or switch to “activity data” to build an auditable number line by line.')}</p>
                  </div>
                )}
              </div>

              {feeGated(f) && <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">⚠️ {tObj(TW_FEE_GATING_NOTE)}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CBAM products */}
      <Card>
        <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">{t('⑥ CBAM 出口品項', '⑥ CBAM export lines')}</CardTitle><Button size="sm" variant="outline" onClick={addCbam}>＋ {t('新增品項', 'Add')}</Button></div></CardHeader>
        <CardContent className="space-y-3">
          {profile.cbamProducts.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-200 p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2 space-y-1"><Label className="text-xs">{t('名稱', 'Name')}</Label><Input value={c.label} onChange={(e) => setCbam(c.id, { label: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('產品', 'Product')}</Label><Picker value={c.product} onChange={(v) => setCbam(c.id, { product: v as CbamProductKey })} options={CBAM_PRODUCTS.map((p) => ({ value: p.key, label: p.label }))} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('來源國', 'Origin')}</Label><Picker value={c.originCountry} onChange={(v) => setCbam(c.id, { originCountry: v })} options={CBAM_ORIGIN_COUNTRIES} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('年出口量 t', 'Volume t')}</Label><Input type="number" value={c.annualVolumeTonnes || ''} onChange={(e) => setCbam(c.id, { annualVolumeTonnes: nn(e.target.value) })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('數據來源', 'Data')}</Label><Toggle value={c.emissionsSource} onChange={(v) => setCbam(c.id, { emissionsSource: v })} options={[{ value: 'actual' as EmissionsSource, label: { zhTW: '實際', en: 'Actual' } }, { value: 'official_default' as EmissionsSource, label: { zhTW: '官方', en: 'Default' } }]} /></div>
                {c.emissionsSource === 'actual' ? (
                  <div className="space-y-1"><Label className="text-xs">{t('單位排放 tCO₂e/t', 'SEE tCO₂e/t')}</Label><Input type="number" step={0.01} value={c.actualSpecificEmissions || ''} onChange={(e) => setCbam(c.id, { actualSpecificEmissions: nn(e.target.value) || undefined })} /></div>
                ) : (
                  <div className="space-y-1"><Label className="text-xs">{t('CN 碼（選填）', 'CN code (opt)')}</Label><Input value={c.cnCode ?? ''} placeholder={t('如 7208；空白=範圍', 'e.g. 7208; blank=range')} onChange={(e) => setCbam(c.id, { cnCode: e.target.value || undefined })} /></div>
                )}
                {profile.cbamProducts.length > 1 && <div className="flex items-end"><Button size="sm" variant="outline" onClick={() => delCbam(c.id)} className="text-gray-400">🗑</Button></div>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
