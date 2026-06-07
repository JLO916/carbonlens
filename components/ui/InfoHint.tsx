'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { GLOSSARY_BY_KEY } from '@/lib/content/glossary';

/** Dual-level term hint: shows the term with a ⓘ; click reveals a plain-language line (newcomers)
 *  AND a professional/standard line (experts). One control serves both audiences. */
export default function InfoHint({ termKey, label, className = '' }: { termKey: string; label?: string; className?: string }) {
  const { tObj, t } = useI18n();
  const [open, setOpen] = useState(false);
  const g = GLOSSARY_BY_KEY[termKey];
  if (!g) return label ? <span className={className}>{label}</span> : null;

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <span>{label ?? tObj(g.term)}</span>
      <button
        type="button"
        aria-label={t('說明', 'Explain')}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold leading-none text-gray-400 hover:border-[#89B56C] hover:text-[#5d7d44]"
      >
        i
      </button>
      {open && (
        <span className="absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-lg">
          <span className="block text-xs font-semibold text-gray-900">{tObj(g.term)}</span>
          <span className="mt-1 flex gap-1.5 text-[11px] leading-relaxed text-gray-700">
            <span className="shrink-0 rounded bg-[#89B56C]/15 px-1 font-medium text-[#5d7d44]">{t('白話', 'Plain')}</span>
            <span>{tObj(g.plain)}</span>
          </span>
          <span className="mt-1.5 flex gap-1.5 text-[11px] leading-relaxed text-gray-500">
            <span className="shrink-0 rounded bg-gray-100 px-1 font-medium text-gray-500">{t('專業', 'Pro')}</span>
            <span>{tObj(g.pro)}</span>
          </span>
        </span>
      )}
    </span>
  );
}
