// Admin lead retrieval. Requires `Authorization: Bearer <ADMIN_TOKEN>`. Returns nothing
// useful unless ADMIN_TOKEN is set AND the caller presents it — leads are not public.

import { listLeads, leadCount, leadStoreConfigured } from '@/lib/diagnose/lead-store';

export async function GET(req: Request): Promise<Response> {
  const admin = process.env.ADMIN_TOKEN;
  if (!admin) {
    return Response.json({ ok: false, error: 'admin_not_configured' }, { status: 503 });
  }

  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token.length === 0 || token !== admin) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

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
