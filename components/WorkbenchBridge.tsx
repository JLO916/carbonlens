'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';

/** Spoke → hub bridge: every single-purpose tool result offers a path into the unified workbench,
 *  so nothing is a dead-end (portal UX P2). */
export default function WorkbenchBridge({ from }: { from?: string }) {
  const { t } = useI18n();
  return (
    <Link href="/workbench" className="block rounded-xl border-2 border-[#89B56C]/30 bg-[#89B56C]/5 p-4 transition-colors hover:bg-[#89B56C]/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm leading-relaxed text-gray-700">
          <span className="font-semibold text-[#5d7d44]">{t('看你的完整全貌？', 'See your whole picture?')}</span>{' '}
          {t(
            `${from ? from + '只是其中一塊。' : ''}工作台填一次側寫,同時算碳費＋CBAM＋揭露＋供應鏈,並給「先做哪件」與本機記憶。`,
            `${from ? from + ' is just one piece. ' : ''}The workbench computes carbon fee + CBAM + disclosure + supply chain from one profile, with a “do this first” and local memory.`,
          )}
        </p>
        <span className="shrink-0 text-sm font-medium text-[#5d7d44]">{t('前往工作台 →', 'Go →')}</span>
      </div>
    </Link>
  );
}
