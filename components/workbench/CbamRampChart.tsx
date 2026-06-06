'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/lib/i18n/context';
import type { CbamRamp } from '@/lib/workbench/ramp';

const fmtAxis = (v: number) => (v >= 1_000_000 ? `€${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `€${(v / 1000).toFixed(0)}K` : `€${v}`);

/** CBAM exposure 2026→2034 — the phase-in ramp (small now, big later). The shaded band is the
 *  official-value spread (or actual point); the line is the central value when every line is a
 *  single point (CN-exact / actual). Reuses the sourced cbamFactorForYear via ramp.ts. */
export default function CbamRampChart({ ramp }: { ramp: CbamRamp }) {
  const { t } = useI18n();
  const data = useMemo(
    () => ramp.points.map((p) => ({ year: p.year, band: [p.lowEUR, p.highEUR] as [number, number], central: p.centralEUR ?? null })),
    [ramp],
  );

  if (!ramp.etsPrice || ramp.points.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">{t('CBAM 暴露逐年（2026→2034）', 'CBAM exposure ramp (2026→2034)')}</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-500">{t('填 EU ETS 價並至少一筆出口品項（實際數據或解鎖的 CN 碼）即可看逐年爬升。', 'Enter an EU ETS price and at least one export line (actual data or an unlocked CN code) to see the ramp.')}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('CBAM 暴露逐年（2026→2034）', 'CBAM exposure ramp (2026→2034)')}</CardTitle>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">
          {(() => {
            const etsLabel = ramp.etsLow !== undefined && ramp.etsHigh !== undefined && ramp.etsLow !== ramp.etsHigh ? `€${ramp.etsLow}–€${ramp.etsHigh}` : `€${ramp.etsPrice}`;
            return t(
              `在 ETS ${etsLabel}／噸下,隨免費配額退場(CBAM 因子 2.5%→100%)逐年爬升——現在小、之後大,備數據要前置時間。${ramp.hasCentral ? '線=你的中央值;' : ''}陰影=排放×ETS 區間。`,
              `At ETS ${etsLabel}/t, exposure ramps as free allocation phases out (CBAM factor 2.5%→100%) — small now, big later; data prep needs lead time. ${ramp.hasCentral ? 'Line = central; ' : ''}shaded = emissions×ETS band.`,
            );
          })()}
          {ramp.lockedLines > 0 && t(` （${ramp.lockedLines} 筆官方預設值待解鎖,未計入）`, ` (${ramp.lockedLines} default line(s) locked, excluded)`)}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11 }} width={55} />
            <Tooltip
              formatter={(value) =>
                Array.isArray(value)
                  ? [`€${Number(value[0]).toLocaleString()} – €${Number(value[1]).toLocaleString()}`, t('官方值範圍', 'range')]
                  : [`€${Number(value).toLocaleString()}`, t('中央值', 'central')]
              }
            />
            <Area dataKey="band" stroke="#89B56C" fill="#89B56C" fillOpacity={0.15} strokeOpacity={0.4} />
            {ramp.hasCentral && <Line type="monotone" dataKey="central" stroke="#5d7d44" strokeWidth={2} dot={{ r: 3 }} />}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
