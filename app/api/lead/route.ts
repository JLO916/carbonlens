// Lead-capture endpoint (Brief §4, §7.3). Validates, persists to the backend store, logs.
// NO localStorage/sessionStorage on the client — capture goes through here. HubSpot remains
// the intended downstream sink (wire at the marked seam); meanwhile leads persist to Vercel KV.

import type { LeadPayload } from '@/lib/diagnose/types';
import { persistLead, leadStoreConfigured, type StoredLead } from '@/lib/diagnose/lead-store';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request): Promise<Response> {
  let payload: Partial<LeadPayload>;
  try {
    payload = (await req.json()) as Partial<LeadPayload>;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const email = (payload.email ?? '').trim();
  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const lead: StoredLead = {
    email,
    role: payload.role,
    company: payload.company?.trim() || undefined,
    module: payload.module ?? 'listed',
    pool: payload.pool ?? 'individual',
    score: payload.score,
    pressureLevel: payload.pressureLevel,
    input: payload.input as StoredLead['input'],
    receivedAt: new Date().toISOString(),
  };

  // Persist (no-op + false if KV not configured — capture still succeeds).
  const stored = await persistLead(lead);

  // TODO(HubSpot): when process.env.HUBSPOT_TOKEN is set, also upsert the contact + attach
  // lead-scoring tags (pool → trial/BD), module and score/pressureLevel (§4/§7.3).
  console.log('[lead] captured', {
    email,
    pool: lead.pool,
    module: lead.module,
    role: lead.role ?? null,
    company: lead.company ?? null,
    score: lead.score ?? null,
    pressureLevel: lead.pressureLevel ?? null,
    stored, // true if written to KV
    storeConfigured: leadStoreConfigured(),
  });

  return Response.json({ ok: true, pool: lead.pool, stored });
}
