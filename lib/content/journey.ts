// The full annual carbon-management cycle, as a guided journey for the homepage. Every stage carries
// BOTH a plain-language line (for newcomers) and a professional line (standard/method, for experts) —
// so the same content orients a beginner and reassures a senior practitioner. Stages map to the
// workbench features so the homepage doubles as a map of what the tool covers.

import type { BilingualText } from '@/lib/types';

export interface JourneyStage {
  id: string;
  num: number;
  icon: string;
  title: BilingualText; // the stage name
  plain: BilingualText; // 白話 — what you actually do here
  pro: BilingualText; // 專業 — the standard / method / deliverable
  tool: BilingualText; // which workbench feature handles it
  href: string; // where to go to do it
}

export const JOURNEY: JourneyStage[] = [
  {
    id: 'measure',
    num: 1,
    icon: '📏',
    title: { zhTW: '量測・盤查', en: 'Measure' },
    plain: { zhTW: '先算出你一年到底排多少碳。', en: 'First, find out how much carbon you actually emit.' },
    pro: { zhTW: '活動數據 × 排放係數 → Scope 1／2／3,逐筆計算式可查證(ISO 14064-1）。', en: 'Activity data × factors → Scope 1/2/3 with auditable lineage (ISO 14064-1).' },
    tool: { zhTW: '盤查建模 ⑤⑦', en: 'Inventory builder ⑤⑦' },
    href: '/workbench',
  },
  {
    id: 'target',
    num: 2,
    icon: '🎯',
    title: { zhTW: '設定目標', en: 'Set targets' },
    plain: { zhTW: '訂下要減多少、哪一年達成。', en: 'Decide how much to cut, and by when.' },
    pro: { zhTW: '基準年 × 目標% → 線性軌跡,對齊 SBTi 1.5°C(最低 4.2%／年）。', en: 'Base year × target % → linear pathway, aligned to SBTi 1.5°C (min 4.2%/yr).' },
    tool: { zhTW: '目標管理', en: 'Target tracker' },
    href: '/workbench',
  },
  {
    id: 'reduce',
    num: 3,
    icon: '📉',
    title: { zhTW: '減量規劃', en: 'Plan reductions' },
    plain: { zhTW: '看看怎麼減、能順便省多少成本。', en: 'See how to cut — and what it saves you.' },
    pro: { zhTW: '減碳鏡:一個減量目標同時牽動碳費與 CBAM(綠電、能效、製程、燃料轉換）。', en: 'Reduction lens: one target moves carbon fee + CBAM together.' },
    tool: { zhTW: '減碳鏡', en: 'Reduction lens' },
    href: '/workbench',
  },
  {
    id: 'assure',
    num: 4,
    icon: '🔒',
    title: { zhTW: '查證・定版', en: 'Assure & lock' },
    plain: { zhTW: '把數字凍結、留下誰簽核的紀錄。', en: 'Freeze the number and record who signed off.' },
    pro: { zhTW: '查證工作流(ISO 14064-3／確信)+ 版本軌跡,凍結已查證盤查。', en: 'Assurance workflow + version trail; freeze the verified inventory.' },
    tool: { zhTW: '查證定版', en: 'Lock versions' },
    href: '/workbench',
  },
  {
    id: 'file',
    num: 5,
    icon: '🗓',
    title: { zhTW: '申報・合規', en: 'File & comply' },
    plain: { zhTW: '該繳的碳費、該報的別漏、別過期。', en: 'Pay the fee, file on time, miss nothing.' },
    pro: { zhTW: '碳費／CBAM 計算 + 義務行事曆(碳費 5/31、CBAM、報告書）倒數。', en: 'Carbon-fee/CBAM calc + obligation calendar with countdowns.' },
    tool: { zhTW: '碳費・CBAM・行事曆', en: 'Fee · CBAM · calendar' },
    href: '/workbench',
  },
  {
    id: 'disclose',
    num: 6,
    icon: '📤',
    title: { zhTW: '對外揭露', en: 'Disclose' },
    plain: { zhTW: '報告書、客戶問卷都生得出來。', en: 'Produce the report and the customer answers.' },
    pro: { zhTW: 'IFRS S1／S2 報告段落草稿 + 盤查清冊 CSV + CBAM 溝通範本。', en: 'IFRS S1/S2 draft + inventory CSV + CBAM communication template.' },
    tool: { zhTW: '報告與匯出', en: 'Report & exports' },
    href: '/workbench',
  },
  {
    id: 'close',
    num: 7,
    icon: '🔁',
    title: { zhTW: '年對年閉環', en: 'Close the loop' },
    plain: { zhTW: '跟去年比、再滾到明年重來一輪。', en: 'Compare to last year, roll into next.' },
    pro: { zhTW: '快照 Δ% vs 基準年／前期 + 一鍵結轉下一年(沿用邊界與係數）。', en: 'Snapshot Δ% vs base/prior + carry-forward to next year.' },
    tool: { zhTW: '快照・結轉', en: 'Snapshots · carry-forward' },
    href: '/workbench',
  },
];
