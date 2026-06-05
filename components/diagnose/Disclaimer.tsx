'use client';

import { useI18n } from '@/lib/i18n/context';

/** Site-wide honest disclosure (Brief §5): not legal advice, not sustainability assurance. */
export default function Disclaimer({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 ${className}`}>
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="mt-px size-4 shrink-0 text-amber-500">
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-xs leading-relaxed text-amber-800">
        {t(
          '本工具為初步診斷與情報參考，非法律意見、非永續簽證，正式申報請依主管機關規範與專業意見辦理。',
          'This tool is a preliminary diagnostic and intelligence reference — not legal advice and not a sustainability assurance. For formal filing, follow the competent authority’s rules and professional advice.',
        )}
      </p>
    </div>
  );
}
