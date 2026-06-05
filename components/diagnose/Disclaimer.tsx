'use client';

import { useI18n } from '@/lib/i18n/context';

/** Site-wide honest disclosure (Brief §5): not legal advice, not sustainability assurance. */
export default function Disclaimer({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-3 ${className}`}>
      <p className="text-xs leading-relaxed text-amber-800">
        {t(
          '本工具為初步診斷與情報參考，非法律意見、非永續簽證，正式申報請依主管機關規範與專業意見辦理。',
          'This tool is a preliminary diagnostic and intelligence reference — not legal advice and not a sustainability assurance. For formal filing, follow the competent authority’s rules and professional advice.',
        )}
      </p>
    </div>
  );
}
