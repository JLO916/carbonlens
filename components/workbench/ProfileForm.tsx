'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { INDUSTRIES } from '@/lib/diagnose/data/industries';
import { CBAM_PRODUCTS, CBAM_ORIGIN_COUNTRIES } from '@/lib/diagnose/data/cbam';
import { COUNTRIES } from '@/lib/data/countries';
import { getAvailableCountries } from '@/lib/calculators/domestic';
import type { CountryCode } from '@/lib/types';
import { ifrsPhaseFromCapital, FRAMEWORK_LOOKUP_HINT } from '@/lib/workbench/classify';
import { feeGated } from '@/lib/workbench/derive';
import { allocatedCbamSEE, allocatedCbamSEEInfo } from '@/lib/workbench/cbam-allocation';
import { facilityEmissionsStatus } from '@/lib/workbench/inventory';
import { TW_FEE_GATING_NOTE } from '@/lib/workbench/data';
import InventoryBuilder from './InventoryBuilder';
import Scope3Builder from './Scope3Builder';
import InfoHint from '@/components/ui/InfoHint';
import { SCORECARD_TEMPLATES, customerFromTemplate, DIMENSION_LABEL, type ScorecardDimension, type CustomerRequirement } from '@/lib/workbench/scorecard';
import type { CompanyProfile, FacilityLine, CbamProductLine, ProductLine } from '@/lib/workbench/profile';
import type { TargetDef, TargetScope } from '@/lib/workbench/target';

// R4 #2 — year fields clamp ON BLUR, never per keystroke: clamping mid-type turned a select-all
// retype of "2050" into 2000050 (each key got clamped to ≥2000 then the next digit appended), and
// the unbounded year then froze the page via a multi-million-point trajectory.
const clampYear = (n: number) => Math.min(2100, Math.max(2000, n));

