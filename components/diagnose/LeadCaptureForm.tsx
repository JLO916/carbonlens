'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/lib/i18n/context';
import { LEAD_ROLES, classifyLead } from '@/lib/diagnose/logic/lead-routing';
import type {
  LeadPayload,
  LeadRoutingResult,
  RoutingInput,
  ModuleKey,
  PressureLevel,
  DiagnosticInput,
} from '@/lib/diagnose/types';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function LeadCaptureForm({
  module,
  routingInput,
  score,
  pressureLevel,
  input,
  onSuccess,
}: {
  module: ModuleKey;
  routingInput: RoutingInput;
  score?: number;
  pressureLevel?: PressureLevel;
  input: DiagnosticInput;
  onSuccess: (routing: LeadRoutingResult) => void;
}) {
  const { t, tObj } = useI18n();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('unspecified');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState('');

  const roleLabel = LEAD_ROLES.find((r) => r.value === role)?.label;

  async function handleSubmit() {
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('請輸入有效的 email', 'Please enter a valid email'));
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setError('');

    const routing = classifyLead({
      ...routingInput,
      role: role === 'unspecified' ? undefined : role,
      email,
    });

    const payload: LeadPayload = {
      email: email.trim(),
      role: role === 'unspecified' ? undefined : role,
      company: company.trim() || undefined,
      module,
      pool: routing.recommendedPool,
      score,
      pressureLevel,
      input,
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('bad_status');
      onSuccess(routing);
    } catch {
      setError(t('送出失敗，請稍後再試。', 'Submission failed, please try again.'));
      setStatus('error');
    }
  }

  return (
    <Card className="border-2 border-[#89B56C]/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('取得完整結果與初步因應清單', 'Get the full result & action checklist')}</CardTitle>
        <p className="mt-1 text-xs text-gray-500">
          {t('留下 email 即可下載初步因應清單，並依您的身分提供後續資源。', 'Leave your email to download the action checklist and get resources matched to your role.')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('工作信箱', 'Work email')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            value={email}
            placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('您的角色', 'Your role')}</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {() => (role === 'unspecified' ? t('（選填）', '(optional)') : roleLabel ? tObj(roleLabel) : '')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unspecified">{t('（選填）', '(optional)')}</SelectItem>
                {LEAD_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {tObj(r.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('公司（選填）', 'Company (optional)')}</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>

        {status === 'error' && error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={status === 'submitting'}
          className="h-11 w-full bg-[#89B56C] text-base text-white hover:bg-[#6E9156]"
        >
          {status === 'submitting' ? t('送出中…', 'Submitting…') : t('查看完整結果', 'Show full result')}
        </Button>
        <p className="text-[11px] leading-relaxed text-gray-400">
          {t('我們僅用此 email 提供合規資源與後續聯繫，不會公開或販售。', 'We use this email only to share compliance resources and follow up — never published or sold.')}
        </p>
      </CardContent>
    </Card>
  );
}
