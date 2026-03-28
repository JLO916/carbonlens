'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';

interface InfoTipProps {
  zhTW: string;
  en: string;
}

export default function InfoTip({ zhTW, en }: InfoTipProps) {
  const { tObj } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <span className="relative inline-flex items-center" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-[#89B56C] hover:text-white text-gray-500 text-[10px] font-bold leading-none ml-1 cursor-pointer transition-colors shrink-0"
        aria-label="Info"
      >
        ?
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-50 w-64 sm:w-80 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-xs text-gray-600 leading-relaxed animate-in fade-in-0 zoom-in-95">
          {tObj({ zhTW, en })}
          <button
            onClick={() => setOpen(false)}
            className="block mt-2 text-[10px] text-gray-400 hover:text-gray-600"
          >
            {tObj({ zhTW: '關閉', en: 'Close' })}
          </button>
        </div>
      )}
    </span>
  );
}
