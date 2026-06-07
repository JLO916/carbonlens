'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { lockVersion, appendLockedVersion, removeLockedVersion, type LockedVersion } from '@/lib/workbench/locked-versions';
import type { CompanyProfile } from '@/lib/workbench/profile';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(n));

/** C3 — freeze the current profile as a verified, signed, timestamped version (change trail). */
export default function LockedVersions({ profile, versions, onChange, onRestore }: {
  profile: CompanyProfile;
  versions: LockedVersion[];
  onChange: (v: LockedVersion[]) => void;
  onRestore: (profileJson: string) => void;
}) {
  const { t } = useI18n();
  const [label, setLabel] = useState('');
  const [signer, setSigner] = useState('');

  function lock() {
    const v = lockVersion(profile, label || `FY${profile.year} ${t('盤查', 'inventory')}`, signer, crypto.randomUUID(), new Date().toISOString());
    onChange(appendLockedVersion(v));
    setLabel(''); setSigner('');
  }

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">{t('🔒 查證定版（凍結已查證盤查）', '🔒 Lock a verified version')}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-12">
          <div className="space-y-0.5 sm:col-span-5"><Label className="text-[11px] text-gray-500">{t('版本名稱', 'Version label')}</Label><Input className="h-9 text-sm" placeholder={t('如 FY2025 已查證版', 'e.g. FY2025 assured')} value={label} onChange={(e) => setLabel(e.target.value)} /></div>
          <div className="space-y-0.5 sm:col-span-4"><Label className="text-[11px] text-gray-500">{t('簽核人', 'Signed by')}</Label><Input className="h-9 text-sm" placeholder={t('如 王經理', 'e.g. J. Wang')} value={signer} onChange={(e) => setSigner(e.target.value)} /></div>
          <div className="flex items-end sm:col-span-3"><Button variant="outline" onClick={lock} className="h-9 w-full">🔒 {t('凍結此版本', 'Freeze')}</Button></div>
        </div>

        {versions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-400">
                  <th className="py-1.5 pr-3 font-medium">{t('凍結日', 'Locked')}</th>
                  <th className="py-1.5 pr-3 font-medium">{t('版本', 'Version')}</th>
                  <th className="py-1.5 pr-3 font-medium">{t('總足跡', 'Footprint')}</th>
                  <th className="py-1.5 pr-3 font-medium">{t('簽核', 'Signer')}</th>
                  <th className="py-1.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 text-gray-700">
                    <td className="py-1.5 pr-3">{v.at.slice(0, 10)}</td>
                    <td className="py-1.5 pr-3 font-medium">{v.label}</td>
                    <td className="py-1.5 pr-3 font-mono">{fmt(v.footprintTonnes)} t</td>
                    <td className="py-1.5 pr-3">{v.signedBy || '—'}</td>
                    <td className="py-1.5">
                      <button type="button" className="mr-2 text-[#5d7d44] underline-offset-2 hover:underline" onClick={() => onRestore(v.profileJson)}>{t('還原', 'Restore')}</button>
                      <button type="button" className="text-gray-400 underline-offset-2 hover:underline" onClick={() => onChange(removeLockedVersion(v.id))}>{t('刪除', 'Delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-gray-400">{t('此為自我聲明之凍結記錄(留簽核軌跡),非第三方查證。版本含當時側寫副本,可「還原」重現或比對。', 'A self-attested freeze (change trail), NOT third-party assurance. Each version stores a profile copy you can “Restore” to reproduce/compare.')}</p>
      </CardContent>
    </Card>
  );
}
