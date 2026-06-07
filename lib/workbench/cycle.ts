// C4 — cycle status + obligation calendar. An ESG cycle is annual + recurring; the tool now shows
// WHERE you are (盤查→內審→查證→已查證→已申報→已揭露) and WHEN the recurring deadlines fall.
// RED LINE: every deadline cites its source; dates derive from the profile, not invented.

import type { CompanyProfile } from './profile';
import type { BilingualText } from '@/lib/diagnose/types';

export type CycleStage = NonNullable<CompanyProfile['cycleStage']>;

export const CYCLE_STAGES: { value: CycleStage; label: BilingualText }[] = [
  { value: 'measure', label: { zhTW: '盤查中', en: 'Measuring' } },
  { value: 'review', label: { zhTW: '內審', en: 'Internal review' } },
  { value: 'assure', label: { zhTW: '查證中', en: 'Assurance' } },
  { value: 'assured', label: { zhTW: '已查證', en: 'Assured' } },
  { value: 'filed', label: { zhTW: '已申報', en: 'Filed' } },
  { value: 'disclosed', label: { zhTW: '已揭露', en: 'Disclosed' } },
];

export interface ObligationItem {
  key: string;
  label: BilingualText;
  dueDate: string; // YYYY-MM-DD
  daysUntil: number;
  source: BilingualText;
}

const daysBetween = (fromISO: string, toDate: string): number =>
  Math.ceil((new Date(toDate + 'T00:00:00Z').getTime() - new Date(fromISO).getTime()) / 86_400_000);

/** Derive the recurring annual obligations + countdowns for this profile. `nowISO` injected. */
export function obligationCalendar(profile: CompanyProfile, nowISO: string): ObligationItem[] {
  const Y = profile.year;
  const items: Omit<ObligationItem, 'daysUntil'>[] = [];

  if (profile.facilities.some((f) => f.countryCode === 'tw')) {
    items.push({
      key: 'carbonfee',
      label: { zhTW: `${Y} 年度碳費申報／繳納`, en: `FY${Y} carbon-fee filing` },
      dueDate: `${Y + 1}-05-31`,
      source: { zhTW: '碳費收費辦法:每年 5 月底前申報前一年度', en: 'TW carbon-fee rules: file prior year by 31 May' },
    });
  }
  if (profile.exportsToEU && profile.cbamProducts.length > 0) {
    items.push({
      key: 'cbam',
      label: { zhTW: `${Y} 年度 CBAM 申報`, en: `FY${Y} CBAM declaration` },
      dueDate: `${Y + 1}-05-31`,
      source: { zhTW: 'Reg (EU) 2023/956:確定期每年 5/31 申報', en: 'Reg (EU) 2023/956: annual declaration by 31 May' },
    });
  }
  if (profile.listingType === 'listed' || profile.listingType === 'otc') {
    items.push({
      key: 'report',
      label: { zhTW: `${Y} 永續報告書／氣候揭露`, en: `FY${Y} sustainability report / climate disclosure` },
      dueDate: `${Y + 1}-03-31`,
      source: { zhTW: '與年報同步申報(金管會／證交所)', en: 'Filed with the annual report (FSC/TWSE)' },
    });
  }
  if (profile.customerFrameworks.includes('cdp')) {
    items.push({
      key: 'cdp',
      label: { zhTW: `${Y + 1} CDP 問卷回覆`, en: `${Y + 1} CDP questionnaire` },
      dueDate: `${Y + 1}-07-31`,
      source: { zhTW: 'CDP 年度問卷(時程依 CDP 公告,約年中)', en: 'CDP annual cycle (mid-year; confirm CDP dates)' },
    });
  }

  return items
    .map((it) => ({ ...it, daysUntil: daysBetween(nowISO, it.dueDate) }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
