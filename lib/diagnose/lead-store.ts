// Lead persistence (Brief §7.3: email/booking go through the BACKEND, not localStorage).
// Stores leads in Vercel KV (Upstash Redis) via its REST API using plain fetch — no npm
// dependency. Degrades gracefully: if KV env vars are absent, persistence is a no-op and
// the capture flow still succeeds (lead UX must never fail on a storage error).

import type { LeadPayload } from '@/lib/diagnose/types';

export interface StoredLead extends LeadPayload {
  receivedAt: string; // ISO timestamp, stamped server-side
}

const LEADS_KEY = 'recc:leads';
const MAX_LEADS = 5000;

// Supports both Vercel KV (KV_*) and Upstash Marketplace (UPSTASH_REDIS_*) env naming.
function kvCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function leadStoreConfigured(): boolean {
  return kvCreds() !== null;
}

export async function kvCommand(command: (string | number)[]): Promise<unknown> {
  const c = kvCreds();
  if (!c) throw new Error('kv_not_configured');
  const res = await fetch(c.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`kv_http_${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(`kv_${data.error}`);
  return data.result;
}

/** Persist a lead. Never throws — returns whether it was stored. */
export async function persistLead(lead: StoredLead): Promise<boolean> {
  if (!kvCreds()) return false;
  try {
    await kvCommand(['LPUSH', LEADS_KEY, JSON.stringify(lead)]);
    await kvCommand(['LTRIM', LEADS_KEY, 0, MAX_LEADS - 1]); // cap list size
    return true;
  } catch {
    return false;
  }
}

/** Read the most recent leads (newest first). Throws on KV error — caller handles. */
export async function listLeads(limit = 200): Promise<StoredLead[]> {
  const raw = (await kvCommand(['LRANGE', LEADS_KEY, 0, limit - 1])) as string[];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      try {
        return JSON.parse(s) as StoredLead;
      } catch {
        return null;
      }
    })
    .filter((x): x is StoredLead => x !== null);
}

export async function leadCount(): Promise<number> {
  const n = (await kvCommand(['LLEN', LEADS_KEY])) as number;
  return typeof n === 'number' ? n : 0;
}

/** Delete a specific lead (matched by email + receivedAt). Returns rows removed. */
export async function deleteLead(email: string, receivedAt: string): Promise<number> {
  const raw = (await kvCommand(['LRANGE', LEADS_KEY, 0, -1])) as string[];
  if (!Array.isArray(raw)) return 0;
  let removed = 0;
  for (const s of raw) {
    try {
      const l = JSON.parse(s) as StoredLead;
      if (l.email === email && l.receivedAt === receivedAt) {
        const n = (await kvCommand(['LREM', LEADS_KEY, 0, s])) as number;
        removed += typeof n === 'number' ? n : 0;
      }
    } catch {
      // skip unparseable
    }
  }
  return removed;
}

/** Delete all test leads (email ending @carbonlens.test). Returns rows removed. */
export async function deleteTestLeads(): Promise<number> {
  const raw = (await kvCommand(['LRANGE', LEADS_KEY, 0, -1])) as string[];
  if (!Array.isArray(raw)) return 0;
  let removed = 0;
  for (const s of raw) {
    try {
      const l = JSON.parse(s) as StoredLead;
      if (typeof l.email === 'string' && l.email.endsWith('@carbonlens.test')) {
        const n = (await kvCommand(['LREM', LEADS_KEY, 0, s])) as number;
        removed += typeof n === 'number' ? n : 0;
      }
    } catch {
      // skip
    }
  }
  return removed;
}
