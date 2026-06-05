// Lead-capture stub (Brief §4, §7.3). Email / booking go through the BACKEND — no
// localStorage/sessionStorage on the client. HubSpot is the intended sink, wired here
// behind a single seam. Until HUBSPOT_TOKEN is provided we validate, log, and return ok.

import type { LeadPayload } from '@/lib/diagnose/types';

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

  // TODO(HubSpot): when process.env.HUBSPOT_TOKEN is set, upsert the contact and attach
  // lead-scoring tags — pool → trial(individual) / BD(enterprise) — plus module and
  // urgencyScore (Brief §4/§7.3). Keep this the only integration point.
  //
  //   const token = process.env.HUBSPOT_TOKEN;
  //   await fetch('https://api.hubapi.com/crm/v3/objects/contacts', { ... });

  console.log('[lead] captured', {
    email,
    pool: payload.pool ?? null,
    module: payload.module ?? 'listed',
    role: payload.role ?? null,
    company: payload.company ?? null,
    score: payload.score ?? null,
    pressureLevel: payload.pressureLevel ?? null,
  });

  return Response.json({ ok: true, pool: payload.pool ?? null });
}
