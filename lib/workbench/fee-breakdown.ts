// "Show your work" for the headline carbon-fee number (V6 ②). The taiwanCalculator returns a
// breakdown[] but in i18n message KEYS; the workbench shows only the total. This re-derives the
// steps with BilingualText labels — using the GATED params actually applied (A1) — so a user can
// defend the figure to a CFO/auditor. Pure + testable. Formula: 氣候法§29 + 碳費收費辦法 (O0020139).

import type { CompanyProfile, FacilityLine } from './profile';
import { taiwanPeriodForYear } from './profile';
import { facilityEmissionsTonnes, facilityEmissionsStatus } from './inventory';
import type { BilingualText } from '@/lib/diagnose/types';
import type { DomesticResult } from '@/lib/calculators/domestic/types';

const RATE: Record<string, number> = { general: 300, preferA: 50, preferB: 100 };
const RATE_LABEL: Record<string, BilingualText> = {
  general: { zhTW: '一般 NT$300', en: 'general NT$300' },
  preferA: { zhTW: '優惠A NT$50', en: 'pref-A NT$50' },
  preferB: { zhTW: '優惠B NT$100', en: 'pref-B NT$100' },
};
const CL: Record<string, number> = { period1_2025_2026: 0.2, period2_2027_2028: 0.4, period3_2029_2030: 0.6 };

export interface FeeStep {
  label: BilingualText;
  value: string;
}

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Re-derive the carbon-fee steps for one facility, honouring the A1 gating (no plan → general). */
export function feeBreakdown(facility: FacilityLine, profile: CompanyProfile, result: DomesticResult): { steps: FeeStep[]; gated: boolean; inventoryIncomplete: boolean } {
  const gated = !facility.hasApprovedReductionPlan;
  const inventoryIncomplete = facilityEmissionsStatus(facility).inventoryIncomplete;
  const leakage = gated ? false : facility.highCarbonLeakage;
  const rateType = gated ? 'general' : facility.rateType;
  const k = leakage ? 0 : 25000;
  const cl = leakage ? CL[taiwanPeriodForYear(profile.year)] : 1.0;
  const rate = RATE[rateType] ?? 300;
  const emissions = facilityEmissionsTonnes(facility);
  const afterK = Math.max(0, emissions - k);
  const afterCL = afterK * cl;

  const steps: FeeStep[] = [
    { label: { zhTW: '年排放量（Scope 1+2）', en: 'Annual emissions (Scope 1+2)' }, value: `${fmt(emissions)} tCO₂e${facility.useInventory ? (inventoryIncomplete ? '（盤查未完成,暫用填寫值）' : '（盤查）') : ''}` },
    { label: { zhTW: leakage ? '− 起徵額 K（高碳洩漏=0）' : '− 起徵額 K（2.5 萬噸）', en: leakage ? '− threshold K (high-leakage = 0)' : '− threshold K (25,000 t)' }, value: `${fmt(afterK)} tCO₂e` },
    { label: { zhTW: `× 碳洩漏係數 CL（${cl}）`, en: `× leakage coefficient CL (${cl})` }, value: `${fmt(afterCL)} tCO₂e` },
    ...(facility.carbonCreditOffset > 0
      ? [{ label: { zhTW: '− 碳權扣抵', en: '− carbon credits' }, value: `${fmt(facility.carbonCreditOffset)} tCO₂e` }]
      : []),
    { label: { zhTW: '= 收費排放量', en: '= chargeable emissions' }, value: `${fmt(result.chargeableEmissions)} tCO₂e` },
    { label: { zhTW: '× 費率', en: '× rate' }, value: `NT$${rate}／tCO₂e` },
    { label: { zhTW: '= 應繳碳費／年', en: '= carbon fee / yr' }, value: `NT$${fmt(result.totalCarbonCost)}` },
  ];
  return { steps, gated, inventoryIncomplete };
}

/** Rate label for the applied rate type (general unless an approved plan unlocks 優惠). */
export function appliedRateLabel(facility: FacilityLine): BilingualText {
  const rateType = facility.hasApprovedReductionPlan ? facility.rateType : 'general';
  return RATE_LABEL[rateType] ?? RATE_LABEL.general;
}
