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
  onSkip,
}: {
  module: ModuleKey;
  routingInput: RoutingInput;
  score?: number;
  pressureLevel?: PressureLevel;
  input: DiagnosticInput;
  onSuccess: (routing: LeadRoutingResult) => void;
  onSkip?: () => void;
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
        <CardTitle className="text-base">{t('要我們把結果與清單寄給你嗎？（選填）', 'Want the result & checklist emailed to you? (optional)')}</CardTitle>
        <p className="mt-1 text-xs text-gray-500">
          {t('上方診斷與下方清單都免費、不需 email——清單已對齊你的永續報告書／IFRS S2／CDP 問卷。若想收到信箱副本並依角色提供後續合規資源，可留個工作信箱；不留也能直接下載。', 'The diagnosis and the checklist below are free and need no email — the checklist already maps to your sustainability report / IFRS S2 / CDP questionnaire. Leave a work email only if you’d like a copy plus role-matched follow-up; otherwise just download.')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('工作信箱', 'Work email')}
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
          {status === 'submitting' ? t('送出中…', 'Submitting…') : t('送出 · 取得清單與資源', 'Send · get checklist & resources')}
        </Button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-center text-xs text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
          >
            {t('略過，直接看建議路徑 →', 'Skip — see my recommended path →')}
          </button>
        )}
        <p className="text-[11px] leading-relaxed text-gray-400">
          {t('我們僅用此 email 提供合規資源與後續聯繫，不會公開或販售。', 'We use this email only to share compliance resources and follow up — never published or sold.')}
        </p>
      </CardContent>
    </Card>
  );
}
