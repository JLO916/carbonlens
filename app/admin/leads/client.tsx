'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { StoredLead } from '@/lib/diagnose/lead-store';

const COLS = ['receivedAt', 'module', 'pool', 'email', 'company', 'role', 'score', 'pressureLevel', 'input'] as const;

function cell(lead: StoredLead, col: (typeof COLS)[number]): string {
  const v = (lead as unknown as Record<string, unknown>)[col];
  if (v == null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default function AdminLeadsClient() {
  const [token, setToken] = useState('');
  const [leads, setLeads] = useState<StoredLead[] | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const t = token.trim();
    if (!t) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leads', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setLeads(null);
        setError(
          res.status === 401
            ? '密碼錯誤'
            : res.status === 503
              ? '伺服器尚未設定 ADMIN_TOKEN 環境變數'
              : data?.error || '載入失敗',
        );
        return;
      }
      setLeads(data.leads ?? []);
      setCount(data.count ?? (data.leads?.length ?? 0));
      if (data.note === 'kv_not_configured') setError('KV 尚未設定，目前沒有儲存任何線索');
    } catch {
      setLeads(null);
      setError('網路錯誤');
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!leads || leads.length === 0) return;
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [COLS.join(',')].concat(leads.map((l) => COLS.map((c) => esc(cell(l, c))).join(',')));
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recc-leads.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">線索管理</h1>
        <p className="mt-1 text-sm text-gray-500">輸入 ADMIN_TOKEN 載入後端儲存的線索（密碼僅留在此分頁、不會被儲存）。</p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="ADMIN_TOKEN"
          className="max-w-xs"
        />
        <Button onClick={load} disabled={loading} className="bg-[#89B56C] text-white hover:bg-[#6E9156]">
          {loading ? '載入中…' : '載入線索'}
        </Button>
        {leads && leads.length > 0 && (
          <Button variant="outline" onClick={exportCsv}>
            ⬇ 匯出 CSV
          </Button>
        )}
        {leads && <span className="text-sm text-gray-500">共 {count} 筆（顯示最近 {leads.length} 筆）</span>}
      </div>

      {error && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}

      {leads && leads.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">時間</th>
                <th className="px-3 py-2 font-medium">模組</th>
                <th className="px-3 py-2 font-medium">池</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">公司</th>
                <th className="px-3 py-2 font-medium">角色</th>
                <th className="px-3 py-2 font-medium">分數／壓力</th>
                <th className="px-3 py-2 font-medium">輸入</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((l, i) => (
                <tr key={i} className="align-top hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-2 text-gray-500">{cell(l, 'receivedAt').replace('T', ' ').slice(0, 16)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{cell(l, 'module')}</td>
                  <td className="whitespace-nowrap px-3 py-2">{cell(l, 'pool')}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-800">{cell(l, 'email')}</td>
                  <td className="whitespace-nowrap px-3 py-2">{cell(l, 'company')}</td>
                  <td className="whitespace-nowrap px-3 py-2">{cell(l, 'role')}</td>
                  <td className="whitespace-nowrap px-3 py-2">{l.score ?? l.pressureLevel ?? ''}</td>
                  <td className="max-w-xs px-3 py-2 text-gray-400">
                    <code className="break-all">{cell(l, 'input')}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {leads && leads.length === 0 && !error && <p className="text-sm text-gray-500">目前還沒有線索。</p>}
    </div>
  );
}
