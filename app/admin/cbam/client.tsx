'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminCbamData {
  ok: boolean;
  live: { status: 'live' | 'locked'; asOf?: string; syncedAt?: string };
  staged: { rows: number; categories: number; countries: number; asOf: string };
}

export default function AdminCbamClient() {
  const [token, setToken] = useState('');
  const [data, setData] = useState<AdminCbamData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function call(method: 'GET' | 'POST' | 'DELETE') {
    const t = token.trim();
    if (!t) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/cbam-admin', { method, headers: { Authorization: `Bearer ${t}` } });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.ok) {
        setError(res.status === 401 ? '密碼錯誤' : res.status === 503 ? '伺服器尚未設定 ADMIN_TOKEN' : d?.error || '失敗');
        if (method === 'GET') setData(null);
        return;
      }
      if (method === 'GET') {
        setData(d as AdminCbamData);
      } else {
        setMsg(method === 'POST' ? `已解鎖 ${d.promoted?.toLocaleString?.() ?? d.promoted} 筆 CN 碼級官方預設值,CBAM 官方預設值路徑已開放。` : '已鎖回,官方預設值恢復占位。');
        await call('GET');
      }
    } catch {
      setError('網路錯誤');
    } finally {
      setBusy(false);
    }
  }

  const live = data?.live;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">CBAM 基線確認</h1>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          官方「僅供參考」Excel 已解析至暫存。在此做 §7.3 的「人工基線確認」:確認後 CBAM 模組的「官方預設值」路徑才會開放。
          解鎖後回傳的是「使用者 CN 碼的<strong>那一筆</strong>官方值(含加成)」;使用者不確定 CN 碼時,只顯示該類別官方值範圍(min–max),不給單一估值。
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && call('GET')}
          placeholder="ADMIN_TOKEN"
          className="max-w-xs"
        />
        <Button onClick={() => call('GET')} disabled={busy} className="bg-[#89B56C] text-white hover:bg-[#6E9156]">
          {busy ? '處理中…' : '載入狀態'}
        </Button>
      </div>

      {error && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
      {msg && <p className="rounded-lg bg-[#89B56C]/10 p-3 text-sm text-[#5d7d44]">{msg}</p>}

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">暫存(官方 Excel)</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{data.staged.rows.toLocaleString()} 筆 CN 碼級官方值</p>
              <p className="text-xs text-gray-400">{data.staged.countries} 國 · {data.staged.categories} 類別(國×產品) · {data.staged.asOf}</p>
            </div>
            <div className={`rounded-xl border p-4 ${live?.status === 'live' ? 'border-[#89B56C]/40 bg-[#89B56C]/5' : 'border-gray-200 bg-white'}`}>
              <p className="text-xs text-gray-500">Live 狀態</p>
              {live?.status === 'live' ? (
                <>
                  <p className="mt-1 text-2xl font-bold text-[#5d7d44]">已解鎖 ✓</p>
                  <p className="text-xs text-gray-400">CN 碼級 · as of {live.asOf} · 確認於 {live.syncedAt?.slice(0, 16).replace('T', ' ')}</p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-bold text-gray-400">鎖定中</p>
                  <p className="text-xs text-gray-400">官方預設值路徑顯示占位,不算金額</p>
                </>
              )}
            </div>
          </div>

          {live?.status !== 'live' ? (
            <div className="rounded-xl border-2 border-[#89B56C]/30 bg-white p-4">
              <p className="text-sm text-gray-700">
                確認你已核對暫存來源(官方「僅供參考」Excel、CN 碼與含加成值),即可解鎖。工具回傳「該 CN 碼的那一筆官方值」;法律約束力仍以 IR 2025/2621 為準,工具標為指示性。
              </p>
              <Button
                onClick={() => {
                  if (window.confirm('確認人工基線並解鎖 CBAM 官方預設值?(可隨時鎖回)')) call('POST');
                }}
                disabled={busy}
                className="mt-3 bg-[#89B56C] text-white hover:bg-[#6E9156]"
              >
                ✅ 確認基線並解鎖
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-700">官方預設值已解鎖。若要重新核對或暫停對外,可鎖回。</p>
              <Button variant="outline" onClick={() => { if (window.confirm('鎖回?官方預設值路徑會恢復占位。')) call('DELETE'); }} disabled={busy} className="mt-3">
                🔒 鎖回(還原占位)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
