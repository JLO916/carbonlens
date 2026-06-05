// Urgency score (0–100) — Brief §4. Pure functions; `today` is injected for
// determinism (tests pass a fixed date; the client passes new Date()).

import type {
  ListedInput,
  IfrsPhaseInfo,
  UrgencyBreakdown,
  UrgencyComponent,
  BilingualText,
} from '@/lib/diagnose/types';
import {
  URGENCY_WEIGHTS,
  SCALE_BY_TIER,
  DEADLINE_PROXIMITY,
  ASSUMED_FILING_MONTH_DAY,
  EXPOSURE_CONFIG,
  URGENCY_METHODOLOGY_NOTE,
} from '@/lib/diagnose/data/urgency-config';

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.44;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function monthsUntil(targetISO: string, today: Date): number {
  const target = new Date(`${targetISO}T00:00:00Z`);
  return (target.getTime() - today.getTime()) / MS_PER_MONTH;
}

/** months-to-deadline → 0–1 (closer = higher). See DEADLINE_PROXIMITY. */
export function deadlineProximity01(months: number): number {
  const { nearMonths, farMonths, floor } = DEADLINE_PROXIMITY;
  if (months <= nearMonths) return 1;
  if (months >= farMonths) return floor;
  const ratio = (farMonths - months) / (farMonths - nearMonths); // 0..1
  return floor + (1 - floor) * ratio;
}

export function computeUrgency(
  input: ListedInput,
  ifrs: IfrsPhaseInfo,
  today: Date,
): UrgencyBreakdown {
  // 死線逼近度 — drive off the IFRS first-filing deadline (the incremental obligation).
  const targetISO = ifrs.fileDeadlineISO ?? `${ifrs.fileYear}-${ASSUMED_FILING_MONTH_DAY}`;
  const months = monthsUntil(targetISO, today);
  const deadline01 = deadlineProximity01(months);

  // 暴露強度 — phase imminence + report gap.
  const phaseImm = EXPOSURE_CONFIG.phaseImminence[ifrs.phase] ?? 0.3;
  const noReport = input.hasSustainabilityReport ? 0 : 1;
  const exposure01 = clamp01(
    phaseImm * EXPOSURE_CONFIG.phaseWeight + noReport * EXPOSURE_CONFIG.noReportContribution,
  );

  // 規模 — capital tier.
  const scale01 = SCALE_BY_TIER[input.capitalTier];

  const mk = (
    key: UrgencyComponent['key'],
    label: BilingualText,
    raw01: number,
    weight: number,
    rationale: BilingualText,
  ): UrgencyComponent => ({ key, label, raw01, weight, weighted: raw01 * weight, rationale });

  const monthsRounded = Math.max(0, Math.round(months));

  const components: UrgencyComponent[] = [
    mk(
      'deadline',
      { zhTW: '死線逼近度', en: 'Deadline proximity' },
      deadline01,
      URGENCY_WEIGHTS.deadline,
      {
        zhTW: `距首次 IFRS 申報約 ${monthsRounded} 個月`,
        en: `~${monthsRounded} months to first IFRS filing`,
      },
    ),
    mk(
      'exposure',
      { zhTW: '暴露強度', en: 'Exposure intensity' },
      exposure01,
      URGENCY_WEIGHTS.exposure,
      input.hasSustainabilityReport
        ? { zhTW: `第 ${ifrs.phase} 階段；已編永續報告書`, en: `Phase ${ifrs.phase}; report already prepared` }
        : { zhTW: `第 ${ifrs.phase} 階段；尚未編報告書，落差較大`, en: `Phase ${ifrs.phase}; no report yet — larger gap` },
    ),
    mk(
      'scale',
      { zhTW: '規模', en: 'Scale' },
      scale01,
      URGENCY_WEIGHTS.scale,
      { zhTW: ifrs.capitalLabel.zhTW, en: ifrs.capitalLabel.en },
    ),
  ];

  const total = Math.round(components.reduce((s, c) => s + c.weighted, 0) * 100);
  return { total, components, methodologyNote: URGENCY_METHODOLOGY_NOTE };
}