const SC_DIMS: ScorecardDimension[] = ['scope12', 'scope3', 'target', 'sbti', 'netzero', 'renewable', 'assurance', 'pcf', 'cdp', 'ecovadis', 'spcsa', 'supplierEngagement'];
const CDP_TIERS = ['A', 'A-', 'B', 'B-', 'C', 'C-', 'D'];
const ECOVADIS_TIERS = ['platinum', 'gold', 'silver', 'bronze'];
const SPCSA_TIERS = ['yearbook', 'assessed'];
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
// P2c — facilities can sit in any of the 6 priced countries (engines already exist).
const COUNTRY_OPTIONS: { value: CountryCode; label: BilingualText }[] = getAvailableCountries().map((c) => ({ value: c, label: COUNTRIES[c].name }));

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

  // E1 — extra reduction targets (Scope 3, net-zero…) beyond the primary one set in ①.
  const targets = profile.extraTargets ?? [];
  const setTarget = (id: string, patch: Partial<TargetDef>) => set({ extraTargets: targets.map((tg) => (tg.id === id ? { ...tg, ...patch } : tg)) });
  const addTarget = () => set({ extraTargets: [...targets, { id: crypto.randomUUID(), label: t('近期 Scope 3', 'Near-term Scope 3'), scope: 'scope3', baseYear: profile.baseYear ?? profile.year, targetYear: profile.targetYear ?? profile.year + 4, targetReductionPct: 25 }] });
  const delTarget = (id: string) => set({ extraTargets: targets.filter((tg) => tg.id !== id) });

  // S3 — per-SKU product carbon footprint.
  const products = profile.products ?? [];
  const setProduct = (id: string, patch: Partial<ProductLine>) => set({ products: products.map((pr) => (pr.id === id ? { ...pr, ...patch } : pr)) });
  const addProduct = () => set({ products: [...products, { id: crypto.randomUUID(), name: t(`產品 ${products.length + 1}`, `Product ${products.length + 1}`), annualUnits: 1000 }] });
  const delProduct = (id: string) => set({ products: products.filter((pr) => pr.id !== id) });

  // CS — customer scorecard (each customer's carbon/ESG requirements) + self-declared external ratings.
  const scCustomers = profile.scorecardCustomers ?? [];
  const ratings = profile.selfRatings ?? {};
  const setRatings = (patch: Partial<typeof ratings>) => set({ selfRatings: { ...ratings, ...patch } });
  const addCustomerFromTpl = (key: string) => { const tpl = SCORECARD_TEMPLATES.find((x) => x.key === key); if (tpl) set({ scorecardCustomers: [...scCustomers, customerFromTemplate(tpl, t(`客戶 ${scCustomers.length + 1}`, `Customer ${scCustomers.length + 1}`))] }); };
  const setCustomer = (id: string, patch: Partial<(typeof scCustomers)[number]>) => set({ scorecardCustomers: scCustomers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const delCustomer = (id: string) => set({ scorecardCustomers: scCustomers.filter((c) => c.id !== id) });
  const setReq = (cid: string, rid: string, patch: Partial<CustomerRequirement>) => { const c = scCustomers.find((x) => x.id === cid); if (c) setCustomer(cid, { requirements: c.requirements.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }); };
  const delReq = (cid: string, rid: string) => { const c = scCustomers.find((x) => x.id === cid); if (c) setCustomer(cid, { requirements: c.requirements.filter((r) => r.id !== rid) }); };
  const addReq = (cid: string, dim: ScorecardDimension) => { const c = scCustomers.find((x) => x.id === cid); if (c) setCustomer(cid, { requirements: [...c.requirements, { id: crypto.randomUUID(), dimension: dim, kind: 'gate' }] }); };

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
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('① 公司基本', '① Company basics')}</CardTitle><p className="mt-1 text-xs leading-relaxed text-gray-500">{t('公司基本資料。產業與年度往下驅動所有計算;若要管減量目標,順手填基準年／目標年／減量%(用得到再填,皆選填)。', 'Your basics. Industry and year drive everything below; to manage a target, also fill base year / target year / cut % (optional — fill what you need).')}</p></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5"><Label className="text-sm">{t('公司（選填）', 'Company (optional)')}</Label><Input value={profile.company ?? ''} onChange={(e) => set({ company: e.target.value })} /><p className="text-[10px] text-gray-400">{t('只用於匯出檔抬頭', 'used only on export headers')}</p></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('產業別', 'Industry')}</Label><Picker value={profile.industry} onChange={(v) => set({ industry: v })} options={INDUSTRIES.map((i) => ({ value: i.value, label: i.label }))} /><p className="text-[10px] text-gray-400">{t('決定行業排放源範本與 Scope 3 提示', 'sets the industry source template + Scope 3 hints')}</p></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('分析年度', 'Analysis year')}</Label><Picker value={String(profile.year)} onChange={(v) => set({ year: Number(v) })} options={[2026, 2027, 2028].map((y) => ({ value: String(y), label: { zhTW: String(y), en: String(y) } }))} /><p className="text-[10px] text-gray-400">{t('驅動碳費期別與 CBAM 因子', 'drives the carbon-fee period + CBAM factor')}</p></div>
          <div className="space-y-1.5"><Label className="text-sm"><InfoHint termKey="baseYear" label={t('基準年（選填）', 'Base year (opt)')} /></Label><Input type="number" value={profile.baseYear ?? ''} placeholder={t('如 2024', 'e.g. 2024')} onChange={(e) => set({ baseYear: e.target.value === '' ? undefined : Number(e.target.value) || 0 })} onBlur={(e) => { if (e.target.value !== '') set({ baseYear: clampYear(Number(e.target.value) || 0) }); }} /><p className="text-[10px] text-gray-400">{t('減量目標的比較起點年', 'the reference year targets measure from')}</p></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('基準年排放 tCO₂e', 'Base-yr tCO₂e')}</Label><Input type="number" value={profile.baseYearEmissionsTonnes ?? ''} placeholder={t('空白=用今年', 'blank=use current')} onChange={(e) => set({ baseYearEmissionsTonnes: e.target.value === '' ? undefined : nn(e.target.value) })} /><p className="text-[10px] text-gray-400">{t('基準年的排放量;空白則用今年實算值', 'base-year emissions; blank uses this year’s computed value')}</p></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('目標年', 'Target year')}</Label><Input type="number" value={profile.targetYear ?? ''} placeholder={t('如 2030', 'e.g. 2030')} onChange={(e) => set({ targetYear: e.target.value === '' ? undefined : Number(e.target.value) || 0 })} onBlur={(e) => { if (e.target.value !== '') set({ targetYear: clampYear(Number(e.target.value) || 0) }); }} /><p className="text-[10px] text-gray-400">{t('達標年(SBTi 近期常為 2030)', 'the year to hit it (SBTi near-term ≈ 2030)')}</p></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('目標減量 %', 'Target cut %')}</Label><Input type="number" value={profile.targetReductionPct ?? ''} placeholder={t('如 30', 'e.g. 30')} onChange={(e) => set({ targetReductionPct: e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /><p className="text-[10px] text-gray-400"><InfoHint termKey="sbti" label={t('對齊 SBTi 需 ≈4.2%/年', 'SBTi needs ≈4.2%/yr')} /></p></div>
          <div className="space-y-1.5"><Label className="text-sm">{t('目標範疇', 'Target scope')}</Label><Toggle value={profile.targetScope ?? 'scope12'} onChange={(v) => set({ targetScope: v })} options={[{ value: 'scope12' as TargetScope, label: { zhTW: 'S1+2', en: 'S1+2' } }, { value: 'scope123' as TargetScope, label: { zhTW: 'S1+2+3', en: 'S1+2+3' } }, { value: 'scope3' as TargetScope, label: { zhTW: 'S3', en: 'S3' } }]} /><p className="text-[10px] text-gray-400">{t('基準/目標/實際同範疇比較;多條承諾用 ⑧', 'base/target/actual same scope; multiple → ⑧')}</p></div>
        </CardContent>
      </Card>

      {/* Disclosure */}
      <Card id="wb-disclosure" className="scroll-mt-24">
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('② 揭露（上市櫃）', '② Disclosure (listed)')}</CardTitle><p className="mt-1 text-xs leading-relaxed text-gray-500">{t('你是上市櫃嗎、資本額多大?——決定你哪一年起要編 IFRS 永續／氣候揭露。', 'listed? capital tier? — sets which year you must file IFRS sustainability/climate disclosure.')}</p></CardHeader>
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
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('③ 供應鏈位置', '③ Supply-chain position')}</CardTitle><p className="mt-1 text-xs leading-relaxed text-gray-500">{t('你在供應鏈的哪一端、客戶承諾了什麼?——決定你被要求碳數據的壓力大小。', 'where you sit in the chain + what your customers pledged — sets how hard you’ll be pushed for carbon data.')}</p></CardHeader>
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
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('④ 出口與假設', '④ Export & assumptions')}</CardTitle><p className="mt-1 text-xs leading-relaxed text-gray-500">{t('有沒有出口歐盟、歐盟碳價假設多少?——驅動下面 CBAM 的估算。', 'do you export to the EU, and what EU carbon price do you assume? — drives the CBAM estimate below.')}</p></CardHeader>
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
      <Card id="wb-inventory" className="scroll-mt-24">
        <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">{t('⑤ 廠區（國內碳費／碳稅）', '⑤ Facilities (domestic carbon price)')}</CardTitle><Button size="sm" variant="outline" onClick={addFacility}>＋ {t('新增廠區', 'Add')}</Button></div><p className="mt-1 text-xs leading-relaxed text-gray-500">{t('你各廠一年排多少碳(自己燒的+外購電力)。這是國內碳費／碳稅的基礎,也是 Scope 1+2。', 'each site’s annual emissions (what you burn + purchased electricity). This is the carbon-fee base, and your Scope 1+2.')}</p></CardHeader>
        <CardContent className="space-y-3">
          {profile.facilities.map((f) => (
            <div key={f.id} className="rounded-lg border border-gray-200 p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2 space-y-1"><Label className="text-xs">{t('名稱', 'Name')}</Label><Input value={f.label} onChange={(e) => setFacility(f.id, { label: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('國別', 'Country')}</Label><Picker value={f.countryCode} onChange={(v) => setFacility(f.id, { countryCode: v as CountryCode })} options={COUNTRY_OPTIONS} /></div>
                <div className="flex items-end">{profile.facilities.length > 1 && <Button size="sm" variant="outline" onClick={() => delFacility(f.id)} className="text-gray-400">🗑</Button>}</div>
                {f.countryCode === 'tw' ? (
                  <>
                    <div className="space-y-1"><Label className="text-xs">{t('費率', 'Rate')}</Label><Picker value={f.rateType} onChange={(v) => setFacility(f.id, { rateType: v })} options={RATE_TYPES} /></div>
                    <div className="space-y-1"><Label className="text-xs">{t('高碳洩漏？', 'High leakage?')}</Label><Toggle value={f.highCarbonLeakage} onChange={(v) => setFacility(f.id, { highCarbonLeakage: v })} options={YES_NO} /></div>
                    <div className="space-y-1"><Label className="text-xs">{t('碳權扣抵 t', 'Credit offset t')}</Label><Input type="number" value={f.carbonCreditOffset || ''} onChange={(e) => setFacility(f.id, { carbonCreditOffset: nn(e.target.value) })} /></div>
                    <div className="space-y-1"><Label className="text-xs">{t('已核定自主減量計畫?', 'Approved reduction plan?')}</Label><Toggle value={f.hasApprovedReductionPlan} onChange={(v) => setFacility(f.id, { hasApprovedReductionPlan: v })} options={YES_NO} /></div>
                  </>
                ) : (
                  <div className="col-span-2 flex items-center sm:col-span-4"><p className="text-[11px] leading-relaxed text-gray-500">{tObj(COUNTRIES[f.countryCode as CountryCode].mechanism)}：{t('以該國引擎之預設參數估算(台灣專屬的費率／優惠／碳洩漏不適用海外廠)。', 'estimated with this country’s default engine params (Taiwan-only rate/relief/leakage do not apply abroad).')}</p></div>
                )}
              </div>

              {/* Emissions: build from activity data, or type a total */}
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <Label className="flex items-center text-sm font-medium">{t('年排放量（Scope 1+2）', 'Annual emissions (Scope 1+2)')}<InfoHint termKey="scope2" label="" /></Label>
                  <Toggle
                    value={!!f.useInventory}
                    onChange={(v) => setFacility(f.id, { useInventory: v, activities: v && (!f.activities || f.activities.length === 0) ? [{ id: crypto.randomUUID(), factorKey: 'electricity', amount: 0 }] : f.activities })}
                    options={[{ value: false, label: { zhTW: '直接填總數', en: 'Type total' } }, { value: true, label: { zhTW: '從活動數據建模（盤查）', en: 'Build from activity data' } }]}
                  />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <Label className="text-xs text-gray-500">{t('綠電/PPA/REC 佔比', 'Renewable (PPA/REC) %')}</Label>
                  <Input type="number" className="h-8 w-24 text-xs" placeholder="0" value={f.renewablePct ?? ''} onChange={(e) => setFacility(f.id, { renewablePct: e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
                  <span className="text-[11px] text-gray-400">% · {t('驅動市場基礎 Scope 2 與 RE100', 'drives market-based Scope 2 & RE100')}</span>
                </div>
                {f.useInventory ? (
                  <>
                    <InventoryBuilder activities={f.activities ?? []} countryCode={f.countryCode as CountryCode} renewablePct={f.renewablePct} industry={profile.industry} onChange={(a) => setFacility(f.id, { activities: a })} />
                    {(() => {
                      const st = facilityEmissionsStatus(f);
                      const typed = st.typedTotalTonnes.toLocaleString('en-US');
                      const inv = st.inventoryTotalTonnes.toLocaleString('en-US', { maximumFractionDigits: 2 });
                      const short = st.shortfallTonnes.toLocaleString('en-US', { maximumFractionDigits: 0 });
                      return st.inventoryIncomplete ? (
                        <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">
                          ⚠️ {t(`盤查合計目前為 0 tCO₂e(尚未填活動量)。為避免碳費被誤歸零,目前暫以你原填的 ${typed} t 計算——請填入活動數據完成盤查,或切回「直接填總數」。`, `Inventory total is 0 tCO₂e (no activity data yet). To avoid silently zeroing the fee, it currently falls back to your typed ${typed} t — add activity data to complete the inventory, or switch back to “type total”.`)}
                        </p>
                      ) : st.inventoryBelowTyped ? (
                        <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-800">
                          → {t('本廠盤查合計', 'Facility total')} <span className="font-medium">{inv} tCO₂e</span>。⚠️ {t(`比你原填的 ${typed} t 少 ${short} t（−${st.shortfallPct}%）。常見原因:製程／逸散排放源尚未填入。`, `that is ${short} t (−${st.shortfallPct}%) below your typed ${typed} t. Common cause: process/fugitive sources not yet entered.`)}{st.crossesFeeThreshold && <span className="font-medium"> {t('且已跌破 2.5 萬噸碳費起徵門檻(碳費可能變 NT$0)——請先確認再採用。', 'It now falls below the 25,000 t carbon-fee threshold (fee may drop to NT$0) — verify before relying on it.')}</span>}
                        </p>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-[#5d7d44]">→ {t('本廠盤查合計', 'Facility total')} {inv} tCO₂e</p>
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
      <Card id="wb-cbam" className="scroll-mt-24">
        <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">{t('⑥ CBAM 出口品項', '⑥ CBAM export lines')}</CardTitle><Button size="sm" variant="outline" onClick={addCbam}>＋ {t('新增品項', 'Add')}</Button></div><p className="mt-1 text-xs leading-relaxed text-gray-500">{t('出口歐盟、且在 CBAM 清單上的貨品(鋼／鋁／水泥／肥料／氫／電力)。成品電子、紡織不在清單上。', 'goods you export to the EU that are ON the CBAM list (steel/al/cement/fertilizer/H₂/power). Finished electronics/textiles are not.')}</p></CardHeader>
        <CardContent className="space-y-3">
          <p className="rounded-lg bg-blue-50 p-2.5 text-[11px] leading-relaxed text-blue-800">ℹ️ {t('只填「在 CBAM 清單上」的貨品(鋼鐵/鋁/水泥/肥料/氫/電力)。成品電子/伺服器不在清單上——其鋼鋁零件的 CBAM 成本是上游供應商轉嫁(屬你的 Scope 3,見下方 ⑦),不是你自己的 CBAM 申報。', 'List only goods ON the CBAM list (steel/aluminium/cement/fertilizer/hydrogen/electricity). Finished electronics/servers are NOT on the list — the CBAM cost of their steel/aluminium parts is passed through by upstream suppliers (your Scope 3, see ⑦ below), not your own CBAM filing.')}</p>
          {profile.cbamProducts.map((c) => (
            <div key={c.id} className="rounded-lg border border-gray-200 p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2 space-y-1"><Label className="text-xs">{t('名稱', 'Name')}</Label><Input value={c.label} onChange={(e) => setCbam(c.id, { label: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('產品', 'Product')}</Label><Picker value={c.product} onChange={(v) => setCbam(c.id, { product: v as CbamProductKey })} options={CBAM_PRODUCTS.map((p) => ({ value: p.key, label: p.label }))} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('來源國', 'Origin')}</Label><Picker value={c.originCountry} onChange={(v) => setCbam(c.id, { originCountry: v })} options={CBAM_ORIGIN_COUNTRIES} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('年出口量 t', 'Volume t')}</Label><Input type="number" value={c.annualVolumeTonnes || ''} onChange={(e) => setCbam(c.id, { annualVolumeTonnes: nn(e.target.value) })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('數據來源', 'Data')}</Label><Toggle value={c.emissionsSource} onChange={(v) => setCbam(c.id, { emissionsSource: v })} options={[{ value: 'actual', label: { zhTW: '實際', en: 'Actual' } }, { value: 'allocated', label: { zhTW: '盤查分攤', en: 'Alloc.' } }, { value: 'official_default', label: { zhTW: '官方', en: 'Default' } }]} /></div>
                {c.emissionsSource === 'actual' ? (
                  <div className="space-y-1"><Label className="text-xs">{t('單位排放 tCO₂e/t', 'SEE tCO₂e/t')}</Label><Input type="number" step={0.01} value={c.actualSpecificEmissions || ''} onChange={(e) => setCbam(c.id, { actualSpecificEmissions: nn(e.target.value) || undefined })} /></div>
                ) : c.emissionsSource === 'allocated' ? (
                  <>
                    <div className="space-y-1"><Label className="text-xs">{t('生產廠別', 'Facility')}</Label><Picker value={c.facilityId ?? ''} onChange={(v) => setCbam(c.id, { facilityId: v })} options={profile.facilities.map((f) => ({ value: f.id, label: { zhTW: f.label, en: f.label } }))} /></div>
                    <div className="space-y-1"><Label className="text-xs">{t('該廠此貨品年總產量 t', 'Annual output t')}</Label><Input type="number" value={c.facilityAnnualOutputTonnes ?? ''} placeholder={t('分攤分母', 'denominator')} onChange={(e) => setCbam(c.id, { facilityAnnualOutputTonnes: e.target.value === '' ? undefined : nn(e.target.value) })} /></div>
                    <div className="space-y-1"><Label className="text-xs">{t('分攤 SEE tCO₂e/t', 'Alloc. SEE')}</Label>{(() => { const info = allocatedCbamSEEInfo(profile, c); return <div className={`rounded-md border px-3 py-2 text-sm ${info ? 'bg-[#89B56C]/5 font-mono font-semibold text-[#5d7d44]' : 'bg-amber-50 text-[11px] text-amber-700'}`}>{info ? info.see.toFixed(3) : t('需該廠開盤查', 'needs facility inventory')}</div>; })()}</div>
                    {(() => { const info = allocatedCbamSEEInfo(profile, c); return info?.exportVolumeFallback ? <p className="col-span-2 rounded bg-amber-50 px-2 py-1 text-[11px] leading-relaxed text-amber-700 sm:col-span-4">⚠️ {t('未填年總產量:目前以「年出口量」當分攤分母——CBAM 規則(Reg 2023/1773)分母應為該貨品全年總產量,出口僅占產量一部分時 SEE 會被高估。', 'No annual output entered: the EU export volume is used as the denominator — Reg (EU) 2023/1773 allocates over TOTAL annual production, so the SEE is overstated whenever exports are only part of output.')}</p> : null; })()}
                  </>
                ) : (
                  <div className="space-y-1"><Label className="text-xs">{t('CN 碼（選填）', 'CN code (opt)')}</Label><Input value={c.cnCode ?? ''} placeholder={t('如 7208；空白=範圍', 'e.g. 7208; blank=range')} onChange={(e) => setCbam(c.id, { cnCode: e.target.value || undefined })} /></div>
                )}
                {profile.cbamProducts.length > 1 && <div className="flex items-end"><Button size="sm" variant="outline" onClick={() => delCbam(c.id)} className="text-gray-400">🗑</Button></div>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scope 3 (G3) */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">{t('⑦ Scope 3 與產品碳足跡', '⑦ Scope 3 & product footprint')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[11px] leading-relaxed text-gray-500">{t('代工/組裝業的碳足跡常 90%+ 在 Scope 3:類別1(採購零件內含碳)+ 類別11(售出產品使用)。在此起步量化,餵入總足跡與每台 PCF。', 'For assembly/ODM, 90%+ of the footprint is often Scope 3: Cat 1 (purchased-part embodied carbon) + Cat 11 (use of sold products). Quantify it here to feed the total footprint and per-unit PCF.')}</p>
          <Scope3Builder lines={profile.scope3 ?? []} onChange={(l) => set({ scope3: l })} />
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-3">
            <div className="space-y-1"><Label className="text-xs">{t('年售出單位數', 'Annual units sold')}</Label><Input type="number" value={profile.annualUnitsSold || ''} placeholder={t('如 2000', 'e.g. 2000')} onChange={(e) => set({ annualUnitsSold: e.target.value === '' ? undefined : nn(e.target.value) })} /></div>
            <div className="space-y-1"><Label className="text-xs">{t('單位名稱', 'Unit label')}</Label><Input value={profile.unitLabel ?? ''} placeholder={t('如 台', 'e.g. server')} onChange={(e) => set({ unitLabel: e.target.value || undefined })} /></div>
            <div className="flex items-end"><p className="text-[11px] leading-relaxed text-gray-400">{t('用於「每台 PCF＝總足跡÷台數」(組織分攤,非完整 LCA)。', 'For “per-unit PCF = total footprint ÷ units” (org allocation, not full LCA).')}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* ⑧ Extra reduction targets (E1) — a real SBTi commitment is a SET of targets */}
      <Card id="wb-targets" className="scroll-mt-24">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between"><CardTitle className="text-base">{t('⑧ 額外減量目標', '⑧ Extra reduction targets')}</CardTitle><Button size="sm" variant="outline" onClick={addTarget}>＋ {t('新增目標', 'Add target')}</Button></div>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{t('① 是你的主要目標。SBTi 承諾通常還有「近期 Scope 3」與「2050 淨零」——在此加列,各自於所屬範疇追軌(在「全貌」的減量目標管理一起顯示)。', '① is your primary target. An SBTi commitment usually also carries a near-term Scope 3 target and a 2050 net-zero target — add them here; each is tracked on its own boundary (shown together in Target management).')}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {targets.length === 0 && <p className="rounded-lg bg-gray-50 p-2.5 text-[11px] leading-relaxed text-gray-500">{t('尚無額外目標。多數有 SBTi 承諾的製造商會再加一條 Scope 3 目標(占足跡常 80%+)與一條長期淨零目標。', 'No extra targets yet. Most manufacturers with an SBTi commitment add a Scope 3 target (often 80%+ of the footprint) and a long-term net-zero target.')}</p>}
          {targets.map((tg) => (
            <div key={tg.id} className="space-y-2 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <Input className="h-8 flex-1 text-sm" value={tg.label ?? ''} placeholder={t('目標名稱,如 2050 淨零', 'Target name, e.g. 2050 net-zero')} onChange={(e) => setTarget(tg.id, { label: e.target.value })} />
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => delTarget(tg.id)}>✕</Button>
              </div>
              <div className="space-y-1"><Label className="text-xs">{t('範疇', 'Scope')}</Label><Toggle value={tg.scope} onChange={(v) => setTarget(tg.id, { scope: v })} options={[{ value: 'scope12' as TargetScope, label: { zhTW: 'S1+2', en: 'S1+2' } }, { value: 'scope123' as TargetScope, label: { zhTW: 'S1+2+3', en: 'S1+2+3' } }, { value: 'scope3' as TargetScope, label: { zhTW: 'S3', en: 'S3' } }]} /></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="space-y-1"><Label className="text-xs">{t('基準年', 'Base year')}</Label><Input type="number" className="h-8" value={tg.baseYear || ''} onChange={(e) => setTarget(tg.id, { baseYear: Number(e.target.value) || 0 })} onBlur={(e) => { if (e.target.value !== '') setTarget(tg.id, { baseYear: clampYear(Number(e.target.value) || 0) }); }} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('基準排放 t（選填）', 'Base tCO₂e (opt)')}</Label><Input type="number" className="h-8" value={tg.baseEmissionsTonnes ?? ''} placeholder={t('空白=今年', 'blank=current')} onChange={(e) => setTarget(tg.id, { baseEmissionsTonnes: e.target.value === '' ? undefined : nn(e.target.value) })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('目標年', 'Target year')}</Label><Input type="number" className="h-8" value={tg.targetYear || ''} onChange={(e) => setTarget(tg.id, { targetYear: Number(e.target.value) || 0 })} onBlur={(e) => { if (e.target.value !== '') setTarget(tg.id, { targetYear: clampYear(Number(e.target.value) || 0) }); }} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('減量 %', 'Cut %')}</Label><Input type="number" className="h-8" value={tg.targetReductionPct || ''} onChange={(e) => setTarget(tg.id, { targetReductionPct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ⑨ Per-SKU product carbon footprint (S3) — the deliverable brands increasingly ask for */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between"><CardTitle className="text-base">{t('⑨ 產品碳足跡（每料號）', '⑨ Product carbon footprint (per SKU)')}</CardTitle><Button size="sm" variant="outline" onClick={addProduct}>＋ {t('新增產品', 'Add product')}</Button></div>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{t('把組織盤查足跡分攤到各產品,給品牌客戶報價／出貨用的每單位碳數字。篩選級分攤(ISO 14067 精神),非查證 LCA。', 'Allocate the org inventory footprint to each product — a per-unit carbon figure for brand quotes/shipments. Screening allocation (ISO 14067-aligned), not a verified LCA.')}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">{t('系統邊界', 'System boundary')}</Label><Toggle value={profile.pcfBoundary ?? 'total'} onChange={(v) => set({ pcfBoundary: v })} options={[{ value: 'total' as const, label: { zhTW: '含價值鏈', en: 'Incl. chain' } }, { value: 'scope12' as const, label: { zhTW: '營運 S1+2', en: 'Ops S1+2' } }]} /></div>
            <div className="space-y-1"><Label className="text-xs">{t('分攤基礎', 'Allocation basis')}</Label><Toggle value={profile.pcfBasis ?? 'equal'} onChange={(v) => set({ pcfBasis: v })} options={[{ value: 'equal' as const, label: { zhTW: '數量', en: 'Units' } }, { value: 'mass' as const, label: { zhTW: '質量', en: 'Mass' } }, { value: 'revenue' as const, label: { zhTW: '營收', en: 'Revenue' } }]} /></div>
            <div className="space-y-1"><Label className="text-xs">{t('產出涵蓋比例 %（選填）', 'Output coverage % (opt)')}</Label><Input type="number" className="h-8" value={profile.pcfCoveragePct ?? ''} placeholder={t('此清單占全年產出 %', '% of annual output')} onChange={(e) => set({ pcfCoveragePct: e.target.value === '' ? undefined : Math.min(100, Math.max(1, nn(e.target.value))) })} /><p className="text-[10px] text-gray-400">{t('清單僅涵蓋部分產量時必填,否則每單位會被高估', 'fill when the list covers only part of output, or per-unit is overstated')}</p></div>
          </div>
          {products.length === 0 && <p className="rounded-lg bg-gray-50 p-2.5 text-[11px] leading-relaxed text-gray-500">{t('尚無產品。新增後,系統把總足跡依「數量／質量／營收」分攤到各料號,算出每單位 kgCO₂e,並可在「全貌」匯出一頁聲明。', 'No products yet. Add one and the total footprint is split across SKUs by units/mass/revenue → kgCO₂e per unit, with a one-page declaration export in the overview.')}</p>}
          {products.map((pr) => (
            <div key={pr.id} className="grid grid-cols-2 items-end gap-2 rounded-xl border border-gray-200 p-3 sm:grid-cols-12">
              <div className="space-y-1 sm:col-span-5"><Label className="text-xs">{t('產品名稱／料號', 'Product / SKU')}</Label><Input className="h-8 text-sm" value={pr.name} onChange={(e) => setProduct(pr.id, { name: e.target.value })} /></div>
              <div className="space-y-1 sm:col-span-3"><Label className="text-xs">{t('年產量／出貨', 'Annual units')}</Label><Input type="number" className="h-8" value={pr.annualUnits || ''} onChange={(e) => setProduct(pr.id, { annualUnits: nn(e.target.value) })} /></div>
              {(profile.pcfBasis ?? 'equal') !== 'equal' && (
                <div className="space-y-1 sm:col-span-3"><Label className="text-xs">{(profile.pcfBasis === 'revenue') ? t('每單位售價', 'Price/unit') : t('每單位質量 kg', 'Mass/unit kg')}</Label><Input type="number" className="h-8" value={pr.weightPerUnit ?? ''} placeholder={t('每單位', 'per unit')} onChange={(e) => setProduct(pr.id, { weightPerUnit: e.target.value === '' ? undefined : nn(e.target.value) })} /></div>
              )}
              <div className="flex justify-end sm:col-span-1"><Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => delProduct(pr.id)}>✕</Button></div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ⑩ Customer scorecard (CS) — each brand customer's carbon/ESG requirements ("No ESG, No Order") */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('⑩ 客戶記分卡', '⑩ Customer scorecard')}</CardTitle>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{t('登記每個品牌客戶的碳/ESG 門檻,工具用你算好的數據逐客戶標達標/缺口、排接單風險。範本對映公開框架(CDP/EcoVadis/SBTi/RE100),為示意起點請依實際要求調整。', "Log each brand customer's carbon/ESG bar; the tool flags met/gaps per customer and ranks order risk. Templates map to public frameworks (CDP/EcoVadis/SBTi/RE100) — illustrative, edit to your real terms.")}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* self-declared external ratings the tool can't compute */}
          <div className="rounded-lg bg-gray-50 p-2.5">
            <p className="text-[11px] font-medium text-gray-600">{t('你目前的外部評級(自評,工具無法代算)', 'Your current external ratings (self-declared)')}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="space-y-1"><Label className="text-[11px]">CDP</Label><Picker value={ratings.cdp ?? 'none'} onChange={(v) => setRatings({ cdp: v === 'none' ? undefined : v })} options={[...CDP_TIERS, 'none'].map((x) => ({ value: x, label: { zhTW: x === 'none' ? '未填' : x, en: x === 'none' ? '—' : x } }))} /></div>
              <div className="space-y-1"><Label className="text-[11px]">EcoVadis</Label><Picker value={ratings.ecovadis ?? 'none'} onChange={(v) => setRatings({ ecovadis: v === 'none' ? undefined : v })} options={[...ECOVADIS_TIERS, 'none'].map((x) => ({ value: x, label: { zhTW: ({ platinum: '白金', gold: '金', silver: '銀', bronze: '銅', none: '未填' } as Record<string, string>)[x], en: x } }))} /></div>
              <div className="space-y-1"><Label className="text-[11px]">S&amp;P CSA</Label><Picker value={ratings.spcsa ?? 'none'} onChange={(v) => setRatings({ spcsa: v === 'none' ? undefined : v })} options={[...SPCSA_TIERS, 'none'].map((x) => ({ value: x, label: { zhTW: ({ yearbook: '年鑑', assessed: '已評', none: '未填' } as Record<string, string>)[x], en: x } }))} /></div>
              <div className="space-y-1"><Label className="text-[11px]">{t('供應商議合 %', 'Supplier eng. %')}</Label><Input type="number" className="h-9" value={ratings.supplierEngagementPct ?? ''} placeholder={t('如 50', 'e.g. 50')} onChange={(e) => setRatings({ supplierEngagementPct: e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></div>
              <div className="space-y-1"><Label className="text-[11px]">{t('SBTi 承諾', 'SBTi status')}</Label><Picker value={ratings.sbti ?? 'none'} onChange={(v) => setRatings({ sbti: v === 'none' ? undefined : (v as 'committed' | 'validated') })} options={['none', 'committed', 'validated'].map((x) => ({ value: x, label: ({ none: { zhTW: '未承諾', en: 'Not committed' }, committed: { zhTW: '已承諾', en: 'Committed' }, validated: { zhTW: '已驗證', en: 'Validated' } } as Record<string, BilingualText>)[x] }))} /></div>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-gray-400">{t('SBTi 為外部承諾/驗證狀態,工具只能算「隱含年減速率」是否達標;客戶問的是你有沒有承諾,故需自評。', 'SBTi is an external commitment/validation; the tool can only check whether your implied annual rate qualifies. Customers ask whether you have committed — so declare it here.')}</p>
          </div>

          {/* add a customer from a template */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">{t('新增客戶(範本):', 'Add customer (template):')}</span>
            {SCORECARD_TEMPLATES.map((tpl) => (
              <Button key={tpl.key} size="sm" variant="outline" onClick={() => addCustomerFromTpl(tpl.key)} title={tObj(tpl.blurb)}>＋ {tObj(tpl.name)}</Button>
            ))}
          </div>

          {scCustomers.length === 0 && <p className="rounded-lg bg-gray-50 p-2.5 text-[11px] leading-relaxed text-gray-500">{t('尚無客戶。從上面選一個範本快速建立,再到「全貌」看逐客戶達標/缺口與接單風險。', 'No customers yet. Pick a template above, then see per-customer met/gaps and order risk in the overview.')}</p>}

          {scCustomers.map((c) => (
            <div key={c.id} className="space-y-2 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <Input className="h-8 flex-1 text-sm" value={c.name} placeholder={t('客戶名稱', 'Customer name')} onChange={(e) => setCustomer(c.id, { name: e.target.value })} />
                <Toggle value={c.importance ?? 'major'} onChange={(v) => setCustomer(c.id, { importance: v })} options={[{ value: 'key' as const, label: { zhTW: '重點', en: 'Key' } }, { value: 'major' as const, label: { zhTW: '一般', en: 'Major' } }, { value: 'minor' as const, label: { zhTW: '次要', en: 'Minor' } }]} />
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => delCustomer(c.id)}>✕</Button>
              </div>
              <div className="space-y-1.5">
                {c.requirements.map((rq) => {
                  const needsPct = ['target', 'renewable', 'supplierEngagement'].includes(rq.dimension);
                  const needsYear = ['target', 'renewable'].includes(rq.dimension);
                  const tierOpts = rq.dimension === 'cdp' ? CDP_TIERS : rq.dimension === 'ecovadis' ? ECOVADIS_TIERS : rq.dimension === 'spcsa' ? SPCSA_TIERS : null;
                  return (
                    <div key={rq.id} className="flex flex-wrap items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 text-xs">
                      <span className="min-w-[7.5rem] font-medium text-gray-700">{tObj(DIMENSION_LABEL[rq.dimension])}</span>
                      <Toggle value={rq.kind} onChange={(v) => setReq(c.id, rq.id, { kind: v })} options={[{ value: 'gate' as const, label: { zhTW: '門票', en: 'Gate' } }, { value: 'scored' as const, label: { zhTW: '計分', en: 'Scored' } }]} />
                      {needsPct && <span className="inline-flex items-center gap-1">≥<Input type="number" className="h-7 w-16" value={rq.minPct ?? ''} onChange={(e) => setReq(c.id, rq.id, { minPct: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0) })} />%</span>}
                      {needsYear && <span className="inline-flex items-center gap-1">by<Input type="number" className="h-7 w-20" value={rq.byYear ?? ''} placeholder="2030" onChange={(e) => setReq(c.id, rq.id, { byYear: e.target.value === '' ? undefined : Number(e.target.value) || 0 })} onBlur={(e) => { if (e.target.value !== '') setReq(c.id, rq.id, { byYear: clampYear(Number(e.target.value) || 0) }); }} /></span>}
                      {tierOpts && <div className="w-28"><Picker value={rq.tier ?? tierOpts[0]} onChange={(v) => setReq(c.id, rq.id, { tier: v })} options={tierOpts.map((x) => ({ value: x, label: { zhTW: '≥ ' + x, en: '≥ ' + x } }))} /></div>}
                      {rq.kind === 'scored' && <span className="inline-flex items-center gap-1">{t('分', 'pts')}<Input type="number" className="h-7 w-14" value={rq.points ?? ''} placeholder="1" onChange={(e) => setReq(c.id, rq.id, { points: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0) })} /></span>}
                      <Button size="sm" variant="ghost" className="ml-auto h-7 px-2 text-gray-400 hover:text-red-600" onClick={() => delReq(c.id, rq.id)}>✕</Button>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">＋ {t('加要求', 'Add requirement')}:</span>
                  <div className="w-44"><Picker value={'' as ScorecardDimension | ''} onChange={(v) => v && addReq(c.id, v as ScorecardDimension)} options={[{ value: '' as ScorecardDimension, label: { zhTW: '選維度…', en: 'Pick dimension…' } }, ...SC_DIMS.filter((d) => !c.requirements.some((r) => r.dimension === d)).map((d) => ({ value: d, label: DIMENSION_LABEL[d] }))]} /></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
