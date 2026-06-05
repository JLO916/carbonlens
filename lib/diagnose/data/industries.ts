// Shared industry list across diagnostic modules. Qualitative context only — industry
// carries no sourced numeric weight (data red line). `scope3Profile` tags which SOURCED
// Scope 3 note applies (Brief §6C): finance ≈98%+, manufacturing/retail Cat-1 ≈50%+.

import type { BilingualText } from '@/lib/diagnose/types';

export type Scope3Profile = 'finance' | 'manufacturing_retail' | 'general';

export interface IndustryOption {
  value: string;
  label: BilingualText;
  scope3Profile: Scope3Profile;
}

export const INDUSTRIES: IndustryOption[] = [
  { value: 'electronics', label: { zhTW: '電子／半導體', en: 'Electronics / semiconductors' }, scope3Profile: 'manufacturing_retail' },
  { value: 'metals', label: { zhTW: '鋼鐵／金屬', en: 'Steel / metals' }, scope3Profile: 'manufacturing_retail' },
  { value: 'chemicals', label: { zhTW: '化工／塑膠', en: 'Chemicals / plastics' }, scope3Profile: 'manufacturing_retail' },
  { value: 'cement', label: { zhTW: '水泥／建材', en: 'Cement / building materials' }, scope3Profile: 'manufacturing_retail' },
  { value: 'textiles', label: { zhTW: '紡織', en: 'Textiles' }, scope3Profile: 'manufacturing_retail' },
  { value: 'machinery', label: { zhTW: '機械／設備', en: 'Machinery / equipment' }, scope3Profile: 'manufacturing_retail' },
  { value: 'food', label: { zhTW: '食品／民生', en: 'Food / consumer' }, scope3Profile: 'manufacturing_retail' },
  { value: 'retail', label: { zhTW: '零售／通路', en: 'Retail / distribution' }, scope3Profile: 'manufacturing_retail' },
  { value: 'finance', label: { zhTW: '金融', en: 'Finance' }, scope3Profile: 'finance' },
  { value: 'services', label: { zhTW: '科技服務／其他', en: 'Tech services / other' }, scope3Profile: 'general' },
];

export function industryLabel(value: string): BilingualText | undefined {
  return INDUSTRIES.find((i) => i.value === value)?.label;
}

export function scope3ProfileOf(value: string): Scope3Profile {
  return INDUSTRIES.find((i) => i.value === value)?.scope3Profile ?? 'general';
}
