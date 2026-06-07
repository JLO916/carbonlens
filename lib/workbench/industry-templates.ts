// S1 — industry emission-source templates. SMEs stall on the blank page: "I don't know what to put."
// Pick an industry → pre-load the typical Scope 1/2 sources (amount 0, the user fills numbers only).
// Every entry maps to a SOURCED factor in the library (overridable); we add nothing fabricated — just
// the starter checklist a practitioner would otherwise build by hand. Pure + testable.

import { FACTOR_BY_KEY } from './emission-factors';
import type { ActivityLine } from './inventory';
import type { BilingualText } from '@/lib/diagnose/types';

export interface TemplateEntry {
  factorKey: string;
  hint?: BilingualText; // why this source is typical for the industry (shown as a nudge)
}

const GENERIC: TemplateEntry[] = [
  { factorKey: 'electricity', hint: { zhTW: '外購電力(Scope 2,幾乎所有廠都有)', en: 'Purchased electricity (Scope 2, almost every site)' } },
  { factorKey: 'natural_gas', hint: { zhTW: '鍋爐／加熱用天然氣', en: 'Boiler/heating natural gas' } },
  { factorKey: 'diesel', hint: { zhTW: '柴油(發電機／堆高機／自有車隊)', en: 'Diesel (generator/forklift/fleet)' } },
  { factorKey: 'refrigerant_r410a', hint: { zhTW: '空調冷媒逸散(填補充量)', en: 'A/C refrigerant top-up (fugitive)' } },
];

/** industry value (INDUSTRIES) → typical emission sources. Falls back to GENERIC for unknown. */
export const INDUSTRY_TEMPLATES: Record<string, TemplateEntry[]> = {
  electronics: [
    { factorKey: 'electricity', hint: { zhTW: '晶圓廠／組裝最大宗(Scope 2)', en: 'Largest source for fab/assembly (Scope 2)' } },
    { factorKey: 'natural_gas' },
    { factorKey: 'nf3', hint: { zhTW: '腔體清潔含氟氣體(常裝洗滌→填 DRE)', en: 'Chamber-clean F-gas (often abated → set DRE)' } },
    { factorKey: 'cf4', hint: { zhTW: '蝕刻含氟氣體', en: 'Etch F-gas' } },
    { factorKey: 'sf6', hint: { zhTW: '蝕刻／絕緣 SF₆', en: 'Etch/insulation SF₆' } },
    { factorKey: 'diesel' },
    { factorKey: 'refrigerant_r410a' },
  ],
  metals: [
    { factorKey: 'electricity' },
    { factorKey: 'natural_gas', hint: { zhTW: '熔煉／熱處理爐', en: 'Melting/heat-treat furnace' } },
    { factorKey: 'coal_bituminous', hint: { zhTW: '若用煤(煙煤)', en: 'If coal-fired' } },
    { factorKey: 'process_other', hint: { zhTW: '製程排放(酸洗／熱處理,自填係數)', en: 'Process (pickling/heat-treat, enter factor)' } },
    { factorKey: 'diesel' },
    { factorKey: 'refrigerant_r410a' },
  ],
  chemicals: [
    { factorKey: 'electricity' },
    { factorKey: 'natural_gas' },
    { factorKey: 'fuel_oil', hint: { zhTW: '重油鍋爐', en: 'Fuel-oil boiler' } },
    { factorKey: 'steam_purchased', hint: { zhTW: '外購蒸汽(自填係數)', en: 'Purchased steam (enter factor)' } },
    { factorKey: 'process_other', hint: { zhTW: '反應製程排放(自填係數)', en: 'Reaction process (enter factor)' } },
    { factorKey: 'refrigerant_r410a' },
  ],
  cement: [
    { factorKey: 'electricity' },
    { factorKey: 'coal_bituminous', hint: { zhTW: '窯爐燃煤', en: 'Kiln coal' } },
    { factorKey: 'process_cement_clinker', hint: { zhTW: '熟料煅燒製程排放(IPCC 0.52,可覆寫)', en: 'Clinker calcination (IPCC 0.52, override)' } },
    { factorKey: 'diesel' },
    { factorKey: 'fuel_oil' },
  ],
  textiles: [
    { factorKey: 'electricity' },
    { factorKey: 'natural_gas', hint: { zhTW: '定型機／鍋爐', en: 'Stenter/boiler' } },
    { factorKey: 'steam_purchased', hint: { zhTW: '染整外購蒸汽(自填係數)', en: 'Dyeing purchased steam (enter factor)' } },
    { factorKey: 'fuel_oil' },
    { factorKey: 'diesel' },
  ],
  machinery: [
    { factorKey: 'electricity' },
    { factorKey: 'natural_gas' },
    { factorKey: 'diesel', hint: { zhTW: '測試／堆高機／車隊', en: 'Test/forklift/fleet' } },
    { factorKey: 'lpg' },
    { factorKey: 'refrigerant_r410a' },
  ],
  food: [
    { factorKey: 'electricity' },
    { factorKey: 'natural_gas', hint: { zhTW: '蒸煮／烘焙', en: 'Cooking/baking' } },
    { factorKey: 'lpg' },
    { factorKey: 'refrigerant_r404a', hint: { zhTW: '冷鏈冷媒逸散(食品大宗,填補充量)', en: 'Cold-chain refrigerant (big for food)' } },
    { factorKey: 'diesel' },
  ],
  retail: [
    { factorKey: 'electricity', hint: { zhTW: '門市／物流中心用電', en: 'Store/DC electricity' } },
    { factorKey: 'refrigerant_r404a', hint: { zhTW: '冷藏櫃冷媒', en: 'Display-case refrigerant' } },
    { factorKey: 'diesel', hint: { zhTW: '配送車隊', en: 'Delivery fleet' } },
    { factorKey: 'natural_gas' },
  ],
  finance: [
    { factorKey: 'electricity', hint: { zhTW: '辦公室／資料中心', en: 'Office/data center' } },
    { factorKey: 'refrigerant_r410a' },
    { factorKey: 'diesel', hint: { zhTW: '備用發電機', en: 'Backup generator' } },
  ],
  services: [
    { factorKey: 'electricity' },
    { factorKey: 'natural_gas' },
    { factorKey: 'refrigerant_r410a' },
    { factorKey: 'diesel' },
  ],
};

/** The typical emission sources for an industry (or a sensible generic starter). */
export function industryTemplate(industry: string | undefined): TemplateEntry[] {
  return (industry && INDUSTRY_TEMPLATES[industry]) || GENERIC;
}

/** Append the industry's template sources that AREN'T already present (by factorKey), amount 0 so the
 *  user just fills numbers. Existing lines are untouched; never removes or overwrites. */
export function applyIndustryTemplate(existing: ActivityLine[], industry: string | undefined): ActivityLine[] {
  const have = new Set(existing.map((l) => l.factorKey));
  const additions: ActivityLine[] = industryTemplate(industry)
    .filter((e) => !have.has(e.factorKey) && FACTOR_BY_KEY[e.factorKey]) // only real, sourced factors
    .map((e) => ({ id: crypto.randomUUID(), factorKey: e.factorKey, amount: 0 }));
  return [...existing, ...additions];
}
