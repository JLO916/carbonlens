// Admin lead retrieval. Requires `Authorization: Bearer <ADMIN_TOKEN>`. Returns nothing
// useful unless ADMIN_TOKEN is set AND the caller presents it — leads are not public.

import { listLeads, leadCount, leadStoreConfigured, deleteLead, deleteTestLeads } from '@/lib/diagnose/lead-store';
import { checkAdmin } from '@/lib/diagnose/admin-auth';

export async function GET(req: Request): Promise<Response> {
  const denied = checkAdmin(req);
  if (denied) return denied;

  if (!leadStoreConfigured()) {
    return Response.json({ ok: true, leads: [], count: 0, note: 'kv_not_configured' });
  }

  try {
    const [leads, count] = await Promise.all([listLeads(200), leadCount()]);
    return Response.json({ ok: true, leads, count });
  } catch {
    return Response.json({ ok: false, error: 'kv_read_failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const denied = checkAdmin(req);
  if (denied) return denied;

  let body: { email?: string; receivedAt?: string; test?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  try {
    let removed = 0;
    if (body.test) {
      removed = await deleteTestLeads();
    } else if (body.email && body.receivedAt) {
      removed = await deleteLead(body.email, body.receivedAt);
    } else {
      return Response.json({ ok: false, error: 'missing_target' }, { status: 400 });
    }
    return Response.json({ ok: true, removed });
  } catch {
    return Response.json({ ok: false, error: 'kv_delete_failed' }, { status: 500 });
  }
}
