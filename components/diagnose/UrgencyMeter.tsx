'use client';

import type { UrgencyBreakdown } from '@/lib/diagnose/types';
import { useI18n } from '@/lib/i18n/context';

// Urgency uses a red-intensity alert scale (high = urgent). Unrelated to the 紅漲綠跌
// stock convention — it is an alert meter, not a price.
function band(total: number) {
  if (total >= 67) return { color: '#dc2626', label: { zhTW: '高', en: 'High' } };
  if (total >= 34) return { color: '#d97706', label: { zhTW: '中', en: 'Medium' } };
  return { color: '#64748b', label: { zhTW: '低', en: 'Low' } };
}

export default function UrgencyMeter({ urgency }: { urgency: UrgencyBreakdown }) {
  const { t, tObj } = useI18n();
  const b = band(urgency.total);
  const R = 52;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, urgency.total));
  const offset = C * (1 - pct / 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        {/* Score ring */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 120 120" className="size-28 -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#eef0f2" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={b.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold leading-none tabular-nums" style={{ color: b.color }}>
              {urgency.total}
            </span>
            <span className="mt-0.5 text-[10px] text-gray-400">/ 100</span>
          </div>
        </div>

        {/* Label */}
        <div className="text-center sm:text-left">
          <p className="text-sm font-medium text-gray-500">{t('合規急迫度分數', 'Compliance urgency score')}</p>
          <p className="mt-1 text-xl font-bold" style={{ color: b.color }}>
            {t('急迫度', 'Urgency')}：{tObj(b.label)}
          </p>
          <p className="mt-1 text-xs text-gray-400">{t('提醒指標（0–100），不取代你的合規排程', 'A reminder signal (0–100) — not a substitute for your compliance plan')}</p>
        </div>
      </div>

      {/* Components */}
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
        {urgency.components.map((c) => (
          <div key={c.key}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {tObj(c.label)}
                <span className="ml-1.5 text-xs font-normal text-gray-400">×{Math.round(c.weight * 100)}%</span>
              </span>
              <span className="tabular-nums text-gray-500">{Math.round(c.raw01 * 100)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#89B56C]" style={{ width: `${c.raw01 * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-400">{tObj(c.rationale)}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-gray-100 pt-3 text-[11px] leading-relaxed text-gray-400">
        {tObj(urgency.methodologyNote)}
      </p>
    </div>
  );
}
