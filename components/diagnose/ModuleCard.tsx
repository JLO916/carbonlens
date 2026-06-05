'use client';

import Link from 'next/link';
import type { BilingualText } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

export interface ModuleCardProps {
  icon: string;
  title: BilingualText;
  description: BilingualText;
  dataNature: BilingualText; // 數據性質 (Brief §1 table)
  outputForm: BilingualText; // 輸出形態
  status: 'active' | 'coming';
  href?: string;
}

export default function ModuleCard({
  icon,
  title,
  description,
  dataNature,
  outputForm,
  status,
  href,
}: ModuleCardProps) {
  const { t, tObj } = useI18n();
  const active = status === 'active';

  const inner = (
    <div
      className={`h-full rounded-xl border bg-white p-5 transition-all ${
        active
          ? 'border-gray-200 group-hover:border-[#89B56C] group-hover:shadow-md'
          : 'border-dashed border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        {active ? (
          <span className="rounded-full bg-[#89B56C]/10 px-2.5 py-0.5 text-xs font-medium text-[#5d7d44]">
            {t('可立即診斷', 'Available')}
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-400">
            {t('即將推出', 'Coming soon')}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-gray-900">{tObj(title)}</h3>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">{tObj(description)}</p>
      <dl className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-gray-400">{t('數據性質', 'Data')}</dt>
          <dd>{tObj(dataNature)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-gray-400">{t('輸出形態', 'Output')}</dt>
          <dd>{tObj(outputForm)}</dd>
        </div>
      </dl>
      {active && (
        <p className="mt-4 text-sm font-medium text-[#5d7d44] group-hover:underline">
          {t('開始診斷 →', 'Start diagnosis →')}
        </p>
      )}
    </div>
  );

  if (active && href) {
    return (
      <Link href={href} className="group block">
        {inner}
      </Link>
    );
  }
  return <div className="opacity-70">{inner}</div>;
}
