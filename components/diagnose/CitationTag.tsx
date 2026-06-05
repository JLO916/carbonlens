'use client';

import type { Citation } from '@/lib/diagnose/types';
import { useI18n } from '@/lib/i18n/context';

/** Honest-disclosure tag: 來源 + 官方文件版本 + 同步日期 (Brief §5). */
export default function CitationTag({
  citation,
  className = '',
}: {
  citation: Citation;
  className?: string;
}) {
  const { t, tObj } = useI18n();
  return (
    <p className={`text-[11px] leading-relaxed text-gray-400 ${className}`}>
      <span className="font-medium text-gray-500">{t('來源', 'Source')}：</span>
      {tObj(citation.source)}
      <span className="text-gray-300"> · </span>
      {tObj(citation.officialDocVersion)}
      <span className="text-gray-300"> · </span>
      {t('同步日期', 'As of')} {citation.asOfDate}
      {citation.url && (
        <>
          <span className="text-gray-300"> · </span>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            {t('原始文件', 'Source doc')}
          </a>
        </>
      )}
    </p>
  );
}
