'use client';

import type { UrgencyBreakdown } from '@/lib/diagnose/types';
import { useI18n } from '@/lib/i18n/context';

// Urgency uses a red-intensity alert scale (high = urgent). This is unrelated to the
// 紅漲綠跌 stock convention — it is an alert meter, not a price.
function band(total: number) {
  if (total >= 67) return { color: '#dc2626', label: { zhTW: '高', en: 'High' } };
  if (total >= 34) return { color: '#d97706', label: { zhTW: '中', en: 'Medium' } };
  return { color: '#64748b', label: { zhTW: '低', en: 'Low' } };
}

export default function UrgencyMeter({ urgency }: { urgency: UrgencyBreakdown }) {
  const { t, tObj } = useI18n();
  const b = band(urgency.total);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{t('合規急迫度分數', 'Compliance urgency score')}</p>
          <p className="mt-1 text-xs text-gray-400">{t('0–100，越高越該優先處理', '0–100, higher = act sooner')}</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold tabular-nums" style={{ color: b.color }}>
            {urgency.total}
          </span>
          <span
            className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ color: b.color, backgroundColor: `${b.color}1a` }}
          >
            {tObj(b.label)}
          </span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${urgency.total}%`, backgroundColor: b.color }} />
      </div>

      {/* Components */}
      <div className="mt-5 space-y-3">
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
