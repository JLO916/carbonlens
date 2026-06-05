'use client';

import Link from 'next/link';
import type { BilingualText } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

export interface ModuleCardProps {
  icon: string;
  pain: BilingualText; // the user's own question — the hook
  desc: BilingualText; // short context
  tool: BilingualText; // the module that answers it
  href: string;
  badge?: BilingualText;
}

export default function ModuleCard({ icon, pain, desc, tool, href, badge }: ModuleCardProps) {
  const { tObj } = useI18n();
  return (
    <Link href={href} className="group block">
      <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all group-hover:border-[#89B56C] group-hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{icon}</span>
          {badge && (
            <span className="rounded-full bg-[#89B56C]/10 px-2.5 py-0.5 text-xs font-medium text-[#5d7d44]">{tObj(badge)}</span>
          )}
        </div>
        <h3 className="mt-3 text-[15px] font-semibold leading-snug text-gray-900">{tObj(pain)}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{tObj(desc)}</p>
        <p className="mt-3 border-t border-gray-100 pt-3 text-sm font-medium text-[#5d7d44] group-hover:underline">
          {tObj(tool)} →
        </p>
      </div>
    </Link>
  );
}
