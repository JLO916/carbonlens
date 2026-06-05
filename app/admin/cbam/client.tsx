'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminCbamData {
  ok: boolean;
  live: { status: 'live' | 'locked'; asOf?: string; syncedAt?: string; count?: number };
  staged: { rows: number; asOf: string; baselineGroups: number };
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
        setMsg(method === 'POST' ? `已 promote ${d.promoted} 組代表值,CBAM 官方預設值已解鎖。` : '已鎖回,官方預設值恢復占位。');
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
          官方「僅供參考」Excel 已解析至暫存。在此做 §7.3 的「人工基線確認」:確認後把每(國×產品類別)的代表值
          promote 為 live,CBAM 模組的「官方預設值」路徑才會顯示金額。代表值＝該類別官方 CN 值之中位數(含加成)。
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
              <p className="mt-1 text-2xl font-bold text-gray-900">{data.staged.rows.toLocaleString()} 筆</p>
              <p className="text-xs text-gray-400">聚合為 {data.staged.baselineGroups} 組(國×類別)代表值 · {data.staged.asOf}</p>
            </div>
            <div className={`rounded-xl border p-4 ${live?.status === 'live' ? 'border-[#89B56C]/40 bg-[#89B56C]/5' : 'border-gray-200 bg-white'}`}>
              <p className="text-xs text-gray-500">Live 狀態</p>
              {live?.status === 'live' ? (
                <>
                  <p className="mt-1 text-2xl font-bold text-[#5d7d44]">已解鎖 ✓</p>
                  <p className="text-xs text-gray-400">{live.count} 組 · as of {live.asOf} · 確認於 {live.syncedAt?.slice(0, 16).replace('T', ' ')}</p>
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
                確認你已核對代表值方法(中位數、含加成、CN→類別降階),即可解鎖。法律約束力仍以 IR 2025/2621 為準;工具標為指示性。
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
