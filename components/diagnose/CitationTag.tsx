'use client';

import { useEffect, useState } from 'react';
import type { Citation } from '@/lib/diagnose/types';
import { useI18n } from '@/lib/i18n/context';
import { monthsSince, STALE_MONTHS } from '@/lib/diagnose/aging';

/** Honest-disclosure source badge: 來源 + 官方文件版本 + 資料快照日 (Brief §5).
 *  We show a "snapshot" date + "verify against the authority's latest notice" instead of a
 *  forward "next review" date — the tool makes no promise to re-check on a schedule. */
export default function CitationTag({
  citation,
  className = '',
}: {
  citation: Citation;
  className?: string;
}) {
  const { t, tObj } = useI18n();
  // Compute snapshot age client-side only (avoids SSR/CSR hydration mismatch on the date).
  const [aged, setAged] = useState<number | null>(null);
  useEffect(() => setAged(monthsSince(citation.asOfDate)), [citation.asOfDate]);
  const stale = aged !== null && aged >= STALE_MONTHS;
  return (
    <div
      className={`flex items-start gap-1.5 rounded-md bg-[#89B56C]/[0.06] px-2.5 py-1.5 text-[11px] leading-relaxed text-gray-500 ring-1 ring-[#89B56C]/15 ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="mt-px size-3 shrink-0 text-[#89B56C]">
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        <span className="font-medium text-gray-600">{t('來源', 'Source')}</span> {tObj(citation.source)}
        <span className="text-gray-300"> · </span>
        {tObj(citation.officialDocVersion)}
        <span className="text-gray-300"> · </span>
        {t('資料快照', 'snapshot')} {citation.asOfDate}
        {citation.url && (
          <>
            <span className="text-gray-300"> · </span>
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5d7d44] underline hover:text-[#6E9156]"
            >
              {t('原始文件', 'Source doc')}
            </a>
          </>
        )}
        <span className="text-gray-300"> · </span>
        <span className="text-gray-400">{t('以主管機關最新公告為準', 'verify against the latest official notice')}</span>
        {aged !== null && aged >= 1 && (
          <>
            <span className="text-gray-300"> · </span>
            <span className={stale ? 'font-medium text-amber-600' : 'text-gray-400'}>
              {stale
                ? t(`快照已 ${aged} 個月，建議重新查證`, `snapshot is ${aged} mo old — re-verify`)
                : t(`${aged} 個月前`, `${aged} mo ago`)}
            </span>
          </>
        )}
      </span>
    </div>
  );
}
