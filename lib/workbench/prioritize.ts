// "Do this first" — rank the company's obligations across all modules. This introduces NO new
// sourced numbers; it scores by signals ALREADY computed (deadline proximity, the cash fee being
// paid now, CBAM ramp imminence, supply-chain pressure). It is an explicitly TOOL-DEFINED,
// adjustable rubric — not an official ordering (same honesty as the urgency sub-scores).

import type { BilingualText } from '@/lib/diagnose/types';
import type { WorkbenchResult } from './aggregate';

export interface PriorityItem {
  key: 'domestic' | 'cbam' | 'disclosure' | 'supply-chain';
  title: BilingualText;
  score: number; // 0–100, higher = do first
  rationale: BilingualText;
}

export const PRIORITY_METHODOLOGY: BilingualText = {
  zhTW: '排序為本工具的「可調輔助規則」,依死線遠近、你現在實付的碳費、CBAM 相位導入時程、供應鏈壓力綜合,非官方優先序——請依你的資源與風險自行判斷。',
  en: 'This ranking is the tool’s adjustable helper rubric — combining deadline proximity, the carbon fee you pay now, CBAM phase-in timing and supply-chain pressure. It is not an official priority order; weigh it against your own resources and risk.',
};

const clamp = (x: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));

/** Whole months from `today` to an ISO date (negative if past). */
function monthsUntil(iso: string, today: Date): number {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso);
  if (!m) return 999;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  return (y - today.getFullYear()) * 12 + (mo - (today.getMonth() + 1));
}

const fmtMonths = (m: number): BilingualText =>
  m <= 0
    ? { zhTW: '已到期/進行中', en: 'due/ongoing' }
    : { zhTW: `約 ${m} 個月後`, en: `~${m} months out` };

export function rankObligations(r: WorkbenchResult, today: Date = new Date()): PriorityItem[] {
  const items: PriorityItem[] = [];

  // Domestic carbon fee — real cash, paid now. High if any fee is actually owed.
  const feeNow = r.domestic.totalFeeTWD > 0 || r.domestic.totalFeeUSD > 0;
  items.push({
    key: 'domestic',
    title: { zhTW: '國內碳費', en: 'Domestic carbon fee' },
    score: feeNow ? clamp(72 + Math.min(18, r.domestic.totalFeeUSD / 5000)) : 12,
    rationale: feeNow
      ? { zhTW: `你現在就在繳:約 NT$${Math.round(r.domestic.totalFeeTWD).toLocaleString('en-US')}/年——實付現金,優先處理與減量。`, en: `You pay this now: ~NT$${Math.round(r.domestic.totalFeeTWD).toLocaleString('en-US')}/yr — real cash, prioritise paying & reducing.` }
      : { zhTW: '目前在起徵門檻(K 值)以下或無收費排放,暫無碳費現金支出。', en: 'Below the K-value threshold or no chargeable emissions — no carbon-fee cash outlay yet.' },
  });

  // IFRS disclosure — hard statutory deadline.
  const ifrs = r.listed.ifrs;
  const deadlineISO = ifrs.fileDeadlineISO ?? `${ifrs.fileYear}-12-31`;
  const dMonths = monthsUntil(deadlineISO, today);
  items.push({
    key: 'disclosure',
    title: { zhTW: 'IFRS S1/S2 + 永續報告書', en: 'IFRS S1/S2 + sustainability report' },
    score: clamp(95 - dMonths * 1.8),
    rationale: {
      zhTW: `第 ${ifrs.phase} 階段首次申報 ${ifrs.fileYear}(${fmtMonths(dMonths).zhTW});Scope 3 最費時,宜最早啟動。`,
      en: `Phase ${ifrs.phase} first filing ${ifrs.fileYear} (${fmtMonths(dMonths).en}); Scope 3 takes longest — start earliest.`,
    },
  });

  // CBAM — first surrender 2027-09-30; relevant only if exporting to EU.
  const exporting = r.cbam.lines.some((l) => l.result.input.exportsToEU);
  const cbamMonths = monthsUntil('2027-09-30', today);
  const hasObligation = r.cbam.totalObligationEUR !== undefined || r.cbam.lockedLines > 0;
  items.push({
    key: 'cbam',
    title: { zhTW: 'CBAM 暴露', en: 'CBAM exposure' },
    score: !exporting ? 5 : clamp((hasObligation ? 58 : 40) + Math.max(0, 24 - cbamMonths)),
    rationale: !exporting
      ? { zhTW: '未出口歐盟,暫不適用。', en: 'No EU exports — not applicable now.' }
      : { zhTW: `首次申報/繳交 2027/9/30(${fmtMonths(cbamMonths).zhTW});今年義務小但逐年爬升,備可查證數據要前置時間。`, en: `First surrender 30 Sep 2027 (${fmtMonths(cbamMonths).en}); this year’s obligation is small but ramps — verified data needs lead time.` },
  });

  // Supply-chain pressure.
  const pl = r.supplyChain.pressureLevel;
  items.push({
    key: 'supply-chain',
    title: { zhTW: '供應鏈碳要求', en: 'Supply-chain carbon demands' },
    score: pl === 'high' ? 68 : pl === 'medium' ? 48 : 28,
    rationale: {
      zhTW: `預期被要求壓力:${pl === 'high' ? '高' : pl === 'medium' ? '中' : '低'}——客戶要的數據與你的盤查重疊,可一併準備。`,
      en: `Expected demand pressure: ${pl}. The data customers want overlaps your inventory — prepare together.`,
    },
  });

  return items.sort((a, b) => b.score - a.score);
}
